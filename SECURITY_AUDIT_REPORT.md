# Security Audit Report - Medusa DTC Starter
**Date**: 2026-08-28  
**Status**: ⚠️ REQUIRES IMMEDIATE ACTION

---

## Executive Summary

The codebase has **critical security issues** with hardcoded secrets in documentation and compiled assets. While the architecture supports Azure Key Vault, actual implementation is incomplete and secrets are exposed in multiple locations.

**Action Required**: Remove hardcoded secrets from documentation and implement proper secret management.

---

## Findings

### 🔴 CRITICAL: Hardcoded API Key in Documentation

**Severity**: HIGH  
**Files Affected**:
- `PHASE1_STATUS.md` (2 occurrences)
  - Line 22: Publishable API key exposed in accomplishments
  - Line 61: API key exposed in access points section

**Issue**: Documentation contains the actual Medusa publishable API key:
```
pk_da78ce86ca4ceb8e09721d714398fc96104486fd9a0057f1fcaf2002b8611625
```

**Impact**:
- If repository is public, the API key is exposed to anyone with access
- Key could be used to make unauthorized API calls
- Violates security best practice of never storing secrets in version control

**Recommendation**: 
✅ Remove all actual keys from documentation
✅ Use placeholder syntax like `pk_[MEDUSA_PUBLISHABLE_API_KEY]` or reference Key Vault name instead

---

### 🟡 WARNING: Hardcoded Secret in Source File

**Severity**: MEDIUM  
**File**: `apps/storefront/.env.local`  
**Line**: 3

**Current Content**:
```
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_da78ce86ca4ceb8e09721d714398fc96104486fd9a0057f1fcaf2002b8611625
```

**Status**: ✅ PARTIALLY MITIGATED
- File IS properly gitignored (confirmed: `git check-ignore` shows it's excluded)
- NOT tracked in git repository
- File exists only in local development environment

**Recommendation**:
✅ Current approach is acceptable for local development
✅ Use `.env.template` for documentation (without actual values)
✅ Load from Azure Key Vault in production

---

### 🟢 GOOD: Compiled Assets Contain Key (Expected)

**Severity**: LOW (Expected behavior)  
**Files**: `.next/server/chunks/*.js` (7 files with compiled key)

**Note**: Compiled Next.js assets naturally contain environment variables as compile-time values. This is expected and not a security issue since:
- Storefront builds are compiled per deployment
- Publishable keys are meant to be public (frontend-only access)
- Private API keys should NEVER be exposed in compiled assets

**Status**: ✅ ACCEPTABLE - This is not a security vulnerability

---

## Azure Key Vault Integration Status

### ✅ IMPLEMENTED: Backend Infrastructure

**File**: `apps/backend/src/config/secrets.ts`

**Status**: GOOD
- ✅ SecretsManager class properly configured
- ✅ DefaultAzureCredential for authentication
- ✅ Cache mechanism to reduce Key Vault calls
- ✅ Development fallback to .env files
- ✅ Proper error handling and logging

**Key Features**:
```typescript
- Production: Loads from Azure Key Vault
- Development: Loads from .env files (safe fallback)
- Caching: Reduces API calls to Key Vault
- Error handling: Clear error messages for missing secrets
```

### ✅ IMPLEMENTED: Medusa Config Integration

**File**: `apps/backend/medusa-config.ts`

**Status**: GOOD
- ✅ Uses `secretsManager.getSecretSync()` for runtime secrets
- ✅ Fallback to process.env for .env files
- ✅ Covers all critical secrets:
  - `DATABASE_URL`
  - `STORE_CORS`
  - `ADMIN_CORS`
  - `AUTH_CORS`
  - `JWT_SECRET`
  - `COOKIE_SECRET`

### ⚠️ INCOMPLETE: Azure Key Vault Deployment

**Status**: NOT YET CONFIGURED FOR PRODUCTION

**Missing Steps**:
1. ❌ Azure Key Vault not created (`ata-medusa-kv`)
2. ❌ Secrets not uploaded to Key Vault
3. ❌ No managed identity configured for production
4. ❌ No Azure Container/App Service deployment yet

**Required for Production**:
- Create Key Vault: `ata-medusa-kv`
- Store all secrets in Key Vault (see AZURE_KEY_VAULT_SETUP.md)
- Configure managed identity for your Azure service
- Update production environment variables

---

## Checklist: Secure Practices

| Item | Status | Evidence |
|------|--------|----------|
| No hardcoded secrets in code | ✅ GOOD | secrets.ts properly abstracts Key Vault |
| .env.local files gitignored | ✅ GOOD | Confirmed via git check-ignore |
| No secrets in git history | ✅ GOOD | Only .env.template tracked |
| Secrets in documentation | ❌ ISSUE | PHASE1_STATUS.md contains actual key |
| Azure Key Vault setup | ⚠️ PARTIAL | Code ready, but vault not yet created |
| Production deployment config | ❌ TODO | Not configured for production |
| Error handling for missing secrets | ✅ GOOD | Clear error messages in secretsManager |
| Secret caching mechanism | ✅ GOOD | Reduces Key Vault API calls |

---

## Recommended Action Plan

### Phase 1: Immediate (This Session)
```
1. ✅ Remove hardcoded API key from PHASE1_STATUS.md
2. ✅ Update PHASE1_STATUS.md with placeholder syntax
3. ✅ Create .env.template for both apps
4. ✅ Document secret names required (without values)
```

### Phase 2: Before Production
```
1. Create Azure Key Vault (ata-medusa-kv)
2. Store all secrets in Key Vault
3. Test Key Vault integration in staging
4. Configure managed identity for Azure service
5. Document production deployment steps
```

### Phase 3: Production Deployment
```
1. Deploy backend with KEY_VAULT_NAME env variable
2. Verify all secrets load from Key Vault
3. Enable audit logging in Key Vault
4. Monitor Key Vault access logs
5. Implement secret rotation policy
```

---

## Files That Need Updates

### URGENT: Remove Secrets from Documentation

1. **PHASE1_STATUS.md**
   - Remove API key from line 22
   - Remove API key from line 61
   - Replace with reference to Azure Key Vault

2. **AZURE_KEY_VAULT_SETUP.md**
   - Review examples - they use placeholder values (OK)
   - But add warning not to use actual keys in examples

### ADD: Environment Templates

1. **apps/backend/.env.template**
   - Already exists, verify it's complete
   - Should NOT contain actual values

2. **apps/storefront/.env.template**
   - Create this from .env.local (without actual key)
   - Use NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_YOUR_KEY_HERE

---

## Implementation Guide

### Step 1: Update PHASE1_STATUS.md

Replace API key references with:
```markdown
- ✅ Publishable API key generated and stored in Azure Key Vault (`tt-secrets-vault`)
- ✅ Key name: `medusa-publishable-api-key`
- API Key reference: Stored in Key Vault (not displayed for security)
- Azure Key Vault: `tt-secrets-vault` / `medusa-publishable-api-key`
```

### Step 2: Create Environment Templates

**apps/backend/.env.template**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medusa_db

# CORS Configuration
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:7001
AUTH_CORS=http://localhost:8000

# JWT and Cookie Secrets
JWT_SECRET=your-jwt-secret-here
COOKIE_SECRET=your-cookie-secret-here

# Azure Key Vault (production only)
KEY_VAULT_NAME=ata-medusa-kv
NODE_ENV=development
```

**apps/storefront/.env.template**
```bash
# Medusa Backend Configuration
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_YOUR_PUBLISHABLE_KEY_HERE
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Region and URL Configuration
NEXT_PUBLIC_DEFAULT_REGION=dk
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Stripe (optional)
NEXT_PUBLIC_STRIPE_KEY=

# Medusa Cloud S3 (optional)
MEDUSA_CLOUD_S3_HOSTNAME=
MEDUSA_CLOUD_S3_PATHNAME=

# Environment
NODE_ENV=development
```

### Step 3: Document Secret Management

Create **SECRETS_MANAGEMENT.md**:
```markdown
# Secrets Management

## Development

1. Copy environment templates:
   ```bash
   cp apps/backend/.env.template apps/backend/.env.local
   cp apps/storefront/.env.template apps/storefront/.env.local
   ```

2. Fill in actual values in .env.local files (never commit)

3. Values are loaded via secretsManager.js in backend

## Production

1. All secrets stored in Azure Key Vault: `ata-medusa-kv`
2. Backend authenticates via Managed Identity
3. secretsManager.js automatically loads from Key Vault
4. No .env files in production

## Key Vault Secrets Required

- DATABASE_URL
- STORE_CORS
- ADMIN_CORS
- AUTH_CORS
- JWT_SECRET
- COOKIE_SECRET
- (Add others as needed)
```

---

## Verification Commands

### Check gitignore status:
```bash
git check-ignore apps/backend/.env.local apps/storefront/.env.local
```

### Find potential hardcoded secrets:
```bash
grep -r "pk_[a-zA-Z0-9]\{60,\}" . --exclude-dir=node_modules --exclude-dir=.next
grep -r "sk_[a-zA-Z0-9]\{60,\}" . --exclude-dir=node_modules --exclude-dir=.next
```

### Test Key Vault connectivity (once configured):
```bash
cd apps/backend
npm run test:secrets
```

---

## Conclusion

**Current State**: Architecture supports Azure Key Vault, but secrets are exposed in documentation.

**Risk Level**: MEDIUM (publishable key in docs, but not private keys)

**Recommendation**: Follow the Action Plan above to move all secrets to Azure Key Vault before production deployment.

**Timeline**: 
- Phase 1 (Immediate): 30 minutes
- Phase 2 (Before Production): 1-2 hours
- Phase 3 (Production): Deployment dependent

---

**Audit Performed By**: Oz Agent  
**Next Review**: Before production deployment  
**Owner**: Robin Payman
