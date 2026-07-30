#!/bin/bash

# ata Medusa Store Deployment Script
# Supports local development and cloud deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== ata Medusa Store Deployment ===${NC}\n"

# Check if running with Docker or locally
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker detected. Choose deployment method:${NC}"
    echo "1. Local development (docker-compose)"
    echo "2. Build Docker images for cloud"
    read -p "Select option (1 or 2): " DEPLOY_METHOD
else
    DEPLOY_METHOD=3
fi

case $DEPLOY_METHOD in
    1)
        echo -e "\n${GREEN}Starting full stack with Docker Compose...${NC}"
        echo "This will start:"
        echo "  - PostgreSQL database on port 5432"
        echo "  - Redis cache on port 6379"
        echo "  - Medusa backend on port 9000"
        echo "  - Next.js storefront on port 8000"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose up -d
            echo -e "${GREEN}✓ Containers started${NC}"
            echo ""
            echo "Waiting for services to be ready..."
            sleep 10
            echo ""
            echo -e "${GREEN}Services are running:${NC}"
            echo "  Storefront: http://localhost:8000"
            echo "  Backend API: http://localhost:9000"
            echo "  Database: localhost:5432"
            echo "  Redis: localhost:6379"
            echo ""
            echo "View logs with: docker-compose logs -f"
            echo "Stop services with: docker-compose down"
        fi
        ;;
    2)
        echo -e "\n${GREEN}Building Docker images for cloud...${NC}"
        
        # Check if logged in to Docker registry
        if ! docker info | grep -q "Username:"; then
            echo -e "${YELLOW}You need to be logged in to a Docker registry${NC}"
            echo "Example: docker login atatreningsutstyr.azurecr.io"
            read -p "Continue? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
        
        REGISTRY="${REGISTRY:-atatreningsutstyr.azurecr.io}"
        
        echo -e "\n${YELLOW}Building backend image...${NC}"
        docker build -f Dockerfile.backend -t ${REGISTRY}/medusa-backend:latest .
        echo -e "${GREEN}✓ Backend image built${NC}"
        
        echo -e "\n${YELLOW}Building storefront image...${NC}"
        docker build -f Dockerfile.storefront -t ${REGISTRY}/medusa-storefront:latest .
        echo -e "${GREEN}✓ Storefront image built${NC}"
        
        echo -e "\n${YELLOW}Pushing images to registry...${NC}"
        docker push ${REGISTRY}/medusa-backend:latest
        docker push ${REGISTRY}/medusa-storefront:latest
        echo -e "${GREEN}✓ Images pushed to ${REGISTRY}${NC}"
        
        echo -e "\n${GREEN}Next steps:${NC}"
        echo "1. Deploy backend: see DEPLOYMENT.md for Azure instructions"
        echo "2. Deploy storefront: see DEPLOYMENT.md for Azure instructions"
        echo "3. Update NEXT_PUBLIC_MEDUSA_BACKEND_URL to your backend URL"
        ;;
    3)
        echo -e "\n${GREEN}Local development mode (without Docker)${NC}"
        echo ""
        echo "Prerequisites:"
        echo "  - Node.js 20+"
        echo "  - PostgreSQL 15+ running locally"
        echo "  - Redis 7+ running locally"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "\n${YELLOW}Starting backend...${NC}"
            cd apps/backend
            npm install
            npm run build
            npm run start &
            BACKEND_PID=$!
            
            sleep 5
            
            echo -e "\n${YELLOW}Starting storefront...${NC}"
            cd ../storefront
            npm install
            npm run dev &
            STOREFRONT_PID=$!
            
            echo -e "\n${GREEN}✓ Services started${NC}"
            echo ""
            echo "Storefront: http://localhost:8000"
            echo "Backend API: http://localhost:9000"
            echo ""
            echo "Press Ctrl+C to stop services"
            
            trap "kill $BACKEND_PID $STOREFRONT_PID" EXIT
            wait
        fi
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
