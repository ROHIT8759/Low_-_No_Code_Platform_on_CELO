"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Copy, Code2, Terminal, Zap, Box, Layers, Play, Shield } from "lucide-react"

const FEATURES = [
    { id: "erc20", label: "ERC-20 Token", description: "Standard fungible token" },
    { id: "mintable", label: "Mintable", description: "Owner can mint new tokens" },
    { id: "burnable", label: "Burnable", description: "Holders can burn tokens" },
    { id: "pausable", label: "Pausable", description: "Emergency stop mechanism" },
]

export default function LiveGeneratorDemo() {
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["erc20"])
    const [activeTab, setActiveTab] = useStateLike<"solidity" | "rust">("solidity") 

    const toggleFeature = (id: string) => {
        if (id === "erc20") return 
        setSelectedFeatures(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        )
    }

    
    const generateCode = () => {
        const isMintable = selectedFeatures.includes("mintable")
        const isBurnable = selectedFeatures.includes("burnable")
        const isPausable = selectedFeatures.includes("pausable")

        const solidity = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
${isMintable ? 'import "@openzeppelin/contracts/access/Ownable.sol";' : ''}
${isPausable ? 'import "@openzeppelin/contracts/security/Pausable.sol";' : ''}

contract MyToken is ERC20${isMintable ? ', Ownable' : ''}${isBurnable ? ', ERC20Burnable' : ''}${isPausable ? ', Pausable' : ''} {
    constructor() ERC20("MyToken", "MTK") ${isMintable ? 'Ownable(msg.sender)' : ''} {}

    ${isMintable ? `function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }` : ''}

    ${isPausable ? `function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }` : ''}
}`

        const rust = `#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String};

#[contract]
pub struct MyToken;

#[contractimpl]
impl MyToken {
    pub fn initialize(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        // ... initialization logic
    }

    ${isMintable ? `pub fn mint(e: Env, to: Address, amount: i128) {
        
    }` : ''}

    ${isBurnable ? `pub fn burn(e: Env, from: Address, amount: i128) {
        
    }` : ''}
}`

        return activeTab === "solidity" ? solidity : rust
    }

    return (
        <section className="py-24 px-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-b from-slate-950 to-slate-900 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6"
                    >
                        <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                        <span className="text-sm text-cyan-400 font-medium">Live Demo</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        See the Magic in Action
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Toggle features and watch production-ready code generate instantly.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Layers className="text-cyan-400" />
                            Configure Contract
                        </h3>

                        <div className="space-y-4">
                            {FEATURES.map((feature) => (
                                <button
                                    key={feature.id}
                                    onClick={() => toggleFeature(feature.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${selectedFeatures.includes(feature.id)
                                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                                        : "bg-slate-800/30 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className={`font-semibold ${selectedFeatures.includes(feature.id) ? "text-cyan-400" : "text-slate-200"}`}>
                                            {feature.label}
                                        </div>
                                        <div className="text-sm text-slate-400">{feature.description}</div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selectedFeatures.includes(feature.id)
                                        ? "bg-cyan-500 border-cyan-500 text-white"
                                        : "border-slate-600"
                                        }`}>
                                        {selectedFeatures.includes(feature.id) && <Check size={14} />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                                <span className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400" /> Instant Generation
                                </span>
                                <span className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-400" /> Audited Templates
                                </span>
                            </div>
                            <button className="w-full py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2">
                                <Terminal size={18} />
                                Deploy to Testnet
                            </button>
                        </div>
                    </motion.div>

                    {}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative group"
                    >
                        <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <div className="relative bg-[#0d1117] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                            {}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <div className="h-4 w-px bg-slate-700 mx-2" />
                                    <div className="flex bg-slate-800 rounded-lg p-0.5">
                                        <button
                                            onClick={() => setActiveTab("solidity")}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "solidity" ? "bg-slate-700 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-300"
                                                }`}
                                        >
                                            Solidity
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("rust")}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === "rust" ? "bg-slate-700 text-orange-400 shadow-sm" : "text-slate-400 hover:text-slate-300"
                                                }`}
                                        >
                                            Rust (Stellar)
                                        </button>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-white transition-colors" title="Copy Code">
                                    <Copy size={16} />
                                </button>
                            </div>

                            {}
                            <div className="p-6 overflow-x-auto">
                                <pre className="font-mono text-sm leading-relaxed">
                                    <code className="block text-slate-300">
                                        {generateCode()}
                                    </code>
                                </pre>
                            </div>

                            {}
                            <div className="bg-slate-900/50 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-500 font-mono">
                                <span>{selectedFeatures.length} features selected</span>
                                <span className="flex items-center gap-1.5 text-green-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Compiled successfully
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function useStateLike<T>(initial: T): [T, (val: T) => void] {
    return useState<T>(initial)
}
