# Secrets Management Guide

This document explains how secrets are managed across development, staging, and production environments.

## Overview

- **Development**: Secrets stored in local `.env.local` files (never committed to git)
- **Staging/Production**: Secrets managed via Azure Key Vault (`tt-secrets-vault`)
- **Code**: Uses `SecretsManager` class to abstract credential handling

## Architecture

```
┌─────────────────┐
│  Development    │
│  .env.local     │
└────────┬────────┘
         │
     [loadEnv]
         │
┌────────▼────────────────────┐
│  SecretsManager             │
│  (src/config/secrets.ts)    │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
[Production] [Development]
    │          │
    │          ▼
    │       .env.local
    │
    ▼
Azure Key Vault
(tt-secrets-vault)
```

## Development Setup

### 1. Create Environment Files

Copy the template files:

```bash
# Backend
cp apps/backend/.env.template apps/backend/.env.local

# Storefront
cp apps/storefront/.env.template apps/storefront/.env.local
```

### 2. Fill in Development Values

**apps/backend/.env.local**:
```bash
# Database
DATABASE_URL=postgres://postgres@localhost:5432/medusa-ata-medusa-store

# CORS (allow local development URLs)
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000

# Security (use placeholder values for development)
JWT_SECRET=dev-jwt-secret-change-in-production
COOKIE_SECRET=dev-cookie-secret-change-in-production

# Optional: Redis (if using)
REDIS_URL=redis://localhost:6379

# Node environment
NODE_ENV=development
```

**apps/storefront/.env.local**:
```bash
# Get the actual publishable key from your Medusa backend admin
# Login to http://localhost:9000/app
# Go to Settings > Publishable API Keys
# Copy the key and paste it here
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_YOUR_ACTUAL_KEY_HERE

# Backend API
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Region configuration
NEXT_PUBLIC_DEFAULT_REGION=dk
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Optional: Stripe (if using Stripe for payments)
NEXT_PUBLIC_STRIPE_KEY=pk_test_YOUR_STRIPE_KEY_HERE

NODE_ENV=development
```

### 3. Verify Setup

```bash
# Backend should start without errors
cd apps/backend
pnpm dev

# Storefront should load the API key
cd apps/storefront
pnpm dev
```

### 4. Important Notes

- ✅ `.env.local` files are gitignored (never committed)
- ✅ Safe to store actual development values in `.env.local`
- ✅ Each developer has their own `.env.local` files
- ❌ NEVER commit actual secrets to git
- ❌ NEVER share `.env.local` files via email/Slack

## Production Setup

### Azure Key Vault Configuration

All production secrets are stored in **Azure Key Vault: `tt-secrets-vault`**

#### Required Secrets

The backend requires these secrets in Key Vault:

```
DATABASE_URL             → PostgreSQL connection string
STORE_CORS             → Storefront URL (e.g., https://atatreningsutstyr.no)
ADMIN_CORS             → Admin dashboard URL
AUTH_CORS              → Auth service URL
JWT_SECRET             → Random 32+ character string
COOKIE_SECRET          → Random 32+ character string
```

#### Creating Secrets

Once you have Azure access:

```bash
# Set variables
KEY_VAULT_NAME="tt-secrets-vault"

# Add/update secrets
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "DATABASE-URL" \
  --value "postgresql://user:password@host:5432/medusa"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "JWT-SECRET" \
  --value "$(openssl rand -base64 32)"

# List all secrets
az keyvault secret list --vault-name $KEY_VAULT_NAME
```

### Deployment Configuration

When deploying to production on Azure (Container Instances, App Service, etc.):

```bash
# Environment variables to set in Azure deployment
KEY_VAULT_NAME=tt-secrets-vault
NODE_ENV=production
STORE_CORS=https://atatreningsutstyr.no
ADMIN_CORS=https://admin.atatreningsutstyr.no
AUTH_CORS=https://atatreningsutstyr.no
```

The application will automatically:
1. Detect `NODE_ENV=production`
2. Use `DefaultAzureCredential` to authenticate
3. Load secrets from Key Vault
4. Never look for .env files

### Managed Identity (Recommended)

For production, use Azure Managed Identity so the app authenticates automatically:

```bash
# If using Container Instances
az container create \
  --assign-identity [full-resource-id] \
  ...

# If using App Service
az webapp identity assign \
  --resource-group my-rg \
  --name ata-medusa-backend-prod
```

Then grant the identity access to Key Vault:

```bash
PRINCIPAL_ID=[managed-identity-principal-id]
az keyvault set-policy \
  --name tt-secrets-vault \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list
```

## Secret Management Best Practices

### 1. Never Hardcode Secrets

❌ **Bad**:
```typescript
const apiKey = "sk_live_abc123def456..."
```

✅ **Good**:
```typescript
const apiKey = await secretsManager.getSecret("API_KEY")
```

### 2. Use Placeholders in Templates

❌ **Bad** (.env.template):
```
JWT_SECRET=abc123def456...
```

✅ **Good** (.env.template):
```
JWT_SECRET=your-jwt-secret-here
```

### 3. Remove Secrets from Documentation

❌ **Bad** (PHASE1_STATUS.md):
```
API Key: pk_abc123def456...
```

✅ **Good** (PHASE1_STATUS.md):
```
API Key: Stored in Azure Key Vault (tt-secrets-vault)
Key Name: medusa-publishable-api-key
```

### 4. Rotate Secrets Regularly

```bash
# Generate new secrets
NEW_JWT_SECRET=$(openssl rand -base64 32)

# Update in Key Vault
az keyvault secret set \
  --vault-name tt-secrets-vault \
  --name "JWT-SECRET" \
  --value $NEW_JWT_SECRET

# Redeploy application to pick up new secret
```

### 5. Audit Key Vault Access

```bash
# Enable logging
az monitor diagnostic-settings create \
  --name "vault-audit-logs" \
  --resource /subscriptions/.../resourceGroups/.../providers/Microsoft.KeyVault/vaults/tt-secrets-vault \
  --logs '[{"category":"AuditEvent","enabled":true}]' \
  --storage-account /subscriptions/.../resourceGroups/.../providers/Microsoft.Storage/storageAccounts/...

# View recent access
az monitor metrics list \
  --resource /subscriptions/.../resourceGroups/.../providers/Microsoft.KeyVault/vaults/tt-secrets-vault
```

## Troubleshooting

### Secret Not Found in Development

**Problem**: `Error: Secret DATABASE_URL not found in environment variables`

**Solution**:
1. Copy `.env.template` to `.env.local`
2. Add the missing variable
3. Restart the development server

```bash
cp apps/backend/.env.template apps/backend/.env.local
# Edit .env.local and add missing values
```

### Azure Authentication Failed

**Problem**: `DefaultAzureCredential could not authenticate`

**Solution**:
1. Check you're logged in to Azure CLI
2. Verify managed identity permissions

```bash
# Check Azure CLI login
az account show

# Verify Key Vault access (if you're the admin)
az keyvault show --name tt-secrets-vault
```

### Key Vault Secret Not Accessible

**Problem**: `Failed to retrieve secret from Key Vault: Access denied`

**Solution**:
1. Verify the managed identity has permission
2. Check secret name (case-sensitive)
3. Ensure secret exists in Key Vault

```bash
# List all accessible secrets
az keyvault secret list --vault-name tt-secrets-vault

# Check a specific secret
az keyvault secret show \
  --vault-name tt-secrets-vault \
  --name "DATABASE-URL"
```

## Migration Path

### Current State (Local Development)
- ✅ Using .env.local files
- ✅ Secrets never committed to git
- ⚠️ Not using Key Vault yet

### Phase 1: Development + Key Vault (Optional)
- Test Key Vault integration locally
- Use Managed Identity or app credentials
- Keep .env files as fallback

### Phase 2: Staging Deployment
- Deploy backend to Azure
- Assign managed identity
- Load all secrets from Key Vault
- Verify application works

### Phase 3: Production Deployment
- Full Key Vault integration
- All secrets in Azure Key Vault
- No .env files in production
- Enable audit logging

## Code Integration

### Backend (Medusa Config)

The backend automatically loads secrets via `SecretsManager`:

```typescript
// medusa-config.ts
import { secretsManager } from './src/config/secrets'

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: secretsManager.getSecretSync('DATABASE_URL'),
    http: {
      storeCors: secretsManager.getSecretSync('STORE_CORS'),
      // ... etc
    }
  }
})
```

**How it works**:
- In development: Reads from .env.local
- In production: Reads from Azure Key Vault
- If not found: Throws clear error

### Storefront (Next.js)

The storefront uses environment variables directly:

```typescript
// This is loaded at build time from .env.local (dev) or deployment config (prod)
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

// Note: Publishable keys are safe to expose in frontend code
// Private/secret keys should NEVER be in frontend code
```

## Checklist

- [ ] `.env.local` files are in `.gitignore`
- [ ] No actual secrets in `.git` history
- [ ] No secrets in README or documentation
- [ ] `.env.template` files have placeholder values
- [ ] Azure Key Vault created: `tt-secrets-vault`
- [ ] Required secrets added to Key Vault
- [ ] Managed identity configured for production
- [ ] Key Vault access permissions set correctly
- [ ] Application tested with Key Vault in staging
- [ ] Audit logging enabled for Key Vault

## Summary

| Environment | Storage | Risk | Access |
|-------------|---------|------|--------|
| Development | .env.local | Low | Local only |
| Staging | Key Vault | Low | Managed Identity |
| Production | Key Vault | Low | Managed Identity |

**Key Point**: Never store secrets in code, git history, or public documentation. Always use dedicated secret management tools like Azure Key Vault.

---

**Last Updated**: 2026-08-28  
**Owner**: Robin Payman  
**Questions?** See SECURITY_AUDIT_REPORT.md
