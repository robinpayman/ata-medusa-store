# Deployment Guide: ata Medusa Store

This guide explains how to deploy both the Medusa backend and Next.js storefront to run 24/7 in the cloud.

## Overview

The system consists of:
- **Backend**: Medusa.js API (Node.js) - runs on port 9000
- **Storefront**: Next.js 15 (React) - runs on port 8000
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

## Deployment Options

### Option 1: Docker Compose (Local/Development)

For testing the full stack locally with Docker:

```bash
docker-compose up -d
```

This will:
1. Start PostgreSQL database
2. Start Redis cache
3. Build and run Medusa backend on port 9000
4. Build and run Next.js storefront on port 8000

Access:
- Storefront: http://localhost:8000
- Backend API: http://localhost:9000

### Option 2: Azure Container Instances (Production)

#### Prerequisites

1. Azure CLI installed and authenticated
2. Azure Container Registry set up
3. PostgreSQL database provisioned (Azure Database for PostgreSQL)
4. Redis cache provisioned (Azure Cache for Redis)

#### Deployment Steps

**1. Build and push images to Azure Container Registry:**

```bash
# Set your registry name
REGISTRY_NAME=atatreningsutstyr
REGISTRY_URL=${REGISTRY_NAME}.azurecr.io

# Login to registry
az acr login --name $REGISTRY_NAME

# Build and push backend
az acr build --registry $REGISTRY_NAME \
  --image medusa-backend:latest \
  --file Dockerfile.backend .

# Build and push storefront
az acr build --registry $REGISTRY_NAME \
  --image medusa-storefront:latest \
  --file Dockerfile.storefront .
```

**2. Deploy Backend to Azure Container Instances:**

```bash
az container create \
  --resource-group ata-medusa-rg \
  --name ata-medusa-backend \
  --image ${REGISTRY_URL}/medusa-backend:latest \
  --registry-login-server $REGISTRY_URL \
  --registry-username <username> \
  --registry-password <password> \
  --environment-variables \
    NODE_ENV=production \
    DATABASE_URL="postgresql://user:password@medusa-db.postgres.database.azure.com:5432/medusa_db?sslmode=require" \
    REDIS_URL="redis://medusa-redis.redis.cache.windows.net:6379" \
    STORE_CORS="https://atatreningsutstyr.no" \
    JWT_SECRET=$(openssl rand -hex 32) \
    COOKIE_SECRET=$(openssl rand -hex 32) \
  --ports 9000 \
  --dns-name-label ata-medusa-backend \
  --restart-policy Always
```

**3. Deploy Storefront to Azure Container Instances:**

```bash
az container create \
  --resource-group ata-medusa-rg \
  --name ata-medusa-storefront \
  --image ${REGISTRY_URL}/medusa-storefront:latest \
  --registry-login-server $REGISTRY_URL \
  --registry-username <username> \
  --registry-password <password> \
  --environment-variables \
    NODE_ENV=production \
    NEXT_PUBLIC_MEDUSA_BACKEND_URL="https://ata-medusa-backend.westeurope.azurecontainer.io:9000" \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="<your-publishable-key>" \
    NEXT_PUBLIC_DEFAULT_REGION="dk" \
  --ports 8000 \
  --dns-name-label ata-medusa-storefront \
  --restart-policy Always
```

**4. Set up Azure DNS or use Azure Application Gateway for routing**

### Option 3: Azure App Service (Recommended for Production)

For better scalability and easier management:

**1. Create resource group:**

```bash
az group create \
  --name ata-medusa-prod \
  --location westeurope
```

**2. Create App Service plans:**

```bash
# Backend App Service Plan
az appservice plan create \
  --name ata-medusa-backend-plan \
  --resource-group ata-medusa-prod \
  --sku P1V2 \
  --is-linux

# Storefront App Service Plan
az appservice plan create \
  --name ata-medusa-storefront-plan \
  --resource-group ata-medusa-prod \
  --sku P1V2 \
  --is-linux
```

**3. Create and deploy web apps:**

```bash
# Deploy backend
az webapp create \
  --resource-group ata-medusa-prod \
  --plan ata-medusa-backend-plan \
  --name ata-medusa-backend-prod \
  --deployment-container-image-name ${REGISTRY_URL}/medusa-backend:latest

# Configure backend
az webapp config appsettings set \
  --resource-group ata-medusa-prod \
  --name ata-medusa-backend-prod \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="<connection-string>" \
    REDIS_URL="<redis-connection>" \
    WEBSITES_PORT=9000

# Deploy storefront
az webapp create \
  --resource-group ata-medusa-prod \
  --plan ata-medusa-storefront-plan \
  --name ata-medusa-storefront-prod \
  --deployment-container-image-name ${REGISTRY_URL}/medusa-storefront:latest

# Configure storefront
az webapp config appsettings set \
  --resource-group ata-medusa-prod \
  --name ata-medusa-storefront-prod \
  --settings \
    NODE_ENV=production \
    NEXT_PUBLIC_MEDUSA_BACKEND_URL="https://ata-medusa-backend-prod.azurewebsites.net" \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="<key>" \
    WEBSITES_PORT=8000
```

## Environment Variables

### Backend (.env.production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/medusa_db?sslmode=require
REDIS_URL=redis://host:6379
STORE_CORS=https://atatreningsutstyr.no,https://www.atatreningsutstyr.no
ADMIN_CORS=https://admin.atatreningsutstyr.no
AUTH_CORS=https://atatreningsutstyr.no,https://www.atatreningsutstyr.no,https://admin.atatreningsutstyr.no
JWT_SECRET=<generate-secure-key>
COOKIE_SECRET=<generate-secure-key>
```

### Storefront (.env.production)

```env
NODE_ENV=production
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.atatreningsutstyr.no
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<your-key>
NEXT_PUBLIC_DEFAULT_REGION=dk
```

## Database Setup

The Medusa backend will automatically run migrations on startup. Ensure the database user has permissions to create tables and schemas.

## Monitoring & Health Checks

### Backend health endpoint:
```bash
curl https://api.atatreningsutstyr.no/health
```

### Storefront health:
Access https://atatreningsutstyr.no - should return 200 OK

### Azure Monitoring:

```bash
# View container logs
az container logs \
  --resource-group ata-medusa-prod \
  --name ata-medusa-backend

# View container status
az container show \
  --resource-group ata-medusa-prod \
  --name ata-medusa-backend \
  --query "containers[0].instanceView.currentState"
```

## SSL/TLS Setup

Use Azure Application Gateway or Azure Front Door with Azure-managed certificates or bring your own.

## Scaling

- **Horizontal Scaling**: Use Azure Container Instances with a load balancer
- **Vertical Scaling**: Increase container CPU/memory in azure-deploy-backend.yml

## Troubleshooting

**Backend won't start:**
1. Check DATABASE_URL is correct
2. Verify Redis connectivity
3. Review container logs: `az container logs --name ata-medusa-backend`

**Storefront can't connect to backend:**
1. Verify NEXT_PUBLIC_MEDUSA_BACKEND_URL is reachable
2. Check CORS settings in backend environment
3. Inspect browser console for errors

**High resource usage:**
1. Check for inefficient queries in API
2. Monitor database connections
3. Review Redis usage
4. Scale container resources if needed

## Rollback

To rollback to a previous version:

```bash
# Deploy previous image version
az container create \
  --image ${REGISTRY_URL}/medusa-backend:previous-tag \
  # ... other options
```

## Next Steps

1. Set up monitoring and alerting
2. Configure automated backups for PostgreSQL
3. Implement CI/CD pipeline for automatic deployments
4. Set up custom domain and SSL certificates
5. Configure CDN for static assets
