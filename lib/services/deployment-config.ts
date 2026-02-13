export const STELLAR_NETWORK_CONFIG = {
  testnet: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  mainnet: {
    horizonUrl: 'https://horizon.stellar.org',
    sorobanRpcUrl: 'https://soroban-mainnet.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
} as const;

export const EVM_NETWORK_CONFIG = {
  CELO_MAINNET: {
    chainId: 42220,
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
  },
  CELO_ALFAJORES: {
    chainId: 44787,
    name: 'Celo Alfajores Testnet',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  },
} as const;
