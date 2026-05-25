#!/usr/bin/env bash
# ============================================================
# LexiGuard — Local Development Startup Script
# Usage: bash start-dev.sh
# ============================================================
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${CYAN}[LexiGuard]${NC} $1"; }
ok()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn(){ echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════╗${NC}"
echo -e "${CYAN}║   LexiGuard Dev Environment      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════╝${NC}"
echo ""

# ── Check prerequisites ────────────────────────────────────────────────────────
log "Checking prerequisites..."

command -v node >/dev/null 2>&1 || err "Node.js not found. Install Node.js 20+ from https://nodejs.org"
command -v npm  >/dev/null 2>&1 || err "npm not found"
command -v docker >/dev/null 2>&1 && HAS_DOCKER=true || { warn "Docker not found — skipping container startup"; HAS_DOCKER=false; }

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[[ $NODE_VER -ge 18 ]] || err "Node.js 18+ required (found v$NODE_VER)"
ok "Node.js $(node -v) detected"

# ── Start Docker services ──────────────────────────────────────────────────────
if [[ "$HAS_DOCKER" == "true" ]]; then
  log "Starting PostgreSQL + Azurite via Docker Compose..."
  docker compose up -d --quiet-pull
  ok "Docker services started (PostgreSQL :5432, Azurite :10000)"
  sleep 2
else
  warn "Skipping Docker — ensure PostgreSQL is running at localhost:5432"
fi

# ── Backend setup ──────────────────────────────────────────────────────────────
log "Setting up backend..."
cd backend

if [[ ! -f ".env" ]]; then
  cp .env.example .env
  warn "Created backend/.env from .env.example — edit it before proceeding"
fi

if [[ ! -d "node_modules" ]]; then
  log "Installing backend dependencies..."
  npm install --silent
fi

log "Generating Prisma client..."
npx prisma generate --schema=../prisma/schema.prisma --quiet 2>/dev/null || true

log "Running database migrations..."
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d= -f2-)
if [[ -n "$DATABASE_URL" && "$DATABASE_URL" != *"username:password"* ]]; then
  npx prisma migrate deploy --schema=../prisma/schema.prisma 2>/dev/null \
    && ok "Migrations applied" \
    || warn "Migration failed — DB may not be running yet (safe to ignore on first run)"
else
  warn "DATABASE_URL not configured — skipping migration"
fi

cd ..

# ── Frontend setup ─────────────────────────────────────────────────────────────
log "Setting up frontend..."
cd frontend

if [[ ! -d "node_modules" ]]; then
  log "Installing frontend dependencies..."
  npm install --silent
fi

cd ..

# ── Launch servers ─────────────────────────────────────────────────────────────
log "Launching backend and frontend..."
echo ""
ok "Backend  → http://localhost:3001"
ok "Frontend → http://localhost:5173"
ok "API docs → http://localhost:3001/health"
echo ""
warn "Press Ctrl+C to stop all servers"
echo ""

# Start both concurrently
(cd backend  && npm run dev) &
BACKEND_PID=$!

sleep 2

(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both
trap "echo ''; log 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID $FRONTEND_PID
