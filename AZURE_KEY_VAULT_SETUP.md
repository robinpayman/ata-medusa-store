# Azure Key Vault Setup Guide

## Overview

Azure Key Vault is the recommended way to store and manage secrets for production deployments. It provides:
- ✅ Centralized secret management
- ✅ Encryption at rest and in transit
- ✅ Access control with Azure AD
- ✅ Audit logging
- ✅ Automatic secret rotation support

## Architecture

```
Local Development (.env files)
    ↓
Staging (Azure Key Vault)
    ↓
Production (Azure Key Vault)
```

## Setup Steps

### 1. Create Azure Key Vault

```bash
# Set variables
RESOURCE_GROUP="ata-medusa-rg"
KEY_VAULT_NAME="ata-medusa-kv"
LOCATION="westeurope"

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create Key Vault
az keyvault create \
  --resource-group $RESOURCE_GROUP \
  --name $KEY_VAULT_NAME \
  --location $LOCATION \
  --enable-rbac-authorization
```

### 2. Store Secrets in Key Vault

```bash
KEY_VAULT_NAME="ata-medusa-kv"

# Database secrets
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "DATABASE-URL" \
  --value "postgresql://user:password@host:5432/medusa_db?sslmode=require"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "REDIS-URL" \
  --value "redis://medusa-redis.redis.cache.windows.net:6379"

# Medusa secrets
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "JWT-SECRET" \
  --value "$(openssl rand -hex 32)"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "COOKIE-SECRET" \
  --value "$(openssl rand -hex 32)"

# API keys
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "MEDUSA-PUBLISHABLE-KEY" \
  --value "pk_dd31e38530c0a1d97b912730a102a487ac92bc5fead6d627b708a58c2b36beb3"

# Tripletex credentials
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "TRIPLETEX-CONSUMER-TOKEN" \
  --value "eyJ0b2tlbklkIjo..."

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "TRIPLETEX-EMPLOYEE-TOKEN" \
  --value "eyJ0b2tlbklkIjoyNjgzNTUxLC..."

# Email configuration
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "EMAIL-GRAPH-TENANT-ID" \
  --value "[your-tenant-id]"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "EMAIL-GRAPH-CLIENT-ID" \
  --value "[your-client-id]"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "EMAIL-GRAPH-CLIENT-SECRET" \
  --value "[your-client-secret]"
```

### 3. Grant Access to Your Application

**For Container Instances**:

```bash
# Get container identity
CONTAINER_PRINCIPAL_ID=$(az container show \
  --resource-group $RESOURCE_GROUP \
  --name ata-medusa-backend \
  --query identity.principalId \
  --output tsv)

# Grant read permission
az keyvault set-policy \
  --name $KEY_VAULT_NAME \
  --object-id $CONTAINER_PRINCIPAL_ID \
  --secret-permissions get list
```

**For App Service**:

```bash
# Get app identity
APP_PRINCIPAL_ID=$(az webapp identity assign \
  --resource-group $RESOURCE_GROUP \
  --name ata-medusa-backend-prod \
  --query principalId \
  --output tsv)

# Grant read permission
az keyvault set-policy \
  --name $KEY_VAULT_NAME \
  --object-id $APP_PRINCIPAL_ID \
  --secret-permissions get list
```

### 4. Update Application Code

**Backend**: `apps/backend/src/config/secrets.ts`

```typescript
import { DefaultAzureCredential } from "@azure/identity"
import { SecretClient } from "@azure/keyvault-secrets"

class SecretsManager {
  private client: SecretClient
  private cache: Map<string, string> = new Map()

  constructor() {
    const vaultUrl = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net/`
    const credential = new DefaultAzureCredential()
    this.client = new SecretClient(vaultUrl, credential)
  }

  async getSecret(name: string): Promise<string> {
    // Check cache first
    if (this.cache.has(name)) {
      return this.cache.get(name)!
    }

    // Fetch from Key Vault
    const secret = await this.client.getSecret(name)
    if (secret.value) {
      this.cache.set(name, secret.value)
      return secret.value
    }

    throw new Error(`Secret ${name} not found`)
  }

  async getSecrets(names: string[]): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {}
    for (const name of names) {
      secrets[name] = await this.getSecret(name)
    }
    return secrets
  }
}

export const secretsManager = new SecretsManager()
```

**Backend Config**: `apps/backend/src/config/config.ts`

```typescript
import { secretsManager } from "./secrets"

export async function loadConfig() {
  const isDevelopment = process.env.NODE_ENV === "development"

  if (isDevelopment) {
    // Use .env files in development
    return {
      database: process.env.DATABASE_URL,
      redis: process.env.REDIS_URL,
      jwt: process.env.JWT_SECRET,
      cookie: process.env.COOKIE_SECRET,
      tripletex: {
        consumerToken: process.env.TRIPLETEX_CONSUMER_TOKEN,
        employeeToken: process.env.TRIPLETEX_EMPLOYEE_TOKEN,
      },
      email: {
        graphTenantId: process.env.EMAIL_GRAPH_TENANT_ID,
        graphClientId: process.env.EMAIL_GRAPH_CLIENT_ID,
        graphClientSecret: process.env.EMAIL_GRAPH_CLIENT_SECRET,
      },
    }
  } else {
    // Use Azure Key Vault in production
    const secrets = await secretsManager.getSecrets([
      "DATABASE-URL",
      "REDIS-URL",
      "JWT-SECRET",
      "COOKIE-SECRET",
      "TRIPLETEX-CONSUMER-TOKEN",
      "TRIPLETEX-EMPLOYEE-TOKEN",
      "EMAIL-GRAPH-TENANT-ID",
      "EMAIL-GRAPH-CLIENT-ID",
      "EMAIL-GRAPH-CLIENT-SECRET",
    ])

    return {
      database: secrets["DATABASE-URL"],
      redis: secrets["REDIS-URL"],
      jwt: secrets["JWT-SECRET"],
      cookie: secrets["COOKIE-SECRET"],
      tripletex: {
        consumerToken: secrets["TRIPLETEX-CONSUMER-TOKEN"],
        employeeToken: secrets["TRIPLETEX-EMPLOYEE-TOKEN"],
      },
      email: {
        graphTenantId: secrets["EMAIL-GRAPH-TENANT-ID"],
        graphClientId: secrets["EMAIL-GRAPH-CLIENT-ID"],
        graphClientSecret: secrets["EMAIL-GRAPH-CLIENT-SECRET"],
      },
    }
  }
}
```

**Update `medusa-config.ts`**:

```typescript
import { loadEnv, defineConfig } from "@medusajs/framework/utils"
import { loadConfig } from "./src/config/config"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

let config: any

async function getConfig() {
  if (!config) {
    config = await loadConfig()
  }
  return config
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL, // Will be set from Key Vault in production
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
})
```

### 5. Update Docker Image for Azure Authentication

**Dockerfile.backend**:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Azure CLI and dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ca-certificates

# Install Azure Identity library
RUN npm install --global --no-save \
    @azure/identity \
    @azure/keyvault-secrets

COPY package.json package-lock.json ./
COPY apps/backend ./apps/backend
COPY apps/storefront ./apps/storefront

RUN npm ci
RUN cd apps/backend && npm run build

EXPOSE 9000

ENV NODE_ENV=production

WORKDIR /app/apps/backend

CMD ["npm", "run", "start"]
```

### 6. Update Container/App Service Environment Variables

For Azure Container Instances or App Service, set:

```env
NODE_ENV=production
KEY_VAULT_NAME=ata-medusa-kv
STORE_CORS=https://atatreningsutstyr.no
ADMIN_CORS=https://admin.atatreningsutstyr.no
AUTH_CORS=https://atatreningsutstyr.no

# Database, Redis, and other secrets will be fetched from Key Vault automatically
```

## Security Best Practices

### 1. Managed Identity (Preferred)

Use Azure Managed Identity so your app authenticates automatically:

```bash
# For Container Instances
az container create \
  --assign-identity [/subscriptions/.../resourceGroups/...] \
  ...

# For App Service
az webapp identity assign \
  --resource-group $RESOURCE_GROUP \
  --name ata-medusa-backend-prod
```

### 2. Access Control

Restrict who can manage secrets:

```bash
# Only allow admins
az keyvault set-policy \
  --name $KEY_VAULT_NAME \
  --object-id [admin-user-id] \
  --secret-permissions get list set delete backup restore purge
```

### 3. Audit Logging

Enable logging to see who accessed secrets:

```bash
# Create storage account for logs
az storage account create \
  --resource-group $RESOURCE_GROUP \
  --name atamedusalogs \
  --location westeurope

# Enable Key Vault logging
az monitor diagnostic-settings create \
  --name "ata-medusa-kv-logs" \
  --resource /subscriptions/.../resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME \
  --logs '[{"category":"AuditEvent","enabled":true}]' \
  --storage-account /subscriptions/.../resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/atamedusalogs
```

### 4. Secret Rotation

Implement automatic secret rotation:

```bash
# Create function to rotate secrets
# This would be a scheduled Azure Function that:
# 1. Generates new secret
# 2. Updates application
# 3. Updates Key Vault
```

## Verification

### List All Secrets

```bash
az keyvault secret list \
  --vault-name $KEY_VAULT_NAME
```

### Get Specific Secret

```bash
az keyvault secret show \
  --vault-name $KEY_VAULT_NAME \
  --name "DATABASE-URL"
```

### Test Application Access

Deploy a test application and verify it can access secrets:

```bash
# In your application
const secret = await secretsManager.getSecret("DATABASE-URL")
console.log(`Successfully retrieved secret: ${secret ? "Yes" : "No"}`)
```

## Migration Path

### Phase 1: Local Development
- Use `.env.local` files
- All credentials committed to OneDrive backup (encrypted)

### Phase 2: Staging
- Deploy to Azure with Key Vault
- Test secret retrieval
- Monitor logs

### Phase 3: Production
- All secrets in Azure Key Vault
- No secrets in code or containers
- Full audit logging enabled
- Managed identity authentication

## Cost Considerations

- **Key Vault**: ~$0.60/month (minimal)
- **Operations**: $0.03 per 10,000 operations
- **Logging**: Storage account charges

Total monthly cost: ~$5-10

## Troubleshooting

### Secret Not Found

```bash
# Verify secret exists
az keyvault secret list --vault-name $KEY_VAULT_NAME

# Check permissions
az keyvault show-deleted-secret --vault-name $KEY_VAULT_NAME
```

### Access Denied

```bash
# Verify identity has permissions
az keyvault get-policy \
  --vault-name $KEY_VAULT_NAME \
  --object-id [principal-id]
```

### Authentication Failed

```bash
# Verify DefaultAzureCredential can authenticate
# Check Azure CLI is logged in
az account show

# Check environment variables
printenv | grep AZURE
```

## Summary

Using Azure Key Vault:
- ✅ Secrets never in code
- ✅ Centralized management
- ✅ Audit logging
- ✅ Automatic rotation support
- ✅ Production-grade security
- ✅ Cost-effective (~$5-10/month)

**Recommendation**: Use this setup for production deployment to Azure.
