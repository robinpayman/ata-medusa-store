import { DefaultAzureCredential } from "@azure/identity"
import { SecretClient } from "@azure/keyvault-secrets"

/**
 * SecretsManager handles loading secrets from Azure Key Vault in production
 * and from .env files in development
 */
class SecretsManager {
  private client: SecretClient | null = null
  private cache: Map<string, string> = new Map()
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production"
  }

  private getClient(): SecretClient {
    if (this.client) {
      return this.client
    }

    const keyVaultName = process.env.KEY_VAULT_NAME
    if (!keyVaultName) {
      throw new Error(
        "KEY_VAULT_NAME environment variable is not set. Set it to your Key Vault name (e.g., ata-medusa-kv)"
      )
    }

    const vaultUrl = `https://${keyVaultName}.vault.azure.net/`
    const credential = new DefaultAzureCredential()
    this.client = new SecretClient(vaultUrl, credential)
    return this.client
  }

  async getSecret(name: string): Promise<string> {
    // In development, use .env files
    if (this.isDevelopment) {
      const envValue = process.env[name.replace(/-/g, "_").toUpperCase()]
      if (envValue) {
        return envValue
      }
      throw new Error(
        `Secret ${name} not found in environment variables. Add it to .env.local`
      )
    }

    // In production, use Azure Key Vault
    // Check cache first
    if (this.cache.has(name)) {
      return this.cache.get(name)!
    }

    try {
      const client = this.getClient()
      const secret = await client.getSecret(name)
      if (secret.value) {
        // Cache the secret
        this.cache.set(name, secret.value)
        return secret.value
      }
      throw new Error(`Secret ${name} not found in Key Vault`)
    } catch (error: any) {
      console.error(`Failed to retrieve secret ${name} from Key Vault:`, error.message)
      throw new Error(
        `Failed to retrieve secret ${name}. Ensure it exists in Azure Key Vault and the application has permission to access it.`
      )
    }
  }

  async getSecrets(names: string[]): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {}
    for (const name of names) {
      secrets[name] = await this.getSecret(name)
    }
    return secrets
  }

  /**
   * Get a secret with a fallback to environment variable for development
   */
  getSecretSync(name: string, envVarName?: string): string | undefined {
    const varName = envVarName || name.replace(/-/g, "_").toUpperCase()
    return process.env[varName]
  }
}

export const secretsManager = new SecretsManager()
