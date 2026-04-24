#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║           🎬  RUNWAY AI CREATIVE PLATFORM  🎬         ║"
echo "║         AI-Powered Creative Tools Platform            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SERVER_PORT=${SERVER_PORT:-3001}
CLIENT_PORT=${CLIENT_PORT:-5173}

# Kill processes on used ports
echo -e "${YELLOW}🔧 Cleaning up ports $SERVER_PORT and $CLIENT_PORT...${NC}"
lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$CLIENT_PORT | xargs kill -9 2>/dev/null || true
sleep 1

# Check PostgreSQL
echo -e "${CYAN}🐘 Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}PostgreSQL not found. Please install PostgreSQL.${NC}"
  exit 1
fi

# Create database if not exists
echo -e "${CYAN}📦 Setting up database...${NC}"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'runway_db'" | grep -q 1 || \
  psql -U postgres -c "CREATE DATABASE runway_db" 2>/dev/null || true

# Install server dependencies
echo -e "${BLUE}📥 Installing server dependencies...${NC}"
cd "$PROJECT_DIR/server"
if [ ! -d "node_modules" ]; then
  npm install
else
  echo -e "${GREEN}  Server dependencies already installed.${NC}"
fi

# Install client dependencies
echo -e "${BLUE}📥 Installing client dependencies...${NC}"
cd "$PROJECT_DIR/client"
if [ ! -d "node_modules" ]; then
  npm install
else
  echo -e "${GREEN}  Client dependencies already installed.${NC}"
fi

# Seed database
echo -e "${PURPLE}🌱 Seeding database...${NC}"
cd "$PROJECT_DIR/server"
node seed.js

# Start server with hot reload (nodemon or node --watch)
echo -e "${GREEN}🚀 Starting server on port $SERVER_PORT...${NC}"
cd "$PROJECT_DIR/server"
if command -v npx &> /dev/null; then
  npx --yes nodemon index.js &
else
  node --watch index.js &
fi
SERVER_PID=$!

# Wait for server to be ready
echo -e "${CYAN}⏳ Waiting for server...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:$SERVER_PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is ready!${NC}"
    break
  fi
  sleep 1
done

# Start client with hot reload (Vite)
echo -e "${GREEN}🚀 Starting client on port $CLIENT_PORT...${NC}"
cd "$PROJECT_DIR/client"
npm run dev &
CLIENT_PID=$!

sleep 3

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                  🎬  ALL SYSTEMS GO  🎬               ║"
echo "║                                                       ║"
echo "║   Frontend:  http://localhost:$CLIENT_PORT              ║"
echo "║   Backend:   http://localhost:$SERVER_PORT               ║"
echo "║                                                       ║"
echo "║   Login:     admin@runway.com / admin123              ║"
echo "║                                                       ║"
echo "║   Press Ctrl+C to stop all services                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
  kill $SERVER_PID 2>/dev/null || true
  kill $CLIENT_PID 2>/dev/null || true
  lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
  lsof -ti:$CLIENT_PORT | xargs kill -9 2>/dev/null || true
  echo -e "${GREEN}👋 Goodbye!${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
