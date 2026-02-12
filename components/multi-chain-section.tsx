"use client"

import { motion } from "framer-motion"
import { ArrowRight, Globe, Zap, Shield, Code, Rocket, Boxes } from "lucide-react"

const chains = [
    {
        name: "EVM Networks",
        description: "Deploy Solidity contracts with low gas fees and fast finality across EVM-compatible chains.",
        icon: Globe,
        color: "from-cyan-500 to-blue-500",
        features: ["EVM Compatible", "Low Gas Fees", "Multi-Chain", "Wide Adoption"],
        logo: "E"
    },
    {
        name: "Stellar (Soroban)",
        description: "High-performance smart contracts. Write Rust contracts with predictable fees and massive scalability.",
        icon: Zap,
        color: "from-fuchsia-500 to-purple-500",
        features: ["WASM Runtime", "Predictable Fees", "Rust Based", "Global Rails"],
        logo: "S"
    }
]

export function MultiChainSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">
                            Build Once, Deploy Everywhere
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl">
                            Support for leading blockchain platforms. Whether you prefer Solidity (EVM) or Rust (WASM), we've got you covered.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
                    {chains.map((chain, index) => (
                        <motion.div
                            key={chain.name}
                            initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl blur-xl"
                                style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                            />

                            <div className={`h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors duration-300 relative overflow-hidden group-hover:shadow-2xl shadow-${chain.color.split('-')[1]}-500/10`}>
                                <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${chain.color} opacity-50`} />

                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${chain.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                                        <chain.icon size={28} />
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
                                        {index === 0 ? 'Solidity' : 'Rust'}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                                    {chain.name}
                                </h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    {chain.description}
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    {chain.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                            <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${chain.color}`} />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center text-sm font-medium text-slate-400 group-hover:text-white transition-colors cursor-pointer">
                                    Start Building <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
