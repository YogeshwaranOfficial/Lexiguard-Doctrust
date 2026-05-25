# 🛡️ LexiGuard — UFours DocTrust Platform

> **Cloud-Native Document Risk Analysis Platform**  
> Upload contracts and legal documents → Azure processes them asynchronously → AI classifies risk levels with extracted insights.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Development Setup](#-local-development-setup)
- [Azure Configuration Guide](#️-azure-configuration-guide)
- [Environment Variables Reference](#-environment-variables-reference)
- [API Reference](#-api-reference)
- [Deployment to Azure](#-deployment-to-azure)
- [How It Works](#-how-it-works)

---

## 🎯 Project Overview

LexiGuard is a secure, event-driven document risk analysis platform built on Azure cloud-native services. Companies upload NDAs, client agreements, and compliance documents — the platform automatically analyzes them asynchronously and classifies risk levels (Low / Medium / High) with detailed clause-level insights.

### Key Features

- **Drag & drop document upload** with real-time progress
- **Asynchronous AI analysis** via Azure Blob Trigger Functions
- **Risk classification** — Low (green), Medium (yellow), High (red)
- **Clause-level extraction** with severity ratings and explanations
- **Auto-refreshing UI** — results appear without page reload
- **JWT authentication** with secure session management
- **Azure Key Vault** integration for zero hardcoded secrets
- **Production-grade** logging, error handling, and rate limiting

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                React + Vite + TypeScript + Tailwind             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS REST API
┌──────────────────────────▼──────────────────────────────────────┐
│                   AZURE APP SERVICE                             │
│              Node.js + Express + Prisma ORM                     │
│  POST /upload   GET /documents   GET /documents/:id             │
└──────┬──────────────────────────────────────┬───────────────────┘
       │ Upload File                           │ Save Metadata
┌──────▼──────────┐                 ┌──────────▼──────────────────┐
│  AZURE BLOB     │                 │  AZURE DATABASE             │
│  STORAGE        │                 │  FOR POSTGRESQL             │
│  (Documents)    │                 │  (Metadata + Results)       │
└──────┬──────────┘                 └─────────────────────────────┘
       │ Blob Trigger (event-driven)           ▲
┌──────▼──────────────────────────────────────┤
│           AZURE FUNCTIONS                   │
│       DocumentAnalyzer (Blob Trigger)       │
│  1. Read blob content                       │
│  2. NLP keyword extraction                  │
│  3. Risk scoring (Low/Medium/High)          │
│  4. Update PostgreSQL with results ─────────┘
└─────────────────────────────────────────────┘
                    │ Secrets
┌───────────────────▼─────────────────────────┐
│           AZURE KEY VAULT                   │
│  DB credentials, Blob connection string,    │
│  JWT secret, API keys                       │
└─────────────────────────────────────────────┘
```

### Event Flow

```
User uploads document
        ↓
Backend: upload to Azure Blob + save DB record (status=Pending)
        ↓
Azure Function: Blob Trigger fires automatically
        ↓
Function updates status → Processing
        ↓
Function runs NLP analysis (keyword extraction + risk scoring)
        ↓
Function saves results to PostgreSQL (status=Completed)
        ↓
Frontend polling detects change → UI updates automatically
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, Prisma ORM |
| Database | PostgreSQL (Azure Database for PostgreSQL) |
| File Storage | Azure Blob Storage |
| Async Processing | Azure Functions (Blob Trigger) |
| Secrets | Azure Key Vault |
| Hosting | Azure App Service |
| Auth | JWT (JSON Web Tokens) |
| Logging | Winston |

---

## 📁 Project Structure

```
lexiguard/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Layout.tsx       # Sidebar + top bar
│   │   │   └── ui/
│   │   │       ├── UploadZone.tsx   # Drag & drop uploader
│   │   │       ├── RiskBadge.tsx    # Colored risk label
│   │   │       ├── StatusBadge.tsx  # Processing status
│   │   │       ├── StatCard.tsx     # Dashboard metric cards
│   │   │       ├── ConfidenceBar.tsx # Analysis confidence %
│   │   │       └── SkeletonRow.tsx  # Loading skeleton
│   │   ├── hooks/
│   │   │   ├── useDocuments.ts     # List + auto-polling hook
│   │   │   └── useDocument.ts      # Single doc + polling hook
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx   # Upload + stats + recent docs
│   │   │   ├── DocumentsPage.tsx   # Filterable document table
│   │   │   ├── DocumentDetailPage.tsx # Full analysis view
│   │   │   └── LoginPage.tsx       # Auth page
│   │   ├── types/index.ts          # TypeScript interfaces
│   │   └── utils/api.ts            # Axios API client
│   └── package.json
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── index.ts               # Server entry point
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT middleware
│   │   │   └── errorHandler.ts    # Global error handler
│   │   ├── routes/
│   │   │   ├── documents.ts       # /api/documents endpoints
│   │   │   └── auth.ts            # /api/auth endpoints
│   │   ├── services/
│   │   │   └── documentAnalyzer.ts # NLP mock analysis logic
│   │   └── utils/
│   │       ├── azureBlob.ts       # Azure Blob Storage client
│   │       ├── keyVault.ts        # Azure Key Vault client
│   │       ├── prisma.ts          # Prisma singleton
│   │       └── logger.ts          # Winston logger
│   └── package.json
│
├── azure-functions/             # Azure Functions app
│   ├── DocumentAnalyzer/
│   │   ├── index.ts              # Blob trigger function
│   │   └── function.json         # Trigger binding config
│   ├── host.json                 # Functions host config
│   └── local.settings.json       # Local dev settings
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Demo data seeder
│
├── docker-compose.yml            # Local PostgreSQL + Azurite
├── .gitignore
└── README.md
```

---

## 💻 Local Development Setup

### Prerequisites

- **Node.js** 20+ and **npm** 9+
- **Docker Desktop** (for local PostgreSQL + Azurite)
- **Azure Functions Core Tools** v4 (optional, for running functions locally)

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

---

### Step 1 — Start Local Services

```bash
# From project root — starts PostgreSQL on :5432 and Azurite on :10000
docker compose up -d

# Verify they're running
docker compose ps
```

---

### Step 2 — Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env — the defaults work with docker-compose as-is

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed with demo data (optional)
npm run db:seed

# Start development server
npm run dev
# → API running at http://localhost:3001
```

---

### Step 3 — Set Up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → UI running at http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `localhost:3001` automatically.

---

### Step 4 — (Optional) Run Azure Functions Locally

```bash
cd azure-functions

npm install

# Copy and configure local settings
# Edit local.settings.json with your Azure Storage connection string

# Start functions runtime
npm start
# → Functions running at http://localhost:7071
```

---

### Demo Login

After seeding, log in with:
- **Email:** `admin@lexiguard.dev`
- **Password:** `demo1234`

Or register any new account from the login page.

---

## ☁️ Azure Configuration Guide

### 1. Create Resource Group

```bash
az group create --name lexiguard-rg --location eastus
```

---

### 2. Azure Database for PostgreSQL

```bash
az postgres flexible-server create \
  --resource-group lexiguard-rg \
  --name lexiguard-db \
  --location eastus \
  --admin-user lexiadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15

# Create the database
az postgres flexible-server db create \
  --resource-group lexiguard-rg \
  --server-name lexiguard-db \
  --database-name lexiguard

# Allow Azure services to connect
az postgres flexible-server firewall-rule create \
  --resource-group lexiguard-rg \
  --name lexiguard-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

**Connection string format:**
```
postgresql://lexiadmin:YourSecurePassword123!@lexiguard-db.postgres.database.azure.com:5432/lexiguard?sslmode=require
```

---

### 3. Azure Blob Storage

```bash
# Create storage account
az storage account create \
  --name lexiguardstorage \
  --resource-group lexiguard-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# Create container
az storage container create \
  --name lexiguard-documents \
  --account-name lexiguardstorage \
  --public-access blob

# Get connection string (save this for Key Vault)
az storage account show-connection-string \
  --name lexiguardstorage \
  --resource-group lexiguard-rg \
  --query connectionString -o tsv
```

---

### 4. Azure Key Vault

```bash
# Create Key Vault
az keyvault create \
  --name lexiguard-vault \
  --resource-group lexiguard-rg \
  --location eastus

# Store secrets
az keyvault secret set --vault-name lexiguard-vault \
  --name "database-url" \
  --value "postgresql://lexiadmin:YourSecurePassword123!@lexiguard-db.postgres.database.azure.com:5432/lexiguard?sslmode=require"

az keyvault secret set --vault-name lexiguard-vault \
  --name "azure-storage-connection-string" \
  --value "DefaultEndpointsProtocol=https;AccountName=lexiguardstorage;..."

az keyvault secret set --vault-name lexiguard-vault \
  --name "jwt-secret" \
  --value "your-super-secure-random-jwt-secret-min-64-chars"
```

---

### 5. Azure App Service (Backend API)

```bash
# Create App Service Plan
az appservice plan create \
  --name lexiguard-plan \
  --resource-group lexiguard-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name lexiguard-api \
  --resource-group lexiguard-rg \
  --plan lexiguard-plan \
  --runtime "NODE:20-lts"

# Enable system-assigned managed identity
az webapp identity assign \
  --name lexiguard-api \
  --resource-group lexiguard-rg

# Grant Key Vault access to the managed identity
PRINCIPAL_ID=$(az webapp identity show --name lexiguard-api --resource-group lexiguard-rg --query principalId -o tsv)
az keyvault set-policy \
  --name lexiguard-vault \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list

# Configure app settings
az webapp config appsettings set \
  --name lexiguard-api \
  --resource-group lexiguard-rg \
  --settings \
    NODE_ENV=production \
    AZURE_KEY_VAULT_URL=https://lexiguard-vault.vault.azure.net/ \
    AZURE_STORAGE_CONTAINER_NAME=lexiguard-documents \
    FRONTEND_URL=https://lexiguard-ui.azurewebsites.net \
    PORT=3001

# Deploy backend
cd backend
npm run build
zip -r ../api-deploy.zip dist/ package.json node_modules/
az webapp deployment source config-zip \
  --name lexiguard-api \
  --resource-group lexiguard-rg \
  --src ../api-deploy.zip
```

---

### 6. Azure App Service (Frontend)

```bash
# Build frontend
cd frontend
echo "VITE_API_URL=https://lexiguard-api.azurewebsites.net" > .env.production
npm run build

# Create frontend Web App
az webapp create \
  --name lexiguard-ui \
  --resource-group lexiguard-rg \
  --plan lexiguard-plan \
  --runtime "NODE:20-lts"

# Deploy (serve with a static file server or configure SPA routing)
cd dist
zip -r ../../ui-deploy.zip .
az webapp deployment source config-zip \
  --name lexiguard-ui \
  --resource-group lexiguard-rg \
  --src ../../ui-deploy.zip
```

---

### 7. Azure Functions

```bash
# Create Function App
az functionapp create \
  --name lexiguard-functions \
  --resource-group lexiguard-rg \
  --storage-account lexiguardstorage \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4

# Enable managed identity + Key Vault access (same as App Service above)
az functionapp identity assign \
  --name lexiguard-functions \
  --resource-group lexiguard-rg

FUNC_PRINCIPAL=$(az functionapp identity show --name lexiguard-functions --resource-group lexiguard-rg --query principalId -o tsv)
az keyvault set-policy --name lexiguard-vault --object-id $FUNC_PRINCIPAL --secret-permissions get list

# Configure settings
az functionapp config appsettings set \
  --name lexiguard-functions \
  --resource-group lexiguard-rg \
  --settings \
    AZURE_KEY_VAULT_URL=https://lexiguard-vault.vault.azure.net/ \
    AZURE_STORAGE_CONTAINER_NAME=lexiguard-documents

# Deploy
cd azure-functions
npm run build
func azure functionapp publish lexiguard-functions
```

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | Yes | `development` or `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 32-char random string for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `AZURE_STORAGE_CONNECTION_STRING` | Prod | Azure Blob Storage connection string |
| `AZURE_STORAGE_CONTAINER_NAME` | Yes | Container name (default: `lexiguard-documents`) |
| `AZURE_KEY_VAULT_URL` | Prod | `https://<vault-name>.vault.azure.net/` |
| `FRONTEND_URL` | Yes | Frontend origin for CORS |

> **Production note:** When `AZURE_KEY_VAULT_URL` is set, the app automatically loads `DATABASE_URL`, `AZURE_STORAGE_CONNECTION_STRING`, and `JWT_SECRET` from Key Vault. Local env vars are only fallbacks.

### Azure Functions (`azure-functions/local.settings.json`)

| Variable | Description |
|----------|-------------|
| `AzureWebJobsStorage` | Use `UseDevelopmentStorage=true` locally |
| `AZURE_STORAGE_CONNECTION_STRING` | Blob Storage connection string |
| `DATABASE_URL` | PostgreSQL connection string |
| `AZURE_KEY_VAULT_URL` | Key Vault URL (production) |

---

## 📡 API Reference

### Authentication

```
POST /api/auth/register
Body: { name, email, password }
Returns: { token, user }

POST /api/auth/login
Body: { email, password }
Returns: { token, user }
```

### Documents

```
POST /api/documents/upload
Content-Type: multipart/form-data
Field: document (file)
Returns: { document: { id, file_name, status, created_at } }

GET /api/documents
Query: ?status=Completed&risk_level=High&page=1&limit=20
Returns: { documents: [...], pagination: { total, page, limit, totalPages } }

GET /api/documents/:id
Returns: full Document with extracted_json

DELETE /api/documents/:id
Returns: { message }

GET /api/documents/stats/overview
Returns: { total, byStatus, byRisk }

GET /health
Returns: { status, timestamp, service }
```

### Document Schema

```json
{
  "id": "uuid",
  "file_name": "NDA-Vendor-2024.pdf",
  "blob_url": "https://...",
  "status": "Pending | Processing | Completed | Failed",
  "risk_level": "Low | Medium | High | null",
  "extracted_json": {
    "summary": "...",
    "risk_clauses": [
      { "clause": "...", "severity": "High", "explanation": "...", "page": 3 }
    ],
    "key_terms": ["indemnify", "perpetual license"],
    "confidence_score": 0.94,
    "risk_level": "High",
    "word_count": 4821,
    "flags": ["Unlimited liability exposure"]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:45Z"
}
```

---

## 🚀 How It Works

### Mock Mode (Local Development)

When `AZURE_STORAGE_CONNECTION_STRING` is not set, the backend runs in **mock mode**:
- File uploads return a fake blob URL (no actual Azure required)
- Document analysis still runs fully (the `documentAnalyzer` service)
- PostgreSQL is still required — use `docker compose up -d` to start it
- The async analysis triggers in-process (simulating what Azure Functions would do)

### Analysis Logic

The document analyzer (`backend/src/services/documentAnalyzer.ts`) uses keyword-based NLP:

| Risk | Trigger |
|------|---------|
| **High** | Detects keywords like `indemnify`, `irrevocable`, `perpetual license`, `binding arbitration` |
| **Medium** | Detects `confidential`, `data retention`, `IP assignment`, `governing law` |
| **Low** | No high/medium keywords found |

In production, replace this with a real NLP service (Azure Cognitive Services, OpenAI, etc.).

### Real-time Updates

The frontend polls for changes every **3 seconds** when any document is in `Pending` or `Processing` state, and stops automatically once all documents reach a terminal state (`Completed` or `Failed`). This is implemented in `useDocuments.ts` and `useDocument.ts`.

---

## 📊 Database Schema

```sql
-- documents table
CREATE TABLE documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name      TEXT NOT NULL,
  blob_url       TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'Pending',  -- Pending|Processing|Completed|Failed
  risk_level     TEXT,                              -- Low|Medium|High|NULL
  extracted_json JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- users table
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,           -- bcrypt hashed
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Run migrations:
```bash
cd backend
npm run db:migrate    # Applies schema to database
npm run db:generate   # Regenerates Prisma client
npm run db:seed       # Inserts demo data
npm run db:studio     # Opens Prisma Studio GUI at localhost:5555
```

---

## 🔒 Security Notes

- **No hardcoded secrets** — all sensitive values via environment variables or Key Vault
- **Passwords** are bcrypt-hashed (cost factor 12)
- **JWT tokens** expire in 7 days; stored only in `localStorage`
- **Helmet.js** sets secure HTTP headers
- **Rate limiting** — 100 requests per 15 minutes per IP
- **File validation** — only PDF, DOC, DOCX, TXT under 20MB accepted
- **CORS** — locked to the configured `FRONTEND_URL`
- **Managed Identity** — App Service and Functions use Azure Managed Identity (no stored credentials)

---

*Built for UFours DocTrust — Cloud-Native Document Risk Platform*
