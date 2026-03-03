#!/bin/bash
# ═══════════════════════════════════════════
# QuantumOS Charminar Mehfil — Setup Wizard
# v1.2.0 | Powered by Kynetra AI
# ═══════════════════════════════════════════

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${BOLD}QuantumOS — Charminar Mehfil v1.2.0${NC}${CYAN}     ║${NC}"
echo -e "${CYAN}║  Powered by Kynetra AI                   ║${NC}"
echo -e "${CYAN}║  HyperBridge Digital                     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}[1/5]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js 18+ required. Current: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Create .env.local
echo ""
echo -e "${YELLOW}[2/5]${NC} Configuring environment..."

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo -e "${GREEN}✓ Created .env.local from .env.example${NC}"
  echo -e "${YELLOW}  → Edit .env.local with your credentials before running${NC}"
else
  echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}[3/5]${NC} Installing dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Verify project structure
echo ""
echo -e "${YELLOW}[4/5]${NC} Verifying project structure..."

REQUIRED_DIRS=(
  "src/app/admin"
  "src/app/admin/dashboard"
  "src/app/api/kynetra"
  "src/components/admin"
  "src/lib/kynetra"
  "src/styles"
)

ALL_OK=true
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo -e "  ${GREEN}✓${NC} $dir"
  else
    echo -e "  ${RED}✗${NC} $dir ${RED}(missing)${NC}"
    ALL_OK=false
  fi
done

if [ "$ALL_OK" = true ]; then
  echo -e "${GREEN}✓ Project structure verified${NC}"
else
  echo -e "${RED}⚠ Some directories are missing. Run from the project root.${NC}"
fi

# Summary
echo ""
echo -e "${YELLOW}[5/5]${NC} Setup complete!"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "  ${BOLD}Next Steps:${NC}"
echo ""
echo -e "  1. Edit ${CYAN}.env.local${NC} with your credentials:"
echo -e "     - Supabase URL & keys"
echo -e "     - Kynetra API key & endpoint"
echo -e "     - Resend API key (email OTP)"
echo -e "     - Fast2SMS API key (SMS OTP)"
echo ""
echo -e "  2. Start development server:"
echo -e "     ${GREEN}npm run dev${NC}"
echo ""
echo -e "  3. Open ${CYAN}http://localhost:3000${NC}"
echo -e "     Admin: ${CYAN}http://localhost:3000/admin${NC}"
echo ""
echo -e "  Demo login:"
echo -e "     Email: ${CYAN}admin@charminarmehfil.com${NC}"
echo -e "     Pass:  ${CYAN}Charminar@2026!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo ""
