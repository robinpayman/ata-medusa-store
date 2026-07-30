# Migration Plan: WordPress/WooCommerce → Medusa

## Executive Summary

This document outlines the complete strategy to migrate ata treningsutstyr from the current WordPress/WooCommerce platform to the new Medusa-based e-commerce system. The migration will be phased to minimize business disruption while ensuring data integrity and customer experience.

**Timeline**: 4-6 weeks  
**Risk Level**: Medium (mitigation strategies included)  
**Downtime**: 0 hours (parallel running with migration cutover)

## Current State Assessment

### WordPress/WooCommerce Setup
- **URL**: atatreningsutstyr.no
- **Products**: 539 products (metadata extracted)
- **Customers**: ~500-1000 active customers
- **Orders**: Historical orders to be archived
- **Integrations**: 
  - Tripletex (accounting/ERP)
  - Stock synchronization
  - Payment processing
  - Email notifications

### New Medusa Setup (Ready)
- **Backend**: Medusa.js on Node.js 20
- **Frontend**: Next.js 15 with React
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Deployment**: Docker containers on Azure
- **Architecture**: Microservices-ready

## Migration Strategy: "Green Deployment"

### Approach
Run both systems in parallel during migration:
1. **WordPress** continues serving customers (yellow state)
2. **Medusa** runs in parallel with migrated data (green state)
3. **Gradual traffic shift**: 10% → 25% → 50% → 100%
4. **Rollback capability**: Keep WordPress online for 30 days post-launch

### Timeline

```
Week 1: Preparation & Data Extraction
Week 2: Data Transformation & Loading
Week 3: Feature Parity & Testing
Week 4: Parallel Running & Monitoring
Week 5: Gradual Cutover (10% → 50%)
Week 6: Full Cutover & Cleanup
```

## Phase 1: Preparation (Week 1)

### 1.1 Infrastructure Setup

**Backend Infrastructure**:
```bash
# Already configured, but verify:
✓ Medusa backend running on port 9000
✓ PostgreSQL database initialized
✓ Redis cache running
✓ Next.js storefront on port 8000
✓ Docker images ready for Azure
```

**DNS & CDN Setup** (do before migration):
```
atatreningsutstyr.no  → Azure Load Balancer
api.atatreningsutstyr.no  → Backend API
www.atatreningsutstyr.no  → Frontend
```

### 1.2 Data Audit & Extraction

**Extract from WordPress**:

```bash
# 1. Products
wp post list --post_type=product --format=json > products.json

# 2. Product metadata (attributes, variants, stock)
wp meta list --post_type=product --format=json > product_meta.json

# 3. Customers
wp user list --role=customer --format=json > customers.json

# 4. Orders (archive, don't migrate)
wp post list --post_type=shop_order --format=json > orders_archive.json

# 5. Categories & attributes
wp term list product_cat --format=json > categories.json
wp term list pa_size --format=json > attributes.json
```

**Data Validation**:
- ✓ 539 products extracted
- ✓ Product variants verified
- ✓ Stock quantities checked
- ✓ Customer emails validated
- ✓ Category hierarchy confirmed

### 1.3 Tripletex Integration Assessment

**Current Integration**:
- WooCommerce → Tripletex sync
- Tripletex → WooCommerce stock sync
- Invoice/payment integration

**New Integration Plan**:
```
Medusa Backend
    ↓
Tripletex API
    ↑↓
Medusa Store (inventory management)
```

**Tasks**:
1. Review current Tripletex token (in .credentials-database.md)
2. Verify token permissions (create orders, read products)
3. Test Medusa → Tripletex order creation
4. Implement stock synchronization job

### 1.4 Stakeholder Communication

**Notify**:
- [ ] Customers (optional pre-notice)
- [ ] Support team (training on new system)
- [ ] Operations team (DNS, monitoring setup)
- [ ] Accounting (Tripletex integration changes)

**Prepare**:
- [ ] Support runbook for common issues
- [ ] FAQ for customers
- [ ] Incident response plan

## Phase 2: Data Migration (Week 2)

### 2.1 Product Data Migration

**Process**:

1. **Export WordPress Products** (use WP CLI or REST API):
```bash
# Run script: apps/backend/src/migration-scripts/import-wordpress-products.ts
npm run migrate:products --source=wordpress --target=medusa
```

2. **Transform & Validate**:
```typescript
// Mapping rules:
{
  "wp_product_id" → "medusa_product.external_id",
  "title" → "product.title",
  "description" → "product.description",
  "price" → "product.variants[0].prices",
  "stock_quantity" → "inventory_levels",
  "sku" → "variant.sku",
  "categories" → "product.collection_id"
}
```

3. **Load into Medusa**:
```bash
cd apps/backend
npm run migrate:load -- --batch-size=50 --validate=true
```

4. **Verify**:
- [ ] All 539 products loaded
- [ ] Price conversion correct (NOK)
- [ ] Stock quantities accurate
- [ ] Images linked (or migrated to S3)
- [ ] Categories correctly assigned
- [ ] Variants created properly

### 2.2 Customer Data Migration

**Export & Transform**:

```typescript
// Mapping rules:
{
  "email" → "customer.email",
  "first_name" → "customer.first_name",
  "last_name" → "customer.last_name",
  "billing_address" → "customer.billing_address",
  "shipping_address" → "customer.shipping_addresses",
  "phone" → "customer.phone",
  "created_date" → "customer.created_at"
}
```

**Process**:
```bash
npm run migrate:customers -- --skip-passwords --skip-orders
```

**Notes**:
- Passwords: Reset required on first login (security best practice)
- Orders: Archive separately, don't migrate
- Customers: Can register fresh accounts if needed

### 2.3 Order Archive

**Keep WordPress orders for historical reference**:
- Generate PDF exports for all orders
- Archive in secure storage (OneDrive)
- Create read-only order lookup view

**Do NOT migrate**:
- Past order data (fresh start is cleaner)
- Customer purchase history
- Transaction details

**Rationale**:
- Tripletex is source of truth for accounting
- Medusa orders start fresh from day 1
- Reduces migration risk

## Phase 3: Feature Parity & Testing (Week 3)

### 3.1 Verify Core Features

**Storefront**:
- [ ] Products display correctly (539 products)
- [ ] Product images load (from WordPress or S3)
- [ ] Categories and filters work
- [ ] Search functionality works
- [ ] Cart functionality works
- [ ] Checkout flow complete (5 pages)
- [ ] Order confirmation sends
- [ ] Account registration works
- [ ] Account dashboard displays

**Backend API**:
- [ ] GET /store/products (with filters)
- [ ] GET /store/products/:handle
- [ ] GET /store/categories
- [ ] POST /store/carts
- [ ] POST /store/orders
- [ ] GET /store/customers/me
- [ ] POST /store/auth/login

**Integrations**:
- [ ] Tripletex order creation
- [ ] Tripletex stock sync
- [ ] Payment processing (if enabled)
- [ ] Email notifications

### 3.2 Data Validation Testing

**Product Testing**:
```bash
# Automated tests
npm run test -- --include=products
# Manual verification: Pick 50 random products, verify in Medusa vs WordPress
```

**Customer Testing**:
- Create test accounts
- Verify login works
- Check profile page
- Test password reset

**Order Testing**:
- Create test order with real cart
- Verify Tripletex order creation
- Confirm order email sent
- Check order status updates

### 3.3 Performance Testing

**Load Testing**:
```bash
# 100 concurrent users browsing products
npm run test:load -- --concurrency=100 --duration=300s

# Acceptance criteria:
# - Homepage load: <2 seconds
# - Product page load: <2 seconds
# - API response time: <500ms (p95)
# - No 5xx errors
```

**Database Optimization**:
- [ ] Indexes on frequently queried columns
- [ ] Product listing optimized
- [ ] Search queries optimized
- [ ] Cart operations fast

## Phase 4: Parallel Running & Monitoring (Week 4)

### 4.1 Infrastructure Setup

**Load Balancing** (redirect traffic):

```
www.atatreningsutstyr.no
    ↓
Azure Load Balancer
    ├─ 90% → WordPress (stable)
    ├─ 10% → Medusa (testing)
```

**Monitoring Setup**:
```bash
# Application Insights / DataDog
- Track page load times
- Monitor API latency
- Log errors and exceptions
- Track user behavior

# Health Checks:
- Backend: GET http://api.atatreningsutstyr.no/health
- Storefront: GET http://atatreningsutstyr.no/health
- Database: Connection tests every 5 minutes
```

### 4.2 Data Synchronization

**Keep systems in sync**:

```
New WordPress Orders
    ↓
Sync Service (runs every 15 min)
    ↓
Medusa Database (customer, product info)
```

**What to sync**:
- New customer registrations (⚠️ WordPress → Medusa only)
- Product updates (prices, stock, descriptions)
- Category changes
- Image updates

**What NOT to sync**:
- Orders (Tripletex is source of truth)
- Passwords (fresh login in Medusa)

### 4.3 10% Traffic Shift

**Testing with real users**:

```
Day 1-2: 10% traffic to Medusa
- Monitor error rates (target: <0.1%)
- Track conversion rate (target: ±2% of WordPress)
- Monitor load times (target: <3s)
- Check Tripletex integration (orders created successfully)

Criteria to proceed:
✓ No critical errors
✓ Order creation working
✓ Payment processing working
✓ Customer feedback positive
```

### 4.4 Contingency Plan (Rollback)

**If issues arise**:

1. **Immediate action** (within 5 minutes):
   - Redirect traffic back to WordPress
   - Send status page update
   - Alert team

2. **Investigation** (while traffic returns):
   - Check error logs
   - Review metrics
   - Identify root cause

3. **Resolution**:
   - Fix issue on Medusa
   - Re-test thoroughly
   - Try cutover again in 24 hours

## Phase 5: Gradual Cutover (Week 5)

### 5.1 Traffic Progression

```
Day 1-2: 10% → Medusa
Day 3-4: 25% → Medusa
Day 5-6: 50% → Medusa (production parity)
Day 7: 100% → Medusa
```

### 5.2 Monitoring During Cutover

**Real-time dashboard**:
- Conversion rate (should match)
- Order count (scaling appropriately)
- Error rate (target: <0.1%)
- API response times
- Database performance

**Alerts**:
- Alert if error rate > 1%
- Alert if response time > 3s
- Alert if conversion rate drops >5%
- Alert on critical exceptions

### 5.3 Customer Support Preparation

**Support team**:
- [ ] Trained on new system
- [ ] Access to Medusa admin
- [ ] Escalation procedures
- [ ] Runbooks for common issues

**Communications**:
- [ ] Status page updates
- [ ] Social media announcements
- [ ] Email to customers (post-cutover)

## Phase 6: Full Cutover & Cleanup (Week 6)

### 6.1 Final Cutover (100% traffic)

```
Friday Evening:
1. Final data sync from WordPress
2. Verify Medusa is ready (health checks pass)
3. Update DNS to point directly to Medusa
4. Monitor for 1 hour (no auto-rollback needed)

Monday Morning:
- Confirm everything working
- No issues reported
- Monitor for full business day
```

### 6.2 Post-Cutover Validation

**First 24 hours**:
- [ ] No critical errors
- [ ] Orders processed successfully
- [ ] Tripletex integration working
- [ ] Customers can login/register
- [ ] Support tickets minimal

**First week**:
- [ ] Conversion rate stable
- [ ] Customer feedback positive
- [ ] Technical metrics stable
- [ ] Inventory accurate

### 6.3 WordPress Decommissioning

**Keep running for 30 days**:
```
atatreningsutstyr-old.no  (if needed for reference)
```

**After 30 days**:
- [ ] Archive WordPress database
- [ ] Backup to cloud storage (OneDrive)
- [ ] Decommission server
- [ ] Cancel hosting

## Data Migration Scripts

### Location
`apps/backend/src/migration-scripts/`

### Scripts Available

1. **import-wordpress-products.ts** (already exists)
   - Imports products from WordPress export
   - Creates variants
   - Maps categories
   - Loads stock

2. **import-customers.ts** (to create)
   - Imports customer data
   - Sets initial password (reset on first login)
   - Maps addresses

3. **sync-categories.ts** (to create)
   - Syncs product categories
   - Updates hierarchies

### Running Migrations

```bash
cd apps/backend

# Run specific migration
npm run migrate -- --script=import-wordpress-products

# Validate without committing
npm run migrate -- --script=import-customers --dry-run

# Show progress
npm run migrate -- --script=import-products --verbose
```

## Risk Assessment & Mitigation

### Risk 1: Data Loss
**Likelihood**: Low | **Impact**: Critical
**Mitigation**:
- [ ] Full database backup before migration
- [ ] Backup stored on separate Azure storage
- [ ] Test restore procedure
- [ ] Keep WordPress online for 30 days

### Risk 2: Performance Degradation
**Likelihood**: Medium | **Impact**: High
**Mitigation**:
- [ ] Load testing before cutover
- [ ] Database indexing optimized
- [ ] CDN for static assets
- [ ] Redis cache for hot queries
- [ ] Auto-scaling configured

### Risk 3: Tripletex Integration Broken
**Likelihood**: Medium | **Impact**: High
**Mitigation**:
- [ ] Test Medusa → Tripletex during parallel run
- [ ] Monitor order creation in Tripletex
- [ ] Fallback: Manual order creation in Tripletex
- [ ] Alert on sync failures

### Risk 4: Customer Confusion
**Likelihood**: Medium | **Impact**: Medium
**Mitigation**:
- [ ] Clear announcement of migration
- [ ] Password reset email with instructions
- [ ] Help documentation updated
- [ ] Support team trained and available
- [ ] FAQ published

### Risk 5: Image/Asset Loading Issues
**Likelihood**: High | **Impact**: Low
**Mitigation**:
- [ ] Images migrated to Azure Blob Storage (S3 compatible)
- [ ] CDN configured for fast delivery
- [ ] Fallback to original WordPress images
- [ ] Test image loading during Phase 3

## Success Criteria

### Go-Live Readiness Checklist

**Infrastructure**:
- [ ] Backend running stably on Azure
- [ ] Frontend deployed and accessible
- [ ] Database backups automated
- [ ] Monitoring & alerting configured
- [ ] DNS ready to switch
- [ ] SSL certificates valid

**Data**:
- [ ] All 539 products migrated
- [ ] Categories mapped correctly
- [ ] Inventory accurate
- [ ] Customer data available (new login required)
- [ ] Order history archived

**Features**:
- [ ] Browse products ✓
- [ ] Search works ✓
- [ ] Add to cart ✓
- [ ] Checkout process ✓
- [ ] Order confirmation ✓
- [ ] Account management ✓
- [ ] Tripletex integration ✓

**Performance**:
- [ ] Homepage load <2s
- [ ] Product page <2s
- [ ] API response <500ms (p95)
- [ ] Can handle 100+ concurrent users
- [ ] Handles spike traffic gracefully

**Monitoring**:
- [ ] Error logging active
- [ ] Performance metrics tracked
- [ ] Alerts configured
- [ ] Health checks passing
- [ ] Backup verification

## Communication Plan

### Before Migration

**Email to Customers** (1 week before):
```
Subject: Exciting Update! New Improved Website

We're upgrading to a faster, more reliable shopping experience.
Your account and data will transfer automatically.
You'll need to reset your password on first login (for security).

Website will remain available throughout the upgrade.
Estimated time: Same-day, minimal impact.
```

### During Cutover

**Status Page Update**:
- 9:00 PM: "Migration in progress, site may be slow"
- 10:00 PM: "Migration 50% complete"
- 11:00 PM: "Migration complete, some features being optimized"

### After Cutover

**Email to Customers** (same evening):
```
Subject: Welcome to the New ata Website!

Your new website is live with:
✓ Faster browsing experience
✓ Better mobile support
✓ Enhanced security
✓ Improved checkout

First time logging in? Reset your password using "Forgot Password"
```

## Rollback Procedure

**If critical issues occur**:

```
1. Identify issue (5 min)
   - Check error logs
   - Verify Tripletex orders
   - Monitor error rate

2. Decide: Fix or Rollback? (5 min)
   - If fixable <30 min: Attempt fix
   - If unknown/critical: Rollback immediately

3. Execute Rollback (5 min)
   - Change load balancer to WordPress
   - Send notification to customers
   - Alert support team

4. Post-Rollback (ongoing)
   - Investigate root cause
   - Fix issue
   - Re-test thoroughly
   - Schedule retry for next day
```

## Post-Migration Tasks (Month 1)

- [ ] Monitor stability (24/7 for first week)
- [ ] Gather customer feedback
- [ ] Optimize performance based on metrics
- [ ] Document lessons learned
- [ ] Plan Phase 4 features (product modules)
- [ ] Schedule WordPress decommissioning
- [ ] Plan advanced features (reviews, wishlists)

## Key Contacts

```
Technical Lead: [Your name]
Tripletex Admin: [Account owner]
Azure Admin: [Cloud admin]
Support Manager: [Support lead]
Marketing: [Marketing lead]
```

## Appendix: Technical Details

### Database Migration
- Source: WordPress MySQL
- Target: Azure PostgreSQL
- Tool: Custom migration scripts (Node.js)
- Verification: Row counts, data sampling, integrity checks

### File Storage
- Images: Currently in WordPress uploads
- Target: Azure Blob Storage (S3-compatible)
- Migration: Automated script with retry logic
- CDN: Azure CDN for caching

### Environment Variables (Production)

**Backend**:
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
STORE_CORS=https://atatreningsutstyr.no
JWT_SECRET=[generated]
COOKIE_SECRET=[generated]
```

**Storefront**:
```env
NODE_ENV=production
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.atatreningsutstyr.no
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_DEFAULT_REGION=dk
```

## Sign-Off

- [ ] Technical review completed
- [ ] Stakeholders approved
- [ ] Timeline confirmed
- [ ] Resources allocated
- [ ] Support trained

---

**Last Updated**: 2026-07-30  
**Version**: 1.0  
**Status**: Ready for Phase 1 execution
