"use client"

import { useBuilderStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Plus, Box, Layers, Database } from "lucide-react"

export function Canvas() {
    const blocks = useBuilderStore((state) => state.blocks)
    const addBlock = useBuilderStore((state) => state.addBlock)

    const handleQuickAdd = (type: string) => {
        
        
        const block = { id: Date.now().toString(), type, label: type.toUpperCase(), position: { x: 0, y: 0 } }
        addBlock(block as any)
    }

    return (
        <div className="flex-1 relative bg-[#0B0F14] overflow-hidden flex flex-col">

            {}
            <div className="h-9 border-b border-[#222730] flex items-center justify-between px-4 bg-[#0B0F14]">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Context:</span>
                    <span className="text-[10px] text-zinc-300 font-mono">Global_Scope</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600 font-mono">Zoom: 100%</span>
                </div>
            </div>

            <div className="relative z-10 w-full flex-1 flex items-center justify-center p-8">
                {blocks.length === 0 ? (
                    <div className="max-w-2xl w-full">
                        <div className="text-center mb-10">
                            <h3 className="text-xl font-medium text-zinc-200 mb-2">No contract base selected.</h3>
                            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                                Start by choosing a standard compliant implementation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {}
                            <button
                                onClick={() => handleQuickAdd('erc20')}
                                className="group p-5 bg-[#11151A] border border-[#222730] rounded-md hover:border-primary/50 hover:bg-[#161B22] transition-all text-left"
                            >
                                <div className="w-8 h-8 rounded bg-[#1A1F26] flex items-center justify-center border border-[#2A303C] mb-4 group-hover:border-primary/20">
                                    <Database className="w-4 h-4 text-zinc-400 group-hover:text-primary" />
                                </div>
                                <h4 className="text-sm font-medium text-zinc-300 group-hover:text-white mb-1">Soroban Token</h4>
                                <p className="text-xs text-zinc-600 leading-relaxed">Standard interface for fungible assets.</p>
                            </button>

                            {}
                            <button
                                onClick={() => handleQuickAdd('nft')}
                                className="group p-5 bg-[#11151A] border border-[#222730] rounded-md hover:border-purple-500/50 hover:bg-[#161B22] transition-all text-left"
                            >
                                <div className="w-8 h-8 rounded bg-[#1A1F26] flex items-center justify-center border border-[#2A303C] mb-4 group-hover:border-purple-500/20">
                                    <Layers className="w-4 h-4 text-zinc-400 group-hover:text-purple-400" />
                                </div>
                                <h4 className="text-sm font-medium text-zinc-300 group-hover:text-white mb-1">Non-Fungible Token</h4>
                                <p className="text-xs text-zinc-600 leading-relaxed">Unique asset implementation.</p>
                            </button>

                            {}
                            <button
                                className="group p-5 bg-[#11151A] border border-[#222730] border-dashed rounded-md hover:border-zinc-500 hover:bg-[#161B22] transition-all text-left"
                            >
                                <div className="w-8 h-8 rounded bg-[#1A1F26] flex items-center justify-center border border-[#2A303C] mb-4">
                                    <Box className="w-4 h-4 text-zinc-500" />
                                </div>
                                <h4 className="text-sm font-medium text-zinc-300 group-hover:text-white mb-1">Custom Module</h4>
                                <p className="text-xs text-zinc-600 leading-relaxed">Empty WASM module state.</p>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
                        {}
                        <div className="flex flex-col items-center gap-4 py-10">
                            {}
                            <div className="w-32 h-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                                Entry Point
                            </div>
                            <div className="h-8 w-px bg-zinc-800" />

                            {}
                            {blocks.map((block, index) => (
                                <motion.div
                                    key={block.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-64 p-4 bg-[#11151A] border border-[#222730] rounded-md shadow-lg relative group"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-l-md" />
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-zinc-200">{block.label}</span>
                                        <span className="text-[9px] font-mono text-zinc-600">{block.type.toUpperCase()}</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-mono truncate">
                                        fn_{block.type}_init(ctx)
                                    </div>
                                    {index < blocks.length - 1 && (
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 w-px bg-zinc-800" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
