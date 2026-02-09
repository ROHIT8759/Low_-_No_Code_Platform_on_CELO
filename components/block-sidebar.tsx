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
    <div className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border flex flex-col md:h-full animate-fade-in-up">
      <div className="p-3 md:p-4 border-b border-border">
        <h2 className="text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-default">Smart Contract Blocks</h2>
        <p className="text-[10px] md:text-xs text-muted mt-1 hover:text-muted-foreground transition-colors">Drag to canvas or click to add</p>
        <p className="text-[10px] md:text-xs text-primary mt-1 animate-pulse cursor-default hidden md:block">💡 Combine multiple blocks in one contract</p>
      </div>

      {/* Mobile: Horizontal scroll, Desktop: Vertical scroll */}
      <div className="flex md:flex-col gap-2 md:gap-0 overflow-x-auto md:overflow-y-auto md:flex-1 p-2 md:p-3 md:space-y-2">
        {AVAILABLE_BLOCKS.map((block, index) => {
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
              className={`group w-full p-5 rounded-lg border transition-all cursor-grab active:cursor-grabbing hover:scale-[1.01] hover:shadow-md animate-fade-in-up relative overflow-hidden ${isBase
                ? "bg-gradient-to-br from-primary/10 to-transparent border-primary/20 hover:border-primary/50 hover:shadow-primary/10"
                : isSecurity
                  ? "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 hover:border-yellow-500/50 hover:shadow-yellow-500/10"
                  : isNFT
                    ? "bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 hover:border-purple-500/50 hover:shadow-purple-500/10"
                    : isAdvanced
                      ? "bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 hover:border-blue-500/50 hover:shadow-blue-500/10"
                      : "bg-card border-border hover:border-primary/30"
                }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${isBase ? "from-primary/5" : isSecurity ? "from-yellow-500/5" : isNFT ? "from-purple-500/5" : isAdvanced ? "from-blue-500/5" : "from-white/5"
                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="flex items-center gap-2 relative z-10">
                <GripHorizontal
                  size={12}
                  className="text-muted opacity-50 group-hover:opacity-100 transition-all group-hover:scale-110 hidden md:block flex-shrink-0"
                />
                <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-none">{block.label}</p>
                  {badgeText && (
                    <span className={`text-[8px] px-1.5 py-0.5 ${badgeClass} rounded-full font-bold tracking-wide group-hover:scale-105 transition-transform border border-current/10 whitespace-nowrap leading-none`}>
                      {badgeText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="hidden md:block p-4 border-t border-border bg-background/50">
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground flex items-center gap-1">
            <span className="animate-pulse">📚</span> How to build:
          </p>
          <p className="text-xs text-muted hover:text-muted-foreground transition-colors">1️⃣ Add a BASE contract (ERC20/NFT)</p>
          <p className="text-xs text-muted hover:text-muted-foreground transition-colors">2️⃣ Add FEATURE blocks to customize</p>
          <p className="text-xs text-muted hover:text-muted-foreground transition-colors">3️⃣ Generate & deploy your contract!</p>
        </div>
      </div>
    </div>
  )
}
