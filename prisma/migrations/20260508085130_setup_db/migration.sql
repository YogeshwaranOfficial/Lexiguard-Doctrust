-- DropIndex
DROP INDEX "documents_created_at_idx";

-- DropIndex
DROP INDEX "documents_risk_level_idx";

-- DropIndex
DROP INDEX "documents_status_idx";

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
