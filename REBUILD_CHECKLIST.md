# Fresh Medusa Webshop Rebuild - Execution Checklist

## PHASE 1: Foundation (Steps 1-4)
- [ ] Reset PostgreSQL database (drop and recreate medusa-ata-medusa-store)
- [ ] Initialize Medusa with clean migrations
- [ ] Verify Medusa backend starts and API responds
- [ ] Create publishable API key and store in Azure Key Vault

## PHASE 2: Storefront Setup (Steps 5-7)
- [ ] Configure Next.js storefront .env with correct API key and backend URL
- [ ] Test storefront can connect to backend API
- [ ] Verify seeded products display in storefront

## PHASE 3: Content & Design (Steps 8-10)
- [ ] Extract product images from atatreningsutstyr.no via SSH/WP-CLI
- [ ] Extract product descriptions and metadata from WordPress
- [ ] Upgrade storefront design (UX/SEO best practices, Lighthouse 90+)

## PHASE 4: Import Products (Step 11)
- [ ] Import 530 WordPress products to Medusa
- [ ] Preserve WordPress product IDs (external_id and SKU)
- [ ] Verify all products appear in API and storefront

## PHASE 5: Integrations (Steps 12-13)
- [ ] Implement product sync between Medusa and Tripletex
- [ ] Implement order sync from Medusa to Tripletex

## PHASE 6: Testing & Deployment (Steps 14-15)
- [ ] Test staging deployment
- [ ] Plan and execute live cutover

