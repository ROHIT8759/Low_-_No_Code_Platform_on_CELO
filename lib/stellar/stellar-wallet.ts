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
    const allowed = await isAllowed();
    if (allowed) {
        const { address } = await getAddress();
        const networkObj = await getNetwork();
        
        const network = typeof networkObj === 'string' ? networkObj : networkObj?.network;

        return {
            isConnected: true,
            publicKey: address,
            network: network || null,
        };
    }
    return {
        isConnected: false,
        publicKey: null,
        network: null,
    };
}

export async function connectStellarWallet(): Promise<StellarWalletState> {
    await setAllowed();
    return await checkStellarConnection();
}

export interface SorobanTransactionParams {
    networkPassphrase: string;
    transactionXdr: string;
}

export async function signSorobanTransaction(
    xdr: string,
    networkPassphrase?: string
) {
    try {
        
        
        const opts: any = {};
        if (networkPassphrase) {
            opts.networkPassphrase = networkPassphrase;
        }
        const signedTransaction = await signTransaction(xdr, opts);
        return signedTransaction;
    } catch (error) {
        console.error("Failed to sign transaction:", error);
        throw error;
    }
}
