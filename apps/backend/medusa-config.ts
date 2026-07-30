import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { secretsManager } from './src/config/secrets'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * Load configuration with Azure Key Vault support
 * - Development: Uses .env.local files
 * - Production: Uses Azure Key Vault
 */
module.exports = defineConfig({
  projectConfig: {
    // Secrets: Use Key Vault in production, .env in development
    databaseUrl: secretsManager.getSecretSync('DATABASE_URL') || process.env.DATABASE_URL,
    http: {
      storeCors: secretsManager.getSecretSync('STORE_CORS') || process.env.STORE_CORS!,
      adminCors: secretsManager.getSecretSync('ADMIN_CORS') || process.env.ADMIN_CORS!,
      authCors: secretsManager.getSecretSync('AUTH_CORS') || process.env.AUTH_CORS!,
      jwtSecret: secretsManager.getSecretSync('JWT_SECRET') || process.env.JWT_SECRET,
      cookieSecret: secretsManager.getSecretSync('COOKIE_SECRET') || process.env.COOKIE_SECRET,
    }
  }
})
