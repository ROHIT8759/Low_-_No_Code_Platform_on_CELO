"use client";

import React, { createContext, useContext, useState } from "react";

interface NetworkContextType {
    networkType: "stellar";
    stellarNetwork: "testnet" | "mainnet";
    setStellarNetwork: (net: "testnet" | "mainnet") => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [stellarNetwork, setStellarNetwork] = useState<"testnet" | "mainnet">("testnet");

    return (
        <NetworkContext.Provider value={{ networkType: "stellar", stellarNetwork, setStellarNetwork }}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetwork() {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error("useNetwork must be used within a NetworkProvider");
    }
    return context;
}
