"use client"

import type React from "react"
import { useState } from "react"
import { type Block, useBuilderStore } from "@/lib/store"
import { GripHorizontal, ChevronDown, ChevronRight, Box, Shield, Zap, Layers, AlertTriangle, ArrowRight } from "lucide-react"

const BLOCKS_BY_CATEGORY = {
  "Base Standards": [
    { id: "1", type: "erc20", label: "ERC20 Standard", gas: "Low", desc: "Fungible Token" },
    { id: "2", type: "nft", label: "ERC721 Standard", gas: "Med", desc: "Non-Fungible Token" },
  ],
  "Token Logic": [
    { id: "3", type: "mint", label: "Mintable", gas: "Low", desc: "Privileged Minting" },
    { id: "4", type: "burn", label: "Burnable", gas: "Low", desc: "Token Destruction" },
    { id: "5", type: "transfer", label: "Transferable", gas: "Low", desc: "Standard Transfer" },
  ],
  "Security Modules": [
    { id: "8", type: "pausable", label: "Pausable", gas: "Low", desc: "Emergency Stop" },
    { id: "9", type: "whitelist", label: "Whitelist", gas: "Med", desc: "Access Control" },
    { id: "10", type: "blacklist", label: "Blacklist", gas: "Med", desc: "Malicious Blocking" },
    { id: "12", type: "timelock", label: "Time Lock", gas: "High", desc: "Delayed Exec" },
  ],
  "Governance & Advanced": [
    { id: "15", type: "voting", label: "Voting", gas: "High", desc: "On-chain Governance" },
    { id: "16", type: "snapshot", label: "Snapshot", gas: "Med", desc: "Historical State" },
    { id: "17", type: "permit", label: "Permit", gas: "Low", desc: "Gasless Approvals" },
    { id: "13", type: "royalty", label: "Royalties", gas: "Low", desc: "EIP-2981" },
  ]
}

export function BlockSidebar() {
  const addBlock = useBuilderStore((state) => state.addBlock)
  const blocks = useBuilderStore((state) => state.blocks)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Base Standards": true,
    "Token Logic": true,
    "Security Modules": true,
    "Governance & Advanced": false,
  })

  // Check if a base standard has been selected
  const hasBaseStandard = blocks.some(block => 
    block.type === "erc20" || block.type === "nft"
  )

  // Check if a block is currently selected
  const isBlockSelected = (blockId: string) => {
    return blocks.some(block => block.id === blockId)
  }

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const handleDragStart = (e: React.DragEvent, block: any) => {
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("block", JSON.stringify(block))
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with proper typography */}
      <div className="p-4 border-b border-white/[0.06] bg-[#0B0F14]">
        <div className="flex items-center gap-2 mb-1">
          <Box className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">Contract Modules</h2>
        </div>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
          Soroban Architecture
        </p>
      </div>

      {/* Guided base selection notice */}
      {!hasBaseStandard && (
        <div className="mx-3 mt-3 p-3 rounded-sm bg-[#1A1F26] border border-primary/20">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-200 mb-1">Start with a Base</p>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Select a base standard below to begin building your contract
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
        {Object.entries(BLOCKS_BY_CATEGORY).map(([category, blocks]) => {
          const isBaseCategory = category === "Base Standards"
          const shouldHighlight = isBaseCategory && !hasBaseStandard

          return (
            <div key={category} className="mb-2">
              {/* Section header with proper typography */}
              <button
                onClick={() => toggleCategory(category)}
                className={`
                  w-full flex items-center justify-between p-2 text-xs font-medium transition-all rounded-sm mb-1 group
                  ${shouldHighlight 
                    ? 'text-zinc-200 bg-primary/10 hover:bg-primary/15 border border-primary/30' 
                    : 'text-zinc-400 hover:text-zinc-200 bg-[#0B0F14]/50 hover:bg-[#1A1F26]'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {openCategories[category] ? (
                    <ChevronDown className={`w-3 h-3 ${shouldHighlight ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  ) : (
                    <ChevronRight className={`w-3 h-3 ${shouldHighlight ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  )}
                  <span className="font-medium">{category}</span>
                  {shouldHighlight && (
                    <span className="text-[9px] text-primary font-mono uppercase tracking-wider">Required</span>
                  )}
                </div>
                <span className="text-[9px] text-zinc-700 font-mono">{blocks.length}</span>
              </button>

              {openCategories[category] && (
                <div className="space-y-1 pl-2 border-l border-white/[0.04] ml-3 mt-1">
                  {blocks.map((block) => {
                    const isSelected = isBlockSelected(block.id)
                    
                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block)}
                        onClick={() => addBlock(block as any)}
                        className={`
                          group relative w-full p-3 rounded-sm border transition-all cursor-grab active:cursor-grabbing
                          ${isSelected 
                            ? 'bg-[#1A1F26] border-primary/40' 
                            : 'bg-[#11151A] border-white/[0.06] hover:bg-[#161B22] hover:border-white/[0.08]'
                          }
                        `}
                      >
                        {/* Accent strip - visible on hover or when selected */}
                        <div className={`
                          absolute left-0 top-0 bottom-0 w-[2px] bg-primary transition-opacity
                          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        `} />

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`
                              w-5 h-5 rounded-[2px] flex items-center justify-center border
                              ${isSelected 
                                ? 'bg-primary/10 border-primary/30' 
                                : 'bg-[#1A1F26] border-white/[0.04]'
                              }
                            `}>
                              <Layers className={`
                                w-3 h-3 transition-colors
                                ${isSelected 
                                  ? 'text-primary' 
                                  : 'text-zinc-500 group-hover:text-zinc-300'
                                }
                              `} />
                            </div>
                            <div>
                              <p className={`
                                text-xs font-medium transition-colors
                                ${isSelected 
                                  ? 'text-primary' 
                                  : 'text-zinc-300 group-hover:text-primary'
                                }
                              `}>
                                {block.label}
                              </p>
                              <p className="text-[10px] text-zinc-600">{block.desc}</p>
                            </div>
                          </div>
                          <GripHorizontal className="w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100" />
                        </div>

                        {/* Metadata line */}
                        <div className="mt-2 flex items-center justify-between border-t border-white/[0.04] pt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-zinc-600 font-mono uppercase">Gas:</span>
                            <span className={`text-[9px] font-mono ${block.gas === 'High' ? 'text-orange-500' : 'text-zinc-500'}`}>
                              {block.gas}
                            </span>
                          </div>
                          {category === "Security Modules" && (
                            <Shield className="w-2.5 h-2.5 text-emerald-500/50" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
