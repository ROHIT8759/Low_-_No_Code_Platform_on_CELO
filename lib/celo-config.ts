export const CELO_NETWORKS = {
  sepolia: {
    chainId: 11142220,
    name: 'Celo Sepolia Testnet',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    explorerUrl: 'https://celo-sepolia.blockscout.com',
    testnet: true,
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  mainnet: {
    chainId: 42220,
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://celoscan.io',
    testnet: false,
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
} as const;

export type CeloNetwork = keyof typeof CELO_NETWORKS;
