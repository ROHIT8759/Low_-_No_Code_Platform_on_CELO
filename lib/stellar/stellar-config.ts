export const STELLAR_NETWORKS = {
    TESTNET: {
        network: "TESTNET",
        networkUrl: "https://horizon-testnet.stellar.org",
        sorobanRpcUrl: "https://soroban-testnet.stellar.org",
        networkPassphrase: "Test SDF Network ; September 2015",
        appName: "Block Builder",
    },
    MAINNET: {
        network: "PUBLIC",
        networkUrl: "https://horizon.stellar.org",
        sorobanRpcUrl: "https://soroban-mainnet.stellar.org",
        networkPassphrase: "Public Global Stellar Network ; September 2015",
        appName: "Block Builder",
    },
} as const;

export type StellarNetwork = keyof typeof STELLAR_NETWORKS;
