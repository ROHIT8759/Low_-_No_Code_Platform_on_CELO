/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

export interface EnvValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

const REQUIRED_ENV_VARS = [
  // Stellar Configuration
  'NEXT_PUBLIC_STELLAR_NETWORK',
  
  // Supabase (optional but recommended)
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const OPTIONAL_ENV_VARS = [
  // AI/ML Services
  'GEMINI_API_KEY', // Server-side preferred
  'NEXT_PUBLIC_GEMINI_API_KEY', // Client-side (deprecated, use server-side)
  
  // Redis (optional - will fallback to memory)
  'REDIS_URL',
  'REDIS_TOKEN',
  
  // Stellar RPC (optional - uses defaults)
  'STELLAR_RPC_URL',
  'STELLAR_TESTNET_RPC_URL',
]

export function validateEnv(): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  // Check optional variables and add warnings
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (!process.env[envVar]) {
      warnings.push(`Optional ${envVar} not set`)
    }
  }

  // Security warnings
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    warnings.push('NEXT_PUBLIC_GEMINI_API_KEY is exposed client-side. Consider using GEMINI_API_KEY server-side only.')
  }

  // Stellar-specific validation
  const stellarNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK
  if (stellarNetwork && !['testnet', 'mainnet', 'futurenet'].includes(stellarNetwork)) {
    missing.push(`Invalid NEXT_PUBLIC_STELLAR_NETWORK: ${stellarNetwork}. Must be testnet, mainnet, or futurenet.`)
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

export function validateStellarConfig(): { valid: boolean; error?: string } {
  // Validate Stellar network configuration
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet'
  
  const validNetworks = ['testnet', 'mainnet', 'futurenet']
  if (!validNetworks.includes(network)) {
    return {
      valid: false,
      error: `Invalid Stellar network: ${network}. Must be one of: ${validNetworks.join(', ')}`,
    }
  }

  // Validate custom RPC URLs if provided
  if (process.env.STELLAR_RPC_URL) {
    try {
      new URL(process.env.STELLAR_RPC_URL)
    } catch {
      return {
        valid: false,
        error: `Invalid STELLAR_RPC_URL: ${process.env.STELLAR_RPC_URL}`,
      }
    }
  }

  return { valid: true }
}

export function assertEnv(): void {
  const result = validateEnv()
  
  if (!result.valid) {
    console.error('❌ Missing required environment variables:')
    result.missing.forEach(v => console.error(`   - ${v}`))
    console.error('\nPlease set these variables in your .env file')
    
    if (typeof window === 'undefined') {
      // Server-side only
      process.exit(1)
    }
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:')
    result.warnings.forEach(w => console.warn(`   - ${w}`))
  }

  // Validate Stellar config
  const stellarResult = validateStellarConfig()
  if (!stellarResult.valid) {
    console.error('❌ Stellar configuration error:', stellarResult.error)
    
    if (typeof window === 'undefined') {
      process.exit(1)
    }
  }
}
