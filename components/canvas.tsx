"use client"

import { useBuilderStore } from "@/lib/store"
import { motion } from "framer-motion"

export function Canvas() {
    const blocks = useBuilderStore((state) => state.blocks)

    return (
        <div className="flex-1 relative bg-zinc-950 overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative z-10 w-full h-full p-8 flex items-center justify-center">
                {blocks.length === 0 ? (
                    <div className="text-center text-zinc-500">
                        <h3 className="text-lg font-medium text-zinc-400 mb-2">Canvas Empty</h3>
                        <p className="text-sm">Drag and drop blocks from the sidebar to build your dApp.</p>
                    </div>
                ) : (
                    <div className="text-zinc-400">
                        {/* Placeholder for actual block rendering */}
                        Blocks: {blocks.length}
                    </div>
                )}
            </div>
        </div>
    )
}
