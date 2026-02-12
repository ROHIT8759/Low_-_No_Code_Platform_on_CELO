"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Code2 } from "lucide-react"

const abiSnippets = [
    { type: "fn", name: "token_symbol", inputs: "(contract: Address)", output: "Symbol" },
    { type: "evt", name: "transfer", inputs: "from: Address, to: Address, amount: i128", output: "void" },
    { type: "fn", name: "mint", inputs: "(to: Address, amount: i128)", output: "void" },
    { type: "sys", name: "xdr_encode", inputs: "(val: ScVal)", output: "Bytes" },
]

export default function HeroVisualization() {
    const [activeSnippet, setActiveSnippet] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSnippet((prev) => (prev + 1) % abiSnippets.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-zinc-950/50">
            {/* Structural Grid Background (Local) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

            {/* ABI Visualization Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-[90%] mx-auto z-10"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl -z-10 rounded-full" />

                <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-xl p-4 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 border-b border-zinc-800/50 pb-3">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                            <Code2 size={14} className="text-indigo-400" />
                            <span>Smart Contract Logic</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400"></span>
                            </span>
                            <span>Parsing ABI</span>
                        </div>
                    </div>

                    {/* Code Snippet Area */}
                    <div className="relative h-20 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSnippet}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-center w-full"
                            >
                                <div className="flex items-center justify-center gap-2 mb-1.5">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${abiSnippets[activeSnippet].type === 'function'
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                                        : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                                        }`}>
                                        {abiSnippets[activeSnippet].type}
                                    </span>
                                    <span className="font-mono font-semibold text-sm text-zinc-200">
                                        {abiSnippets[activeSnippet].name}
                                    </span>
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 mb-1 truncation max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-4">
                                    {abiSnippets[activeSnippet].inputs}
                                </div>
                                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-600">
                                    <ArrowRight size={10} />
                                    <span className="text-indigo-400 font-mono">{abiSnippets[activeSnippet].output}</span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Architectural Data Flow (No Blobs) */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Horizontal Precision Lines */}
                        <div className="absolute top-1/3 left-0 w-full h-px bg-indigo-500/10" />
                        <div className="absolute bottom-1/3 left-0 w-full h-px bg-indigo-500/10" />

                        {/* Active Data Packets */}
                        <motion.div
                            className="absolute top-1/3 left-0 w-4 h-[1px] bg-indigo-400 box-shadow-glow"
                            animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            className="absolute bottom-1/3 right-0 w-4 h-[1px] bg-indigo-400 box-shadow-glow"
                            animate={{ right: ["0%", "100%"], opacity: [0, 1, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
