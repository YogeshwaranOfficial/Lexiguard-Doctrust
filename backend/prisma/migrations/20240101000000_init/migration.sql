-- ============================================================
-- LexiGuard Initial Migration
-- Generated for: Azure Database for PostgreSQL (Flexible Server)
-- Run via: cd backend && npm run db:migrate
-- ============================================================

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('Pending', 'Processing', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('Low', 'Medium', 'High');

-- CreateTable: users
CREATE TABLE "users" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email"      TEXT NOT NULL,
    "password"   TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: documents
CREATE TABLE "documents" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "file_name"      TEXT NOT NULL,
    "blob_url"       TEXT NOT NULL,
    "status"         "DocumentStatus" NOT NULL DEFAULT 'Pending',
    "risk_level"     "RiskLevel",
    "extracted_json" JSONB,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex: status lookup (frequently filtered)
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex: risk_level lookup (frequently filtered)
CREATE INDEX "documents_risk_level_idx" ON "documents"("risk_level");

-- CreateIndex: created_at for ordering
CREATE INDEX "documents_created_at_idx" ON "documents"("created_at" DESC);

-- Auto-update updated_at via trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON "documents"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
