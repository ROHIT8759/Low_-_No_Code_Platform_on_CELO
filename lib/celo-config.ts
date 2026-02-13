/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Celo/EVM support has been discontinued. This platform is now Stellar-only.
 * 
 * For Stellar network configuration, use:
 * @see lib/stellar/stellar-config.ts
 * 
 * All EVM-related functionality has been removed from the codebase.
 * If you need EVM support, use an earlier version of this codebase.
 */

console.warn('[DEPRECATED] celo-config.ts is deprecated. Stellar-only platform.')

export const CELO_NETWORKS = {} as const;
export type CeloNetwork = never;
