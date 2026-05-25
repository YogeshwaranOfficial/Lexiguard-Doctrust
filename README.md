# 🛡️ LexiGuard — Cloud-Native Document Risk Analysis Platform

A production-ready full-stack document risk analysis platform built using modern cloud-native architecture, scalable backend services, secure authentication workflows, and real-world deployment practices.

LexiGuard allows users to upload legal or business documents, perform automated risk analysis, classify document risk levels, and manage document processing workflows through a modern responsive dashboard.

The project demonstrates practical software engineering concepts including REST API development, Prisma ORM workflows, PostgreSQL integration, JWT authentication, asynchronous processing architecture, cloud deployment, and production-grade application structuring.

---

# 🌐 Live Demo

## Frontend Application

🚀 Live Frontend:

[LexiGuard Frontend](https://lexiguard-doctrust.vercel.app/)

---

## Backend API

⚙️ Live Backend API:

[LexiGuard Backend API](https://lexiguard-doctrust-backend.onrender.com)

---

## Health Check Endpoint

```http
GET /health
```

Example:

```http
https://lexiguard-doctrust-backend.onrender.com/health
```

---

# 🚀 Features

## 📄 Document Management

* Upload PDF, DOC, DOCX, and TXT files
* Drag-and-drop upload support
* Real-time upload progress tracking
* Document lifecycle management
* Persistent document metadata storage

---

## 🧠 Risk Analysis Engine

* Automated document analysis
* Risk classification system:

  * Low Risk
  * Medium Risk
  * High Risk
* Structured JSON-based analysis results
* Clause extraction architecture
* Extensible AI-ready processing pipeline

---

## 🔐 Authentication & Security

* JWT-based authentication
* Secure password hashing using bcrypt
* Protected API routes
* Rate limiting
* Helmet security middleware
* Environment variable-based configuration
* CORS protection
* Secure HTTP headers

---

## ⚡ Backend Architecture

* RESTful API architecture
* Express middleware architecture
* Modular route structure
* Centralized error handling
* Structured logging using Winston
* Prisma ORM integration
* PostgreSQL relational database integration

---

## ☁️ Cloud Deployment

### Current Deployment

| Service  | Platform          |
| -------- | ----------------- |
| Frontend | Vercel            |
| Backend  | Render            |
| Database | PostgreSQL / Neon |

---

## 🔮 Planned Azure Cloud Integration

The project architecture is intentionally designed to support future Azure cloud-native integration including:

* Azure Blob Storage
* Azure Functions
* Azure PostgreSQL
* Azure Key Vault
* Event-driven background processing
* Serverless document workflows

This enables the platform to evolve into a fully scalable enterprise-grade cloud-native document processing system.

---

# 🛠️ Tech Stack

## Frontend

* React 18
* Vite
* TypeScript
* Tailwind CSS
* Axios
* React Router DOM
* React Hot Toast

---

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* JWT Authentication
* Winston Logger
* Multer File Upload

---

## Database

* PostgreSQL
* Prisma ORM
* JSON-based analysis storage

---

## Deployment & DevOps

* Vercel
* Render
* Neon PostgreSQL
* GitHub
* Prisma Migrations
* Environment Variables
* REST API Architecture

---

# 🏗️ Architecture Overview

```text
Frontend (React + Vite + TypeScript)
                │
                │ HTTPS REST API
                ▼
Backend API (Node.js + Express)
Hosted on Render
                │
                ▼
PostgreSQL Database (Neon)
                │
                ▼
Prisma ORM
```

---

# 🔄 Application Workflow

```text
User uploads document
        ↓
Frontend sends multipart/form-data request
        ↓
Backend validates request
        ↓
Document metadata stored in PostgreSQL
        ↓
Risk analysis processing executes
        ↓
Analysis result stored as JSON
        ↓
Frontend fetches updated document state
        ↓
Dashboard updates automatically
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
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
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
├── .gitignore
└── README.md
```

---

# ⚙️ Local Development Setup

# 1️⃣ Clone Repository

```bash
git clone https://github.com/YogeshwaranOfficial/Lexiguard-Doctrust.git
```

---

# 🔧 Backend Setup

## Navigate to Backend

```bash
cd backend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside backend:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173
PORT=3001
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Database Migrations

```bash
npx prisma migrate dev
```

---

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

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside frontend:

```env
VITE_API_URL=http://localhost:3001
```

---

## Start Frontend

```bash
npm run dev
```

---

# 🚀 Deployment Configuration

## Frontend (Vercel)

### Environment Variables

```env
VITE_API_URL=https://lexiguard-doctrust-backend.onrender.com
```

---

## Backend (Render)

### Build Command

```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Start Command

```bash
npm start
```

---

# 🗄️ Prisma Migration Workflow

## Generate Prisma Client

```bash
npx prisma generate
```

Purpose:

* Generates Prisma client code from `schema.prisma`
* Used inside application runtime

---

## Create Migration

```bash
npx prisma migrate dev --name init
```

Purpose:

* Creates migration SQL files
* Updates database schema
* Tracks schema history

---

## Deploy Production Migrations

```bash
npx prisma migrate deploy
```

Purpose:

* Applies existing migrations safely in production

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

# 🧠 Skills Demonstrated

## Frontend Engineering

* React architecture
* TypeScript integration
* API communication
* State handling
* File upload workflows
* Responsive UI development

---

## Backend Engineering

* REST API design
* Middleware architecture
* Authentication systems
* Error handling
* Logging systems
* File handling
* Prisma ORM integration

---

## Database Engineering

* PostgreSQL schema design
* Prisma migrations
* JSON data storage
* Relational modeling

---

## Cloud & DevOps

* Production deployment
* Render deployment workflows
* Vercel deployment workflows
* Environment variable management
* CI-ready project structure
* Cloud database integration

---

## Security Engineering

* JWT authentication
* Password hashing
* Secure headers
* Rate limiting
* CORS handling
* Secure environment configuration

---

# 🔒 Security Practices

* No hardcoded secrets
* Environment variable isolation
* JWT expiration handling
* Password hashing using bcrypt
* Secure API middleware
* CORS origin validation
* Rate limiting protection

---

# 🔮 Future Enhancements

Planned improvements:

* Azure Blob Storage integration
* Azure Functions background processing
* Azure Key Vault integration
* AI-powered NLP analysis
* OpenAI integration
* Real-time WebSocket updates
* RBAC authorization
* Docker containerization
* GitHub Actions CI/CD
* Redis caching
* Unit & integration testing
* Monitoring & observability
* Multi-tenant architecture

---

# 🤝 Contributing

Contributions and improvements are welcome.

```text
Fork → Clone → Create Branch → Commit → Push → Pull Request
```

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Developer

Developed by Yogeshwaran S

## GitHub Repository

[LexiGuard GitHub Repository](https://github.com/YogeshwaranOfficial/Lexiguard-Doctrust)

---


