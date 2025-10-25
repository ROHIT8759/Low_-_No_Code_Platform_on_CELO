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

  // Security & Access Control
  { id: "8", type: "pausable", label: "Pausable" },
  { id: "9", type: "whitelist", label: "Whitelist" },
  { id: "10", type: "blacklist", label: "Blacklist" },
  { id: "11", type: "multisig", label: "Multi-Signature" },
  { id: "12", type: "timelock", label: "Time Lock" },

  // NFT Specific
  { id: "13", type: "royalty", label: "NFT Royalties" },

  // Advanced Features
  { id: "14", type: "airdrop", label: "Airdrop" },
  { id: "15", type: "voting", label: "Voting System" },
  { id: "16", type: "snapshot", label: "Snapshot" },
  { id: "17", type: "permit", label: "Gasless Approval" },
]

const BLOCK_DESCRIPTIONS: Record<string, string> = {
  // Base Contracts
  erc20: "Fungible token base contract",
  nft: "Non-fungible token (ERC721) base",

  // Basic Features
  mint: "Create new tokens",
  transfer: "Move tokens between addresses",
  burn: "Destroy tokens permanently",
  stake: "Lock tokens to earn rewards",
  withdraw: "Extract ETH from contract",

  // Security & Access Control
  pausable: "Emergency pause/unpause transfers",
  whitelist: "Restrict access to approved addresses",
  blacklist: "Block specific addresses",
  multisig: "Require multiple approvals",
  timelock: "Delayed execution for security",

  // NFT Specific
  royalty: "Earn royalties on secondary sales",

  // Advanced Features
  airdrop: "Distribute tokens to multiple addresses",
  voting: "Token-based governance voting",
  snapshot: "Record balances at specific time",
  permit: "EIP-2612 gasless approvals",
}

const BLOCK_CATEGORIES: Record<string, string> = {
  // Base
  erc20: "base",
  nft: "base",

  // Features
  mint: "feature",
  transfer: "feature",
  burn: "feature",
  stake: "feature",
  withdraw: "feature",

  // Security
  pausable: "security",
  whitelist: "security",
  blacklist: "security",
  multisig: "security",
  timelock: "security",

  // NFT
  royalty: "nft",

  // Advanced
  airdrop: "advanced",
  voting: "advanced",
  snapshot: "advanced",
  permit: "advanced",
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
          const isSecurity = category === "security"
          const isNFT = category === "nft"
          const isAdvanced = category === "advanced"

          // Define badge styling based on category
          let badgeClass = ""
          let badgeText = ""

          if (isBase) {
            badgeClass = "bg-primary/20 text-primary"
            badgeText = "BASE"
          } else if (isSecurity) {
            badgeClass = "bg-yellow-500/20 text-yellow-600"
            badgeText = "SECURITY"
          } else if (isNFT) {
            badgeClass = "bg-purple-500/20 text-purple-600"
            badgeText = "NFT"
          } else if (isAdvanced) {
            badgeClass = "bg-blue-500/20 text-blue-600"
            badgeText = "ADVANCED"
          }

          return (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block)}
              onClick={() => addBlock(block)}
              className={`group p-3 border rounded-lg hover:border-primary hover:bg-background/80 transition-all cursor-grab active:cursor-grabbing ${isBase
                  ? "bg-primary/10 border-primary/30"
                  : isSecurity
                    ? "bg-yellow-500/5 border-yellow-500/20"
                    : isNFT
                      ? "bg-purple-500/5 border-purple-500/20"
                      : isAdvanced
                        ? "bg-blue-500/5 border-blue-500/20"
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
                    {badgeText && (
                      <span className={`text-[10px] px-1.5 py-0.5 ${badgeClass} rounded-full font-medium`}>
                        {badgeText}
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
