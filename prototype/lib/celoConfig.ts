// Celo Network Configuration and Contract Interaction Helpers

export const CELO_NETWORKS = {
  alfajores: {
    name: 'Alfajores Testnet',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    chainId: 44787,
    explorer: 'https://alfajores.celoscan.io',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  mainnet: {
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    chainId: 42220,
    explorer: 'https://celoscan.io',
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
} as const

export type CeloNetwork = keyof typeof CELO_NETWORKS

// Stable token addresses
export const STABLE_TOKEN_ADDRESSES = {
  alfajores: {
    cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    cEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    cREAL: '0xE4D517785D091D3c54818832dB6094bcc2744545',
  },
  mainnet: {
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
  },
} as const

/**
 * Get the RPC URL for a specific Celo network
 */
export function getRpcUrl(network: CeloNetwork): string {
  return CELO_NETWORKS[network].rpcUrl
}

/**
 * Get the chain ID for a specific Celo network
 */
export function getChainId(network: CeloNetwork): number {
  return CELO_NETWORKS[network].chainId
}

/**
 * Get the block explorer URL for a specific network
 */
export function getExplorerUrl(network: CeloNetwork): string {
  return CELO_NETWORKS[network].explorer
}

/**
 * Get the stable token address for a specific token and network
 */
export function getStableTokenAddress(
  network: CeloNetwork,
  token: 'cUSD' | 'cEUR' | 'cREAL'
): string {
  return STABLE_TOKEN_ADDRESSES[network][token]
}

/**
 * Format a transaction hash for explorer link
 */
export function formatTxUrl(network: CeloNetwork, txHash: string): string {
  return `${getExplorerUrl(network)}/tx/${txHash}`
}

/**
 * Format a contract address for explorer link
 */
export function formatAddressUrl(network: CeloNetwork, address: string): string {
  return `${getExplorerUrl(network)}/address/${address}`
}

/**
 * Shorten an address for display (0x1234...5678)
 */
export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Validate Celo address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Format amount with decimals
 */
export function formatAmount(amount: string | number, decimals = 18): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return (num / Math.pow(10, decimals)).toFixed(4)
}
