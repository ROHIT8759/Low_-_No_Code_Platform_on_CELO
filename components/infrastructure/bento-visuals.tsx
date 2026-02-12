"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Check, Terminal, FileCode, Layers, ArrowRight, Activity, ShieldCheck } from "lucide-react"

// 1. WASM Compilation: Mock Terminal
export function WasmCompilationVisual() {
    const [step, setStep] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 4)
        }, 1500)
        return () => clearInterval(interval)
    }, [])

    const lines = [
        { text: "cargo build --target wasm32", color: "text-zinc-400" },
        { text: "Compiling soroban-contract...", color: "text-zinc-300" },
        { text: "Optimizing bytecode (LTO)...", color: "text-blue-400" },
        { text: "Build Success [14kb]", color: "text-emerald-400" },
    ]

    return (
        <div className="flex flex-1 w-full h-full min-h-32 rounded-md bg-[#0D1117] border border-[#222730] p-3 font-mono text-[10px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-6 bg-[#161B22] border-b border-[#222730] flex items-center px-2 gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
            </div>
            <div className="mt-6 flex flex-col gap-1">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: i <= step ? 1 : 0, x: i <= step ? 0 : -10 }}
                        className={`${line.color} flex items-center gap-2`}
                    >
                        <span className="text-zinc-700">{">"}</span> {line.text}
                    </motion.div>
                ))}
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-1.5 h-3 bg-zinc-500 mt-1"
                />
            </div>
        </div>
    )
}

// 2. State Expiration: Data Viz
export function StateExpirationVisual() {
    return (
        <div className="flex flex-1 w-full h-full min-h-32 rounded-md bg-[#0B0F14] border border-[#222730] p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />

            <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Storage rent</span>
                <Activity className="w-3 h-3 text-primary animate-pulse" />
            </div>

            <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-zinc-400">Entry_0x8a</span>
                    <span className="text-emerald-500">Active</span>
                </div>
                <div className="w-full h-1 bg-[#1A1F26] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: "100%" }}
                        animate={{ width: "40%" }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    />
                </div>

                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-zinc-400">Entry_0x2b</span>
                    <span className="text-yellow-500">Expiring</span>
                </div>
                <div className="w-full h-1 bg-[#1A1F26] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-yellow-500"
                        initial={{ width: "80%" }}
                        animate={{ width: "10%" }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                    />
                </div>
            </div>
        </div>
    )
}

// 3. Formal Verification: Scanning
export function FormalVerificationVisual() {
    return (
        <div className="flex flex-1 w-full h-full min-h-32 rounded-md bg-[#0D1117] border border-[#222730] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/5" />

            {/* Code lines */}
            <div className="w-3/4 space-y-1.5 opacity-50">
                <div className="w-full h-1.5 bg-zinc-800 rounded-sm" />
                <div className="w-2/3 h-1.5 bg-zinc-800 rounded-sm" />
                <div className="w-3/4 h-1.5 bg-zinc-800 rounded-sm" />
                <div className="w-1/2 h-1.5 bg-zinc-800 rounded-sm" />
                <div className="w-full h-1.5 bg-zinc-800 rounded-sm" />
            </div>

            {/* Scanner Line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-primary/20 to-transparent border-t border-primary/50"
                initial={{ top: "-20%" }}
                animate={{ top: "120%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Success Badge */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#090C10] border border-emerald-900/50 px-2 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-mono text-emerald-500">VERIFIED</span>
            </div>
        </div>
    )
}

// 4. Cross-Contract: Nodes
export function CrossContractVisual() {
    return (
        <div className="flex flex-1 w-full h-full min-h-32 rounded-md bg-[#11151A] border border-[#222730] relative p-4 overflow-hidden">

            {/* Nodes */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2 w-10 h-10 rounded bg-[#1A1F26] border border-[#30363D] flex items-center justify-center z-10">
                <FileCode className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="absolute top-1/2 right-8 -translate-y-1/2 w-10 h-10 rounded bg-[#1A1F26] border border-[#30363D] flex items-center justify-center z-10">
                <Layers className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Connecting Particles */}
            <motion.div
                className="absolute top-1/2 left-20 w-3 h-3 bg-primary rounded-full blur-[2px]"
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 160, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ translateY: "-50%" }}
            />

            <div className="absolute top-1/2 left-14 right-14 h-[1px] bg-zinc-800 border-t border-dashed border-zinc-700 -translate-y-1/2" />

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#090C10] px-2 py-0.5 rounded border border-[#222730]">
                <span className="text-[9px] font-mono text-zinc-500">INVOKE_CONTRACT</span>
            </div>
        </div>
    )
}
