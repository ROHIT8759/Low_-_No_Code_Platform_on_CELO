"use client"

import type React from "react"

import { type Block, useBuilderStore } from "@/lib/store"
import { GripHorizontal } from "lucide-react"

const AVAILABLE_BLOCKS: Omit<Block, 'position' | 'config'>[] = [
  // Base Contracts (Required - Choose One)
  { id: "1", type: "erc20", label: "ERC20 Token" },
  { id: "2", type: "nft", label: "NFT Contract" },

  // Feature Blocks (Optional - Add Multiple)
  { id: "3", type: "mint", label: "Mint Function" },
  { id: "4", type: "transfer", label: "Transfer Function" },
  { id: "5", type: "burn", label: "Burn Function" },
  { id: "6", type: "stake", label: "Stake Function" },
  { id: "7", type: "withdraw", label: "Withdraw Function" },
]

const BLOCK_DESCRIPTIONS: Record<string, string> = {
  erc20: "Fungible token base contract",
  nft: "Non-fungible token (ERC721) base",
  mint: "Create new tokens",
  transfer: "Move tokens between addresses",
  burn: "Destroy tokens permanently",
  stake: "Lock tokens to earn rewards",
  withdraw: "Extract ETH from contract",
}

const BLOCK_CATEGORIES: Record<string, string> = {
  erc20: "base",
  nft: "base",
  mint: "feature",
  transfer: "feature",
  burn: "feature",
  stake: "feature",
  withdraw: "feature",
}

export function BlockSidebar() {
  const addBlock = useBuilderStore((state) => state.addBlock)

  const handleDragStart = (e: React.DragEvent, block: Block) => {
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("block", JSON.stringify(block))
  }

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Smart Contract Blocks</h2>
        <p className="text-xs text-muted mt-1">Drag to canvas or click to add</p>
        <p className="text-xs text-primary mt-1">💡 Combine multiple blocks in one contract</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {AVAILABLE_BLOCKS.map((block) => {
          const category = BLOCK_CATEGORIES[block.type]
          const isBase = category === "base"

          return (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block)}
              onClick={() => addBlock(block)}
              className={`group p-3 border rounded-lg hover:border-primary hover:bg-background/80 transition-all cursor-grab active:cursor-grabbing ${isBase
                  ? "bg-primary/10 border-primary/30"
                  : "bg-background border-border"
                }`}
            >
              <div className="flex items-start gap-3">
                <GripHorizontal
                  size={16}
                  className="text-muted mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{block.label}</p>
                    {isBase && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full">
                        BASE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {BLOCK_DESCRIPTIONS[block.type] || block.type}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t border-border bg-background/50">
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">How to build:</p>
          <p className="text-xs text-muted">1️⃣ Add a BASE contract (ERC20/NFT)</p>
          <p className="text-xs text-muted">2️⃣ Add FEATURE blocks to customize</p>
          <p className="text-xs text-muted">3️⃣ Generate & deploy your contract!</p>
        </div>
      </div>
    </div>
  )
}
