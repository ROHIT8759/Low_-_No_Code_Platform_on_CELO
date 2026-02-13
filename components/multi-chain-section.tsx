"use client"

import { motion } from "framer-motion"
import { ArrowRight, Zap, Shield, Code, Globe } from "lucide-react"

const stellarFeatures = [
    {
        icon: Zap,
        title: "WASM Runtime",
        description: "High-performance WebAssembly contracts with predictable execution"
    },
    {
        icon: Shield,
        title: "Predictable Fees",
        description: "Fixed transaction costs — no gas price volatility or surprises"
    },
    {
        icon: Code,
        title: "Rust Based",
        description: "Type-safe systems programming with modern tooling and safety guarantees"
    },
    {
        icon: Globe,
        title: "Global Rails",
        description: "Connect to the worldwide Stellar payment network"
    }
]

export function MultiChainSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">
                            Built for Stellar
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl">
                            Native Soroban smart contract support. Write Rust, compile to WASM, deploy to the Stellar network.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {stellarFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group"
                        >
                            <div className="h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-xl p-6 hover:border-fuchsia-500/30 transition-colors duration-300">
                                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center text-white mb-4 shadow-lg">
                                    <feature.icon size={24} />
                                </div>

                                <h3 className="text-lg font-semibold mb-2 text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <a
                        href="/builder"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
                    >
                        Start Building
                        <ArrowRight size={16} />
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
