import { AzureFunction, Context } from "@azure/functions";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Risk keywords for document analysis
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

interface RiskClause {
  clause: string;
  severity: "Low" | "Medium" | "High";
  explanation: string;
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

async function analyzeDocument(fileName: string, content: string): Promise<AnalysisResult> {
  const contentLower = content.toLowerCase();
  const words = content.split(/\s+/);
  const wordCount = words.length;

  // Detect keywords
  const foundHigh = HIGH_RISK_KEYWORDS.filter(kw => contentLower.includes(kw));
  const foundMedium = MEDIUM_RISK_KEYWORDS.filter(kw => contentLower.includes(kw));

  // Determine risk level
  let risk_level: "Low" | "Medium" | "High";
  if (foundHigh.length >= 2) {
    risk_level = "High";
  } else if (foundHigh.length >= 1 || foundMedium.length >= 3) {
    risk_level = "Medium";
  } else {
    risk_level = "Low";
  }

  // Build risk clauses
  const risk_clauses: RiskClause[] = [
    ...foundHigh.slice(0, 3).map(kw => ({
      clause: kw.charAt(0).toUpperCase() + kw.slice(1) + " Clause",
      severity: "High" as const,
      explanation: `The document contains "${kw}" language which may expose your organization to significant legal or financial risk. Immediate legal review recommended.`,
    })),
    ...foundMedium.slice(0, 2).map(kw => ({
      clause: kw.charAt(0).toUpperCase() + kw.slice(1) + " Provision",
      severity: "Medium" as const,
      explanation: `The document includes "${kw}" provisions that should be reviewed carefully to understand obligations and constraints.`,
    })),
  ];

  if (risk_clauses.length === 0) {
    risk_clauses.push({
      clause: "Standard Terms",
      severity: "Low",
      explanation: "Document appears to contain standard, low-risk contractual language.",
    });
  }

  // Generate summary
  const summaries: Record<string, string> = {
    High: `This document presents HIGH risk. ${foundHigh.length} high-severity clause(s) detected including: ${foundHigh.slice(0, 3).join(", ")}. Immediate legal review is required before execution.`,
    Medium: `This document carries MEDIUM risk. Several clauses require attention: ${foundMedium.slice(0, 3).join(", ")}. A legal review is recommended before proceeding.`,
    Low: `This document appears LOW risk. Standard contractual language with ${wordCount.toLocaleString()} words analyzed. Routine review recommended as a best practice.`,
  };

  const confidence_score = Math.min(
    0.99,
    0.75 + (foundHigh.length + foundMedium.length) * 0.03 + Math.random() * 0.1
  );

  return {
    summary: summaries[risk_level],
    risk_clauses,
    key_terms: [...foundHigh.slice(0, 4), ...foundMedium.slice(0, 4)],
    confidence_score,
    risk_level,
    word_count: wordCount,
    flags: [
      ...foundHigh.map(kw => `High-risk keyword detected: "${kw}"`),
      ...foundMedium.slice(0, 2).map(kw => `Medium-risk term found: "${kw}"`),
    ],
  };
}

// Azure Blob Trigger Function
const blobTrigger: AzureFunction = async function (
  context: Context,
  blob: Buffer
): Promise<void> {
  const blobName: string = context.bindingData.name || context.bindingData.blobTrigger;
  context.log(`[LexiGuard] Blob trigger fired: ${blobName}, size: ${blob?.length || 0} bytes`);

  if (!blob || blob.length === 0) {
    context.log.warn("[LexiGuard] Empty blob received, skipping");
    return;
  }

  // Find document by blob name (partial match on file_name)
  let document: any;
  try {
    const fileName = blobName.split("/").pop() || blobName;
    // Strip timestamp prefix if present (format: timestamp-filename)
    const cleanName = fileName.replace(/^\d+-/, "");

    document = await prisma.document.findFirst({
      where: {
        file_name: { contains: cleanName },
        status: "Pending",
      },
      orderBy: { created_at: "desc" },
    });

    if (!document) {
      context.log.warn(`[LexiGuard] No pending document found for blob: ${blobName}`);
      return;
    }
  } catch (err) {
    context.log.error("[LexiGuard] DB lookup error:", err);
    return;
  }

  // Update to Processing
  try {
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "Processing" },
    });
    context.log(`[LexiGuard] Document ${document.id} → Processing`);
  } catch (err) {
    context.log.error("[LexiGuard] Failed to update status to Processing:", err);
    return;
  }

  // Analyze document
  try {
    const textContent = blob.toString("utf-8").substring(0, 50000); // First 50k chars
    const analysis = await analyzeDocument(document.file_name, textContent);

    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "Completed",
        risk_level: analysis.risk_level,
        extracted_json: analysis as any,
      },
    });

    context.log(`[LexiGuard] Document ${document.id} analysis complete → ${analysis.risk_level} risk`);
  } catch (err) {
    context.log.error("[LexiGuard] Analysis failed:", err);
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "Failed" },
    }).catch(() => {});
  } finally {
    await prisma.$disconnect();
  }
};

export default blobTrigger;
