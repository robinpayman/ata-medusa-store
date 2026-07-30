# Quick Start Guide - ata Medusa Store

## What is a Publishable API Key?

The **Publishable API Key** is a public credential that allows your storefront to communicate with the Medusa backend API. It's already configured in your `.env.local` file, but the backend needs to be running for it to work properly.

Think of it like:
- Your frontend is a customer in a store
- Your backend is the store manager
- The Publishable Key is your ID card that says "I'm allowed to shop here"

## Getting Started

### Option 1: Docker (Recommended for Deployment)

**Requirements**: Docker & Docker Compose installed

```bash
./deploy.sh
# Select option 1: Local development (docker-compose)
```

This starts:
- PostgreSQL database
- Redis cache
- Medusa backend (port 9000)
- Next.js storefront (port 8000)

Access the store at: **http://localhost:8000**

### Option 2: Local Development (Without Docker)

**Requirements**:
- Node.js 20+
- PostgreSQL 15+ (running locally)
- Redis 7+ (running locally)

```bash
./deploy.sh
# Select option 3: Local development
```

Or manually:

```bash
# Terminal 1: Start backend
cd apps/backend
npm install
npm run build
npm run dev

# Terminal 2: Start storefront
cd apps/storefront
npm install
npm run dev
```

Access the store at: **http://localhost:8000**

## What Happens on First Run?

1. **Backend starts** on port 9000
   - Initializes database
   - Creates tables and schema
   - Registers the Publishable Key

2. **Storefront starts** on port 8000
   - Connects to backend using the Publishable Key
   - Loads products and categories
   - Ready for testing

## Testing the System

### 1. Create a Test Account

1. Go to http://localhost:8000
2. Click "Opprett konto" (Register)
3. Fill in test credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - Name: `Test User`

### 2. Browse Products

1. Click "Se Alle Produkter" (View All Products)
2. Add products to cart
3. Proceed to checkout

### 3. Test Checkout Flow

1. Fill in shipping address
2. Select payment method
3. Review order
4. Complete checkout

### 4. View Account

1. Go to `/account` (after logging in)
2. View profile information
3. Check order history (should show test order)

## Common Issues

### "Module not found: Can't resolve './medusa-client'"

**Cause**: Import path is wrong
**Fix**: Already fixed in the codebase, but make sure you're on the latest main branch

```bash
git pull origin main
npm install
```

### "Database connection refused"

**Cause**: PostgreSQL isn't running
**Fix**: Using Docker Compose? Make sure it's started:

```bash
docker-compose up -d
```

### "Can't connect to backend from storefront"

**Cause**: Backend not running or CORS misconfigured
**Fix**:

1. Check backend is running: `curl http://localhost:9000`
2. Check CORS settings in `apps/backend/.env`
3. Restart both services

### "Port 8000 already in use"

**Cause**: Another service is using that port
**Fix**:

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
NEXTPORT=3000 npm run dev  # in apps/storefront
```

## Environment Variables Explained

**Storefront** (`.env.local`):

```env
# Public Medusa Publishable Key - allows storefront to read products, carts, orders
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...

# Backend API URL - where to send requests
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Default region - affects pricing and availability
NEXT_PUBLIC_DEFAULT_REGION=dk
```

**Backend** (`apps/backend/.env`):

```env
# Database connection
DATABASE_URL=postgres://postgres@localhost/medusa_db

# Cache layer
REDIS_URL=redis://localhost:6379

# CORS: which domains can access the API
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:5173

# Security: keys for JWT and cookies
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

## Development Workflow

1. **Make changes** to code in `apps/storefront/` or `apps/backend/`
2. **Storefront** hot-reloads automatically
3. **Backend** requires rebuild:
   ```bash
   cd apps/backend
   npm run build
   # Then restart: npm run dev
   ```

## Deploying to Production

When ready to deploy to Azure (24/7 operation):

```bash
./deploy.sh
# Select option 2: Build Docker images for cloud
```

Then follow instructions in `DEPLOYMENT.md`.

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f storefront

# Stop everything
docker-compose down

# Restart a specific service
docker-compose restart backend

# Full reset (WARNING: deletes database)
docker-compose down -v
docker-compose up -d

# Check if services are running
docker-compose ps

# Access backend API directly
curl http://localhost:9000/store/products

# Access storefront
open http://localhost:8000
```

## Project Structure

```
ata-medusa-store/
├── apps/
│   ├── backend/          # Medusa Node.js API
│   │   ├── src/
│   │   │   ├── api/      # API routes (/store, /admin)
│   │   │   └── modules/  # Custom business logic
│   │   └── medusa-config.ts
│   └── storefront/       # Next.js React app
│       ├── src/
│       │   ├── app/      # Pages and routes
│       │   ├── components/
│       │   ├── lib/api/  # API calls
│       │   └── context/  # State management
│       └── next.config.ts
├── docker-compose.yml    # Local full-stack setup
├── Dockerfile.backend    # Backend container image
├── Dockerfile.storefront # Storefront container image
├── DEPLOYMENT.md         # Cloud deployment guide
└── deploy.sh            # One-command deployment script
```

## Architecture

```
User Browser (http://localhost:8000)
        ↓
   Next.js Frontend
   (apps/storefront)
        ↓ (REST API calls)
   Medusa Backend (http://localhost:9000)
   (apps/backend)
        ↓
   PostgreSQL Database
   Redis Cache
```

## Next Steps

After confirming everything works locally:

1. **Review Phase 4 Plan**: Product modules, admin features, advanced product pages
2. **Deploy to Azure**: Use `./deploy.sh` option 2
3. **Set up CI/CD**: Automated builds and deployments on Git push
4. **Configure DNS**: Point `atatreningsutstyr.no` to your Azure deployment

## Questions?

- Check `DEPLOYMENT.md` for cloud setup
- Review Phase 4 plan for upcoming features
- Check GitHub issues or project boards for tasks

---

**Happy developing! 🚀**
