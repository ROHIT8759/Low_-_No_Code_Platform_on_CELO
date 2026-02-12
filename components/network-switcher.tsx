"use client";

import { useBuilderStore } from "@/lib/store";
import { useNetwork } from "@/lib/multi-chain/network-context";
import { cn } from "@/lib/utils";
import { Globe, Zap } from "lucide-react";

export function NetworkSwitcher() {
    const { network, setNetwork } = useBuilderStore();
    const { setNetworkType } = useNetwork();

    const handleSwitch = (newNetwork: "celo" | "stellar") => {
        setNetwork(newNetwork);
        setNetworkType(newNetwork === "stellar" ? "stellar" : "evm");
        
    };

    return (
        <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-lg border border-slate-800">
            <button
                onClick={() => handleSwitch("celo")}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    network === "celo"
                        ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
            >
                <Globe size={14} />
                <span>EVM Networks</span>
            </button>

            <button
                onClick={() => handleSwitch("stellar")}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    network === "stellar"
                        ? "bg-linear-to-r from-fuchsia-500 to-purple-500 text-white shadow-lg shadow-fuchsia-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
            >
                <Zap size={14} />
                <span>Stellar</span>
            </button>
        </div>
    );
}
