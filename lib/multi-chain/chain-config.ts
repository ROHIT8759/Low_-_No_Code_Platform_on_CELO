import { STELLAR_NETWORKS } from "../stellar/stellar-config";

export const CHAIN_CONFIG = {
    stellar: STELLAR_NETWORKS,
};

export type ChainType = keyof typeof CHAIN_CONFIG;
