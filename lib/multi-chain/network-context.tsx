"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useBuilderStore } from "../store";

interface NetworkContextType {
    networkType: "evm" | "stellar";
    setNetworkType: (type: "evm" | "stellar") => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const { network, setNetwork } = useBuilderStore();
    const [networkType, setLocalNetworkType] = useState<"evm" | "stellar">("evm");

    useEffect(() => {
        
        if (network === "stellar") {
            setLocalNetworkType("stellar");
        } else {
            setLocalNetworkType("evm");
        }
    }, [network]);

    const setNetworkType = (type: "evm" | "stellar") => {
        
        setLocalNetworkType(type);
        if (type === "stellar") {
            setNetwork("stellar");
        } else {
            setNetwork("celo");
        }
    };

    return (
        <NetworkContext.Provider value={{ networkType, setNetworkType }}>
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
