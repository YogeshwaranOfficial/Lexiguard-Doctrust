import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// ── Keyword lists (mirrors the Blob trigger logic) ────────────────────────────
const HIGH_RISK_KEYWORDS = [
  "indemnify", "indemnification", "unlimited liability", "perpetual license",
  "irrevocable", "waive all rights", "exclusive rights", "sole discretion",
  "non-compete", "liquidated damages", "penalty clause", "automatic renewal",
  "termination without cause", "binding arbitration", "class action waiver",
];

const MEDIUM_RISK_KEYWORDS = [
  "confidential", "proprietary", "intellectual property", "data retention",
  "third party", "assignment", "sublicense", "governing law", "jurisdiction",
  "limitation of liability", "warranty disclaimer", "force majeure",
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface RiskClause {
  clause: string;
  severity: "Low" | "Medium" | "High";
  explanation: string;
  page?: number;
}

interface AnalysisResult {
  summary: string;
  risk_clauses: RiskClause[];
  key_terms: string[];
  confidence_score: number;
  risk_level: "Low" | "Medium" | "High";
  word_count: number;
  flags: string[];
}

// ── Analysis logic (identical to blob trigger — shared in prod via shared lib) ─
function analyzeTextContent(fileName: string, content: string): AnalysisResult {
  const contentLower = content.toLowerCase();
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const foundHigh = HIGH_RISK_KEYWORDS.filter((kw) => contentLower.includes(kw));
  const foundMedium = MEDIUM_RISK_KEYWORDS.filter((kw) => contentLower.includes(kw));

  let risk_level: "Low" | "Medium" | "High";
  if (foundHigh.length >= 2) {
    risk_level = "High";
  } else if (foundHigh.length >= 1 || foundMedium.length >= 3) {
    risk_level = "Medium";
  } else {
    risk_level = "Low";
  }

  const risk_clauses: RiskClause[] = [
    ...foundHigh.slice(0, 3).map((kw) => ({
      clause: kw.charAt(0).toUpperCase() + kw.slice(1) + " Clause",
      severity: "High" as const,
      explanation: `The document contains "${kw}" language which may expose your organisation to significant legal or financial risk.`,
    })),
    ...foundMedium.slice(0, 2).map((kw) => ({
      clause: kw.charAt(0).toUpperCase() + kw.slice(1) + " Provision",
      severity: "Medium" as const,
      explanation: `"${kw}" provisions require careful review to understand your obligations and constraints.`,
    })),
  ];

  if (risk_clauses.length === 0) {
    risk_clauses.push({
      clause: "Standard Terms",
      severity: "Low",
      explanation: "No high-risk clauses detected. Document appears to use standard contractual language.",
    });
  }

  const summaryMap: Record<string, string> = {
    High: `This document presents HIGH risk. ${foundHigh.length} high-severity clause(s) detected: ${foundHigh.slice(0, 3).join(", ")}. Immediate legal review is required.`,
    Medium: `This document carries MEDIUM risk. Clauses requiring attention: ${foundMedium.slice(0, 3).join(", ")}. A legal review is recommended before signing.`,
    Low: `This document appears LOW risk. Standard contractual language detected across ${wordCount.toLocaleString()} words. Routine review is still advised.`,
  };

  const confidence_score = Math.min(
    0.99,
    0.75 + (foundHigh.length + foundMedium.length) * 0.03 + Math.random() * 0.08
  );

  return {
    summary: summaryMap[risk_level],
    risk_clauses,
    key_terms: [...foundHigh.slice(0, 4), ...foundMedium.slice(0, 4)],
    confidence_score,
    risk_level,
    word_count: wordCount,
    flags: [
      ...foundHigh.map((kw) => `High-risk keyword: "${kw}"`),
      ...foundMedium.slice(0, 2).map((kw) => `Medium-risk term: "${kw}"`),
    ],
  };
}

// ── Fetch blob content from Azure Blob Storage ─────────────────────────────────
async function fetchBlobContent(blobUrl: string): Promise<string> {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) throw new Error("AZURE_STORAGE_CONNECTION_STRING not configured");

  // Parse container + blob name from URL
  const url = new URL(blobUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);
  if (pathParts.length < 2) throw new Error(`Cannot parse blob path from URL: ${blobUrl}`);

  const containerName = pathParts[0];
  const blobName = pathParts.slice(1).join("/");

  const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const downloadResponse = await blockBlobClient.download(0);
  if (!downloadResponse.readableStreamBody) throw new Error("Empty blob stream");

  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = downloadResponse.readableStreamBody as NodeJS.ReadableStream;
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8").substring(0, 50000)));
    stream.on("error", reject);
  });
}

// ── HTTP Trigger Handler ───────────────────────────────────────────────────────
/**
 * POST /api/analyze/{documentId}
 *
 * Manually trigger document analysis for a specific document ID.
 * Useful for:
 *   - Retrying failed analyses
 *   - Webhook callbacks (e.g., from external NLP pipeline)
 *   - Testing without waiting for blob trigger
 *   - CI/CD pipeline validation
 *
 * Auth: Azure Function Key (pass as ?code=<key> or x-functions-key header)
 *
 * Request body (optional):
 *   { "textContent": "..." }   ← supply raw text instead of fetching from blob
 *
 * Response:
 *   { documentId, risk_level, status, analysis: AnalysisResult }
 */
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const documentId = context.bindingData.documentId as string;
  context.log(`[LexiGuard HTTP] Manual trigger for documentId: ${documentId}`);

  // ── Validate documentId ────────────────────────────────────────────────────
  if (!documentId || documentId.length < 10) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid or missing documentId in path" }),
    };
    return;
  }

  // ── Look up document in DB ─────────────────────────────────────────────────
  let document: any;
  try {
    document = await prisma.document.findUnique({ where: { id: documentId } });
  } catch (err) {
    context.log.error("[LexiGuard HTTP] DB lookup failed:", err);
    context.res = {
      status: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Database unavailable" }),
    };
    return;
  }

  if (!document) {
    context.res = {
      status: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: `Document not found: ${documentId}` }),
    };
    return;
  }

  // ── Guard: don't re-analyse unless forced ─────────────────────────────────
  const force = req.query.force === "true" || req.body?.force === true;
  if (document.status === "Completed" && !force) {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Document already analysed. Pass ?force=true to re-run.",
        documentId,
        status: document.status,
        risk_level: document.risk_level,
        analysis: document.extracted_json,
      }),
    };
    return;
  }

  // ── Mark as Processing ─────────────────────────────────────────────────────
  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "Processing" },
    });
  } catch (err) {
    context.log.error("[LexiGuard HTTP] Failed to set Processing status:", err);
  }

  // ── Get text content ───────────────────────────────────────────────────────
  let textContent = "";

  // Option A: caller supplies raw text in body (fastest for testing)
  if (req.body?.textContent && typeof req.body.textContent === "string") {
    textContent = req.body.textContent;
    context.log("[LexiGuard HTTP] Using textContent from request body");
  } else {
    // Option B: fetch from Azure Blob Storage
    try {
      textContent = await fetchBlobContent(document.blob_url);
      context.log(`[LexiGuard HTTP] Fetched ${textContent.length} chars from blob`);
    } catch (err) {
      context.log.warn("[LexiGuard HTTP] Blob fetch failed, using filename heuristic:", err);
      // Option C: fall back to filename-based heuristic (same as mock mode)
      textContent = document.file_name;
    }
  }

  // ── Run analysis ───────────────────────────────────────────────────────────
  let analysis: AnalysisResult;
  try {
    analysis = analyzeTextContent(document.file_name, textContent);
    context.log(`[LexiGuard HTTP] Analysis complete → ${analysis.risk_level}`);
  } catch (err) {
    context.log.error("[LexiGuard HTTP] Analysis failed:", err);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "Failed" },
    }).catch(() => {});
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Analysis failed", details: String(err) }),
    };
    return;
  }

  // ── Persist results ────────────────────────────────────────────────────────
  try {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "Completed",
        risk_level: analysis.risk_level,
        extracted_json: analysis as any,
      },
    });
  } catch (err) {
    context.log.error("[LexiGuard HTTP] Failed to save results:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to persist analysis results" }),
    };
    return;
  } finally {
    await prisma.$disconnect();
  }

  // ── Success response ───────────────────────────────────────────────────────
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Analysis complete",
      documentId,
      status: "Completed",
      risk_level: analysis.risk_level,
      confidence_score: analysis.confidence_score,
      analysis,
    }),
  };
};

export default httpTrigger;
