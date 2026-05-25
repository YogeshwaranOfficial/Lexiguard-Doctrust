# 🛡️ LexiGuard — Cloud-Native Document Risk Analysis Platform

A production-ready cloud-native document analysis platform built using modern Azure services and full-stack web technologies. This project demonstrates real-world software engineering practices including event-driven architecture, asynchronous background processing, secure cloud integrations, scalable storage systems, REST API development, and production-grade deployment workflows.

The platform allows users to upload contracts and legal documents, process them asynchronously using Azure Functions, classify risk levels automatically, and generate structured clause-level insights through a responsive web interface.

---

# 🌐 Live Demo

## Frontend Application

Live Application URL

## Backend API

Backend API Base URL

## API Endpoint Example

`/api/documents`

---

# 🚀 Features

## 📄 Document Management

* Upload PDF, DOC, DOCX, and TXT documents
* Drag & drop file upload support
* Real-time upload progress tracking
* Document lifecycle tracking

---

## ⚡ Asynchronous Processing

* Event-driven architecture using Azure Blob Trigger Functions
* Background document analysis
* Automatic processing status updates
* Scalable cloud-native workflow

---

## 🧠 Risk Analysis Engine

* AI-inspired keyword-based document analysis
* Risk classification:

  * Low Risk
  * Medium Risk
  * High Risk
* Clause-level extraction with explanations
* Confidence scoring support

---

## 🔄 Real-Time Updates

* Auto-refreshing UI without page reload
* Processing status polling
* Dynamic dashboard updates

---

## 🔐 Security Features

* JWT authentication
* Secure password hashing
* Azure Key Vault integration
* No hardcoded secrets
* Environment-based configuration
* Rate limiting and secure HTTP headers

---

## ☁️ Cloud-Native Azure Integration

* Azure App Service hosting
* Azure Functions background processing
* Azure Blob Storage for document storage
* Azure PostgreSQL database integration
* Azure Key Vault secret management

---

# 🛠️ Tech Stack

## Frontend

* React 18
* Vite
* TypeScript
* Tailwind CSS
* Axios
* React Router DOM

---

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* JWT Authentication
* Winston Logger

---

## Cloud & Azure Services

* Azure App Service
* Azure Functions
* Azure Blob Storage
* Azure Database for PostgreSQL
* Azure Key Vault

---

## Database

* PostgreSQL
* Prisma ORM
* JSONB document analysis storage

---

## Developer Tools

* Docker
* Docker Compose
* Azure Functions Core Tools
* Git & GitHub
* npm
* REST API Testing
* Environment Variables
* Prisma Migrations

---

# 🏗️ Architecture Overview

```text
Frontend (React + Vite + TypeScript)
                │
                │ HTTPS REST API
                ▼
Backend API (Node.js + Express)
Hosted on Azure App Service
                │
                ├──────────────► Azure Blob Storage
                │                    │
                │                    │ Blob Upload Event
                │                    ▼
                │             Azure Function App
                │          (Blob Trigger Processing)
                │                    │
                ▼                    ▼
Azure PostgreSQL Database ◄──────────┘
(Store Metadata + Analysis Results)

                │
                ▼
Azure Key Vault
(Secrets & Connection Strings)
```

---

# 🔄 Application Workflow

```text
User uploads document
        ↓
Backend uploads file to Azure Blob Storage
        ↓
Metadata stored in PostgreSQL
(status = Pending)
        ↓
Azure Blob Trigger Function executes automatically
        ↓
Document processed asynchronously
        ↓
Risk analysis + metadata extraction completed
        ↓
Database updated with results
(status = Completed)
        ↓
Frontend automatically reflects updates
```

---

# 📂 Project Structure

```text
lexiguard/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── azure-functions/
│   ├── DocumentAnalyzer/
│   ├── host.json
│   └── local.settings.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# ⚙️ Installation & Setup

# 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/lexiguard.git
```

---

# 🔧 Backend Setup

## Navigate to Backend

```bash
cd backend
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
AZURE_STORAGE_CONTAINER_NAME=documents
PORT=3001
```

## Generate Prisma Client

```bash
npx prisma generate
```

## Run Database Migrations

```bash
npx prisma migrate dev
```

## Start Backend

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

---

# 🎨 Frontend Setup

## Navigate to Frontend

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
```

## Start Frontend

```bash
npm run dev
```

---

# ☁️ Azure Deployment Workflow

## Azure Services Used

| Azure Service      | Purpose                     |
| ------------------ | --------------------------- |
| Azure App Service  | Host frontend and backend   |
| Azure Functions    | Background async processing |
| Azure Blob Storage | File/document storage       |
| Azure PostgreSQL   | Structured metadata storage |
| Azure Key Vault    | Secret management           |

---

# 🚀 Deployment Steps

## 1. Create Azure Resource Group

```bash
az group create --name lexiguard-rg --location eastus
```

---

## 2. Configure Azure PostgreSQL

* Create PostgreSQL Flexible Server
* Create database
* Configure firewall rules
* Store connection string in Key Vault

---

## 3. Configure Azure Blob Storage

* Create Storage Account
* Create Blob Container
* Configure secure access

---

## 4. Configure Azure Key Vault

* Store:

  * Database credentials
  * Blob connection strings
  * JWT secrets
  * API keys

---

## 5. Deploy Backend to Azure App Service

```bash
az webapp create
```

---

## 6. Deploy Azure Function App

```bash
func azure functionapp publish
```

---

## 7. Deploy Frontend

Deploy frontend build to Azure App Service or static hosting.

---

# 🔐 Environment Variables Reference

| Variable                          | Description                          |
| --------------------------------- | ------------------------------------ |
| `DATABASE_URL`                    | PostgreSQL connection string         |
| `JWT_SECRET`                      | JWT signing secret                   |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string |
| `AZURE_STORAGE_CONTAINER_NAME`    | Blob container name                  |
| `AZURE_KEY_VAULT_URL`             | Azure Key Vault URL                  |
| `PORT`                            | Backend server port                  |
| `VITE_API_URL`                    | Frontend API URL                     |

---

# 📡 API Reference

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

---

## Documents

```http
POST /api/documents/upload
GET /api/documents
GET /api/documents/:id
DELETE /api/documents/:id
```

---

## Health Check

```http
GET /health
```

---

# 🧠 Concepts & Skills Demonstrated

This project demonstrates practical understanding of:

---

## Cloud Engineering

* Azure cloud-native architecture
* Event-driven systems
* Asynchronous processing
* Serverless computing
* Scalable application design

---

## Frontend Engineering

* React component architecture
* State management
* API integration
* Responsive UI design
* Real-time polling

---

## Backend Engineering

* REST API development
* Express middleware architecture
* Authentication & authorization
* Error handling
* Logging practices

---

## Database Engineering

* Relational database modeling
* Prisma ORM integration
* PostgreSQL JSONB usage
* Database migrations

---

## Security Engineering

* Secret management using Azure Key Vault
* JWT authentication
* Secure environment configurations
* Password hashing
* Managed identity concepts

---

## DevOps & Deployment

* Azure deployment workflows
* Cloud resource configuration
* Docker-based local development
* Environment variable management
* Production deployment handling

---

# 📊 Database Schema

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  file_name TEXT,
  blob_url TEXT,
  status TEXT,
  risk_level TEXT,
  extracted_json JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

# 🔒 Security Practices

* No hardcoded credentials
* Secrets stored securely in Azure Key Vault
* JWT authentication with expiration
* Password hashing using bcrypt
* HTTPS-secured communication
* Secure cloud configuration
* Environment-based secrets management

---

# 🔮 Future Enhancements

Planned future improvements:

* AI-powered NLP analysis
* Azure Cognitive Services integration
* OpenAI integration
* Real-time WebSocket updates
* Role-Based Access Control (RBAC)
* Docker containerization
* CI/CD with GitHub Actions
* Redis caching
* File versioning
* Multi-tenant architecture
* Unit & integration testing
* Monitoring with Azure Application Insights

---

# 🤝 Contributing

Contributions, improvements, and suggestions are welcome.

Fork → Clone → Create Branch → Commit → Push → Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Developer

Developed by Yogeshwaran S

GitHub Repository: LexiGuard — Cloud-Native Document Risk Analysis Platform
