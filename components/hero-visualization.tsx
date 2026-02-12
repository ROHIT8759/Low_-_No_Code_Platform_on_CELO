"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Hero3DScene from "./hero-3d-scene"
import Link from "next/link"
import { ArrowRight, Sparkles, Code2, FileJson, Box } from "lucide-react"

const abiSnippets = [
    { type: "function", name: "transfer", inputs: "(to: address, amount: uint256)", output: "bool" },
    { type: "event", name: "Transfer", inputs: "indexed from, indexed to, value", output: "void" },
    { type: "function", name: "mint", inputs: "(to: address, amount: uint256)", output: "void" },
    { type: "function", name: "balanceOf", inputs: "(owner: address)", output: "uint256" },
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
        <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
            {/* 3D Background */}
            <Hero3DScene />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/20 to-slate-950/90 z-0 pointer-events-none" />

            {/* Hero Content */}
            <div className="container relative z-10 px-4 md:px-6 pt-20 flex flex-col items-center text-center">

                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-md text-cyan-400 text-xs sm:text-sm font-medium"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                    </span>
                    State-of-the-Art State Management
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
                >
                    Visual Blockchain <br className="hidden sm:block" />
                    <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                        Builder for Everyone
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-10"
                >
                    Deploy production-ready smart contracts to Celo and Stellar without writing a single line of code. Auto-generate Solidity, Rust, and Next.js frontends.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-16"
                >
                    <Link
                        href="/builder"
                        className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 group"
                    >
                        Start Building Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/docs"
                        className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/50 hover:bg-slate-800 text-white font-medium rounded-xl border border-slate-700 hover:border-slate-600 transition-all backdrop-blur-sm flex items-center justify-center gap-2"
                    >
                        View Documentation
                    </Link>
                </motion.div>

                {/* ABI Visualization Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative max-w-lg w-full mx-auto"
                >
                    <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />

                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Code2 size={16} />
                                <span>Smart Contract Logic</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded">
                                <span className="animate-pulse">●</span> Parsing ABI
                            </div>
                        </div>

                        <div className="relative h-24 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSnippet}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-center w-full"
                                >
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${abiSnippets[activeSnippet].type === 'function'
                                            ? 'bg-blue-900/40 border-blue-700 text-blue-300'
                                            : 'bg-purple-900/40 border-purple-700 text-purple-300'
                                            }`}>
                                            {abiSnippets[activeSnippet].type}
                                        </span>
                                        <span className="font-mono font-bold text-lg text-white">
                                            {abiSnippets[activeSnippet].name}
                                        </span>
                                    </div>
                                    <div className="text-xs sm:text-sm font-mono text-slate-400 mb-1">
                                        {abiSnippets[activeSnippet].inputs}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                        <ArrowRight size={12} />
                                        <span className="text-green-400 font-mono">{abiSnippets[activeSnippet].output}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Architectural Data Flow (No Blobs) */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Horizontal Precision Lines */}
                            <div className="absolute top-1/4 left-0 w-full h-[1px] bg-indigo-500/20" />
                            <div className="absolute bottom-1/4 left-0 w-full h-[1px] bg-indigo-500/20" />

                            {/* Vertical Precision Lines */}
                            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-indigo-500/20" />
                            <div className="absolute top-0 right-1/4 w-[1px] h-full bg-indigo-500/20" />

                            {/* Active Data Packets (Engineered Motion) */}
                            <motion.div
                                className="absolute top-1/4 left-0 w-8 h-[2px] bg-indigo-400 box-shadow-glow"
                                animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute top-0 right-1/4 w-[2px] h-8 bg-indigo-400 box-shadow-glow"
                                animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                            />
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
