"use client";

import React from "react";
import { Copy, Terminal, Check, Activity, Shield, Box } from "lucide-react";
import { TelemetryMicrobar } from "./telemetry-microbar";

export function ProductWindow() {
    return (
        <div className="w-full h-full relative group">
            {}
            <div className="relative w-full aspect-16/10 bg-[var(--surface-0)] rounded-lg border border-white/[0.1] shadow-2xl overflow-hidden flex flex-col">

                {}
                <div className="h-9 bg-[var(--surface-1)] border-b border-white/[0.08] flex items-center px-3 justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--surface-3)]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--surface-3)]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--surface-3)]" />
                        </div>
                        <div className="h-4 w-px bg-white/[0.08] mx-2" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3 h-3" />
                            Soroban_Context_v4.rs
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--surface-0)] border border-white/[0.08]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-mono text-zinc-400">Mainnet Connected</span>
                        </div>
                    </div>
                </div>

                {/* Telemetry Microbar */}
                <TelemetryMicrobar />

                {}
                <div className="flex-1 flex overflow-hidden">

                    {}
                    <div className="w-12 border-r border-white/[0.08] bg-[var(--surface-1)]/70 flex flex-col items-center py-3 gap-3">
                        <Box className="w-4 h-4 text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                        <Shield className="w-4 h-4 text-zinc-500 hover:text-white transition-colors cursor-pointer" />
                        <Terminal className="w-4 h-4 text-white cursor-pointer" />
                    </div>

                    {}
                    <div className="flex-1 bg-[var(--surface-0)] p-4 font-mono text-[11px] leading-relaxed text-zinc-400 overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-0 w-8 border-r border-white/[0.06] bg-[var(--surface-0)] flex flex-col items-end pr-2 pt-4 text-zinc-700 select-none">
                            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div>
                        </div>
                        <div className="pl-10 h-full">
                            <span className="text-amber-300">pub trait</span> <span className="text-amber-200">SorobanToken</span> {"{"}
                            <br />
                            &nbsp;&nbsp;<span className="text-zinc-500">// Token initialization</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-amber-300">fn</span> <span className="text-sky-300">initialize</span>(e: Env, admin: Address, decimal: u32);
                            <br />
                            <br />
                            &nbsp;&nbsp;<span className="text-zinc-500">// Minting function</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-amber-300">fn</span> <span className="text-sky-300">mint</span>(e: Env, to: Address, amount: i128) {"{"}
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;admin.require_auth();
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;balances::write_balance(&e, to, amount);
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;events::mint(&e, admin, to, amount);
                            <br />
                            &nbsp;&nbsp;{"}"}
                            <br />
                            <br />
                            &nbsp;&nbsp;<span className="text-zinc-500">// State verification</span>
                            <br />
                            &nbsp;&nbsp;<span className="text-amber-300">fn</span> <span className="text-sky-300">verify_state</span>(e: Env) -&gt; State;
                            <br />
                            {"}"}
                        </div>
                    </div>

                </div>

                {}
                <div className="h-20 border-t border-white/[0.08] bg-[var(--surface-1)]/70 p-3 font-mono text-[10px] overflow-hidden">
                    <div className="flex items-center gap-2 text-zinc-500 mb-1 border-b border-white/[0.06] pb-1">
                        <Terminal className="w-3 h-3" />
                        <span>Output</span>
                    </div>
                    <div className="space-y-1 overflow-hidden">
                        <div className="flex gap-2">
                            <span className="text-zinc-600">➜</span>
                            <span className="text-zinc-400">compiling <span className="text-white">contract_v1.wasm</span> --release</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-zinc-600"> </span>
                            <span className="text-zinc-500">Optimizing... 128kb -&gt; 14kb (WASM-OPT)</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-zinc-600"> </span>
                            <span className="text-emerald-500 flex items-center gap-1"><Check className="w-2 h-2" /> Build Successful</span>
                            <span className="text-zinc-600 ml-2">142ms</span>
                        </div>
                    </div>
                </div>

            </div>

            {}
            <div className="absolute -z-10 top-[-20%] right-[-10%] w-[120%] h-[140%] opacity-20 pointer-events-none">
                <div className="absolute top-10 right-10 w-px h-[400px] bg-linear-to-b from-transparent via-[#4C8DFF] to-transparent" />
                <div className="absolute top-[200px] right-0 w-[400px] h-px bg-linear-to-r from-transparent via-[#4C8DFF] to-transparent" />
            </div>

        </div>
    );
}
