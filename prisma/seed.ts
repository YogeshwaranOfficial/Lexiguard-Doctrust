import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding LexiGuard database...");

  // Create demo admin user
  const hashedPassword = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@lexiguard.dev" },
    update: {},
    create: {
      email: "admin@lexiguard.dev",
      password: hashedPassword,
      name: "LexiGuard Admin",
    },
  });
  console.log(`✅ Demo user: ${user.email} / password: demo1234`);

  // Create sample documents
  const sampleDocs = [
    {
      file_name: "NDA-Vendor-Agreement-2024.pdf",
      blob_url: "https://mock-storage.blob.core.windows.net/lexiguard-documents/nda-vendor-2024.pdf",
      status: "Completed" as const,
      risk_level: "High" as const,
      extracted_json: {
        summary: "This NDA contains several high-risk clauses including unlimited indemnification and irrevocable license grants. Immediate legal review required.",
        risk_clauses: [
          { clause: "Unlimited Indemnification", severity: "High", explanation: "No cap on liability exposure.", page: 3 },
          { clause: "Perpetual License Grant", severity: "High", explanation: "License is irrevocable after signing.", page: 5 },
          { clause: "Data Retention Rights", severity: "Medium", explanation: "Vendor retains data for 5 years.", page: 7 },
        ],
        key_terms: ["indemnify", "perpetual license", "irrevocable", "confidential", "intellectual property"],
        confidence_score: 0.94,
        risk_level: "High",
        word_count: 4821,
        flags: ["Unlimited liability exposure", "Irrevocable license grant", "Mandatory arbitration clause"],
      },
    },
    {
      file_name: "MSA-TechPartner-Services.docx",
      blob_url: "https://mock-storage.blob.core.windows.net/lexiguard-documents/msa-techpartner.docx",
      status: "Completed" as const,
      risk_level: "Medium" as const,
      extracted_json: {
        summary: "This MSA presents moderate risk. Data retention provisions and IP assignment language require review before execution.",
        risk_clauses: [
          { clause: "Data Retention Clause", severity: "Medium", explanation: "Broad data usage rights for service improvement.", page: 4 },
          { clause: "IP Assignment", severity: "Medium", explanation: "Work product assignment is broadly worded.", page: 6 },
          { clause: "Payment Terms", severity: "Low", explanation: "Standard Net-30 terms.", page: 2 },
        ],
        key_terms: ["confidential", "data retention", "intellectual property", "assignment", "governing law"],
        confidence_score: 0.87,
        risk_level: "Medium",
        word_count: 6234,
        flags: ["Broad data retention rights", "IP assignment language review recommended"],
      },
    },
    {
      file_name: "Standard-SLA-Agreement.pdf",
      blob_url: "https://mock-storage.blob.core.windows.net/lexiguard-documents/sla-standard.pdf",
      status: "Completed" as const,
      risk_level: "Low" as const,
      extracted_json: {
        summary: "This SLA appears standard and low-risk. Payment terms and notice periods are within industry norms. Routine review advised.",
        risk_clauses: [
          { clause: "Payment Terms", severity: "Low", explanation: "Standard Net-30 with fair late fees.", page: 2 },
          { clause: "Termination Notice", severity: "Low", explanation: "60-day notice is reasonable.", page: 8 },
        ],
        key_terms: ["payment terms", "delivery", "notice period", "renewal", "general terms"],
        confidence_score: 0.92,
        risk_level: "Low",
        word_count: 2109,
        flags: ["Standard payment terms", "Reasonable notice periods"],
      },
    },
    {
      file_name: "Employment-Contract-Draft.pdf",
      blob_url: "https://mock-storage.blob.core.windows.net/lexiguard-documents/employment-draft.pdf",
      status: "Processing" as const,
      risk_level: null,
      extracted_json: null,
    },
    {
      file_name: "Supplier-Agreement-Q1.docx",
      blob_url: "https://mock-storage.blob.core.windows.net/lexiguard-documents/supplier-q1.docx",
      status: "Pending" as const,
      risk_level: null,
      extracted_json: null,
    },
  ];

  for (const doc of sampleDocs) {
    const created = await prisma.document.create({ data: doc as any });
    console.log(`✅ Document: ${created.file_name} [${created.status}]`);
  }

  console.log("\n🎉 Seed complete! Run the app and log in with:");
  console.log("   Email:    admin@lexiguard.dev");
  console.log("   Password: demo1234");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
