#!/bin/bash
# Keep Medusa services running 24/7
# Usage: chmod +x keep-services-running.sh && ./keep-services-running.sh

PROJECT_DIR="/Users/rp/ata-medusa-store"
LOG_DIR="/tmp/medusa-logs"
mkdir -p "$LOG_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Medusa Service Monitor ===${NC}"
echo "Project: $PROJECT_DIR"
echo "Logs: $LOG_DIR"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Function to check and start services
start_services() {
    cd "$PROJECT_DIR"
    
    # Kill old processes
    pkill -f "npm run dev" 2>/dev/null
    pkill -f "medusa develop" 2>/dev/null
    sleep 2
    
    # Start new services
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] Starting services...${NC}"
    npm run dev > "$LOG_DIR/dev.log" 2>&1 &
    
    sleep 15
    
    # Check if services are responding
    if curl -s 'http://localhost:9000/store/products' > /dev/null 2>&1; then
        echo -e "${GREEN}[$(date '+%H:%M:%S')] Backend is running ✓${NC}"
    else
        echo -e "${RED}[$(date '+%H:%M:%S')] Backend is NOT responding${NC}"
    fi
    
    if curl -s 'http://localhost:8000/' > /dev/null 2>&1; then
        echo -e "${GREEN}[$(date '+%H:%M:%S')] Storefront is running ✓${NC}"
    else
        echo -e "${YELLOW}[$(date '+%H:%M:%S')] Storefront is still loading...${NC}"
    fi
}

# Initial startup
start_services

# Monitor loop
while true; do
    sleep 30
    
    # Check backend
    if ! curl -s 'http://localhost:9000/store/products' > /dev/null 2>&1; then
        echo -e "${RED}[$(date '+%H:%M:%S')] Backend DOWN - restarting${NC}"
        start_services
    fi
    
    # Check storefront
    if ! curl -s 'http://localhost:8000/' > /dev/null 2>&1; then
        echo -e "${RED}[$(date '+%H:%M:%S')] Storefront DOWN - restarting${NC}"
        start_services
    fi
done
