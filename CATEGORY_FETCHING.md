# Category Fetching Implementation

## Overview

The storefront fetches product categories server-side using a dual-approach strategy:
1. **Primary**: Medusa Store API (when API key auth is properly configured)
2. **Fallback**: Direct database access (for development/testing)

This approach ensures categories always display, even if the API key authentication encounters issues.

## Architecture

### Components

- **`src/lib/data/server-categories.ts`**: Core fetching logic
  - `fetchCategoriesFromAPI()`: Attempts to fetch from Medusa Store API
  - `fetchCategoriesFromDB()`: Falls back to direct database queries
  - `getCategories()`: Main export with automatic fallback strategy

- **`src/components/HeaderWrapper.tsx`**: Server-side wrapper
  - Async component that fetches categories during server rendering
  - Passes categories as props to the `Header` component

- **`src/components/Header.tsx`**: Client-side header display
  - Accepts categories as props
  - Falls back to hardcoded categories if none provided
  - Displays category navigation links

### Data Flow

```
PageLayout (Server Component)
    ↓
HeaderWrapper (Server Component)
    ├─→ fetchCategoriesFromAPI()  [Try Primary]
    │   ├─ Success → Return categories
    │   └─ Fail → Continue to fallback
    ├─→ fetchCategoriesFromDB()   [Try Fallback]
    │   ├─ Success → Return categories
    │   └─ Fail → Return empty array
    ↓
Header (Client Component)
    ├─ If categories provided → Display from props
    └─ If empty → Display hardcoded fallback categories
```

## Configuration

### Environment Variables

Required:
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`: API key for Medusa Store API (see below)
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL`: Backend URL (default: `http://localhost:9000`)

Optional:
- `DATABASE_URL`: Connection string for direct database access
  ```
  postgresql://postgres@localhost:5432/medusa-ata-medusa-store-new
  ```

### Example .env.local

```env
# API Configuration
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test_pubkey_f8a7b5c9d2e4f1a6b9c2d5e8f1a4b7c0
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Database Configuration (for fallback)
DATABASE_URL=postgresql://postgres@localhost:5432/medusa-ata-medusa-store-new
```

## Known Issues & Workarounds

### API Key Authentication

**Issue**: The Medusa Store API requires a valid publishable key, but the current test key has validation issues.

**Current Status**:
- Test key created: `pk_test_pubkey_f8a7b5c9d2e4f1a6b9c2d5e8f1a4b7c0`
- Linked to sales channel: ✓
- API validation: Failing (likely hashing issue)

**Workaround**:
Categories are fetched directly from the database, so the site continues to work despite API key issues.

**Resolution Path**:
1. Create a proper publishable key via the Medusa seed workflow
2. Ensure the key is correctly hashed and stored
3. Verify the key is linked to the default sales channel
4. Test with: `curl -H "x-publishable-api-key: <KEY>" http://localhost:9000/store/product-categories`

## Database Schema

Categories are stored in the `product_category` table:

```sql
SELECT id, name, handle, is_active, is_internal 
FROM product_category 
WHERE is_active = true AND is_internal = false
ORDER BY name;
```

Current categories:
- Apparel
- Accessories
- Cardio
- Strength Training

## Performance Considerations

- **Server-side rendering**: Categories are fetched during page server rendering, so they're cached until the page rebuilds
- **No caching headers on API calls**: `cache: 'no-store'` ensures fresh data on each request
- **Database connection pooling**: Consider adding pg connection pooling for production
- **Error handling**: All failures are logged but gracefully handled with fallbacks

## Future Improvements

1. **Dynamic API Key Management**: Implement proper key rotation and validation
2. **Redis Caching**: Add Redis layer for category caching in production
3. **Sales Channel Filtering**: Query only categories for the current sales channel
4. **Pagination**: Limit categories to root-level only if needed
5. **Search/Filter Support**: Add category search and filtering capabilities
6. **Image Assets**: Include category images in the response
7. **Product Count**: Display number of products per category

## Testing

### Test API Endpoint Directly

```bash
# Test with current API key
curl -H "x-publishable-api-key: pk_test_pubkey_f8a7b5c9d2e4f1a6b9c2d5e8f1a4b7c0" \
  http://localhost:9000/store/product-categories

# Expected response
{
  "product_categories": [
    {
      "id": "pcat_01...",
      "name": "Shirts",
      "handle": "shirts",
      ...
    }
  ]
}
```

### Test Database Fallback

```bash
psql -U postgres -d medusa-ata-medusa-store-new -c \
  "SELECT id, name, handle FROM product_category 
   WHERE is_active = true AND is_internal = false;"
```

### Verify Storefront Display

```bash
curl http://localhost:8000/ -L | grep -o 'href="/categories/[^"]*">[^<]*</a>'
```

Expected output:
```
href="/categories/apparel">Apparel</a>
href="/categories/accessories">Accessories</a>
href="/categories/cardio">Cardio</a>
href="/categories/strength-training">Strength Training</a>
```

## Related Documentation

- Medusa API: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys
- PostgreSQL Client: https://node-postgres.com/
- Next.js Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
