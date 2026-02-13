import {
    isAllowed,
    setAllowed,
    getAddress,
    getNetwork,
    signTransaction,
} from "@stellar/freighter-api";

export interface StellarWalletState {
    isConnected: boolean;
    publicKey: string | null;
    network: string | null;
}

export async function checkStellarConnection(): Promise<StellarWalletState> {
    try {
        const allowedResult = await isAllowed();
        // Newer API returns { isAllowed: boolean }, older returns boolean
        const isAllowedVal = typeof allowedResult === 'object' && allowedResult !== null
            ? (allowedResult as any).isAllowed
            : allowedResult;

        if (isAllowedVal) {
            const addressResult = await getAddress();
            // Newer API returns { address: string }, older returns string
            const address = typeof addressResult === 'object' && addressResult !== null
                ? (addressResult as any).address
                : String(addressResult);

            const networkResult = await getNetwork();
            // Newer API returns { network: string }, older returns string
            const network = typeof networkResult === 'object' && networkResult !== null
                ? (networkResult as any).network || (networkResult as any).networkPassphrase
                : String(networkResult);

            if (address) {
                return {
                    isConnected: true,
                    publicKey: address,
                    network: network || null,
                };
            }
        }
    } catch (err) {
        console.error("checkStellarConnection error:", err);
    }
    return {
        isConnected: false,
        publicKey: null,
        network: null,
    };
}

export async function connectStellarWallet(): Promise<StellarWalletState> {
    try {
        await setAllowed();
    } catch (err) {
        console.error("setAllowed error:", err);
    }
    return await checkStellarConnection();
}

export interface SorobanTransactionParams {
    networkPassphrase: string;
    transactionXdr: string;
}

export async function signSorobanTransaction(
    xdr: string,
    networkPassphrase?: string
): Promise<string> {
    try {
        const opts: any = {};
        if (networkPassphrase) {
            opts.networkPassphrase = networkPassphrase;
        }
        const result = await signTransaction(xdr, opts);
        // Newer freighter-api returns { signedTxXdr, signerAddress }
        // Older versions return a plain string
        if (typeof result === 'string') {
            return result;
        }
        if (result && typeof result === 'object' && 'signedTxXdr' in result) {
            return (result as any).signedTxXdr;
        }
        return String(result);
    } catch (error) {
        console.error("Failed to sign transaction:", error);
        throw error;
    }
}
