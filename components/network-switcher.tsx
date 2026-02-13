"use client";

import { useNetwork } from "@/lib/multi-chain/network-context";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

export function NetworkSwitcher() {
    const { stellarNetwork, setStellarNetwork } = useNetwork();

    return (
        <div className="flex items-center gap-1 p-0.5 bg-[var(--surface-2)] rounded-lg border border-white/[0.08]">
            <button
                onClick={() => setStellarNetwork("testnet")}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    stellarNetwork === "testnet"
                        ? "bg-[var(--surface-3)] text-white border border-primary/40"
                        : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                <Zap size={12} />
                <span>Testnet</span>
            </button>

            <button
                onClick={() => setStellarNetwork("mainnet")}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    stellarNetwork === "mainnet"
                        ? "bg-[var(--surface-3)] text-white border border-emerald-500/40"
                        : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                <Zap size={12} />
                <span>Mainnet</span>
            </button>
        </div>
    );
}
