export const STELLAR_NETWORKS = {
    TESTNET: {
        network: "TESTNET",
        networkUrl: "https://horizon-testnet.stellar.org",
        appName: "Block Builder X",
    },
    MAINNET: {
        network: "PUBLIC",
        networkUrl: "https://horizon.stellar.org",
        appName: "Block Builder X",
    },
    FUTURENET: {
        network: "FUTURENET",
        networkUrl: "https://horizon-futurenet.stellar.org",
        appName: "Block Builder X",
    },
} as const;

export type StellarNetwork = keyof typeof STELLAR_NETWORKS;
