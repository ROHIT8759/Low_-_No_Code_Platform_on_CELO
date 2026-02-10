import { STELLAR_NETWORKS } from "../stellar/stellar-config";

export const EVM_NETWORKS = {
    CELO_MAINNET: {
        chainId: 42220,
        name: "Celo Mainnet",
        rpcUrl: "https://forno.celo.org",
        explorerUrl: "https://celoscan.io",
        currency: "CELO",
    },
    CELO_ALFAJORES: {
        chainId: 44787,
        name: "Celo Alfajores Testnet",
        rpcUrl: "https://alfajores-forno.celo-testnet.org",
        explorerUrl: "https://alfajores.celoscan.io",
        currency: "CELO",
    },
} as const;

export const CHAIN_CONFIG = {
    evm: EVM_NETWORKS,
    stellar: STELLAR_NETWORKS,
};

export type ChainType = keyof typeof CHAIN_CONFIG;
