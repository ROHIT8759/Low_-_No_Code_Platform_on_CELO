"use client"

import type React from "react"
import { useState } from "react"
import { type Block, useBuilderStore } from "@/lib/store"
import {
  GripHorizontal, ChevronDown, ChevronRight, Box, Shield, Zap, Layers,
  ArrowRight, Database, Coins, Vote, Clock, LayoutTemplate
} from "lucide-react"

// Category color mapping (matches canvas)
const CATEGORY_STYLES: Record<string, { accent: string; text: string; icon: React.ReactNode }> = {
  "Base Standards": { accent: "bg-blue-500", text: "text-blue-400", icon: <Database className="w-3 h-3" /> },
  "Token Logic": { accent: "bg-teal-500", text: "text-teal-400", icon: <Coins className="w-3 h-3" /> },
  "Security Modules": { accent: "bg-orange-500", text: "text-orange-400", icon: <Shield className="w-3 h-3" /> },
  "Governance & Advanced": { accent: "bg-amber-400", text: "text-amber-400", icon: <Vote className="w-3 h-3" /> },
}

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

// Preset templates
const TEMPLATES = [
  {
    id: "starter-token",
    name: "Starter Token",
    desc: "ERC20 + Mint + Burn",
    blocks: [
      { type: "erc20", label: "ERC20 Standard" },
      { type: "mint", label: "Mintable" },
      { type: "burn", label: "Burnable" },
    ],
  },
  {
    id: "governance-token",
    name: "Governance Token",
    desc: "ERC20 + Voting + Snapshot",
    blocks: [
      { type: "erc20", label: "ERC20 Standard" },
      { type: "mint", label: "Mintable" },
      { type: "pausable", label: "Pausable" },
      { type: "voting", label: "Voting" },
      { type: "snapshot", label: "Snapshot" },
    ],
  },
  {
    id: "nft-drop",
    name: "NFT Drop",
    desc: "ERC721 + Whitelist + Royalties",
    blocks: [
      { type: "nft", label: "ERC721 Standard" },
      { type: "mint", label: "Mintable" },
      { type: "whitelist", label: "Whitelist" },
      { type: "royalty", label: "Royalties" },
      { type: "pausable", label: "Pausable" },
    ],
  },
  {
    id: "secure-token",
    name: "Secure Token",
    desc: "ERC20 + Full Security Suite",
    blocks: [
      { type: "erc20", label: "ERC20 Standard" },
      { type: "mint", label: "Mintable" },
      { type: "burn", label: "Burnable" },
      { type: "pausable", label: "Pausable" },
      { type: "whitelist", label: "Whitelist" },
      { type: "blacklist", label: "Blacklist" },
      { type: "timelock", label: "Time Lock" },
    ],
  },
]

export function BlockSidebar() {
  const addBlock = useBuilderStore((state) => state.addBlock)
  const blocks = useBuilderStore((state) => state.blocks)
  const clearAll = useBuilderStore((state) => state.clearAll)
  const createProject = useBuilderStore((state) => state.createProject)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Base Standards": true,
    "Token Logic": true,
    "Security Modules": true,
    "Governance & Advanced": false,
  })
  const [showTemplates, setShowTemplates] = useState(false)

  const hasBaseStandard = blocks.some(block =>
    block.type === "erc20" || block.type === "nft"
  )

  const isBlockTypeAdded = (type: string) => {
    return blocks.some(block => block.type === type)
  }

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const handleDragStart = (e: React.DragEvent, block: any) => {
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("block", JSON.stringify(block))
  }

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    createProject(template.name)
    template.blocks.forEach((block, i) => {
      setTimeout(() => {
        addBlock({
          id: `${Date.now()}-${i}`,
          type: block.type as Block["type"],
          label: block.label,
        })
      }, i * 50)
    })
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] bg-[var(--surface-0)]">
        <div className="flex items-center gap-2 mb-1">
          <Box className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">Contract Modules</h2>
        </div>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
          Soroban Architecture
        </p>
      </div>

      {/* Templates toggle */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between p-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-white/[0.06] rounded transition-all"
        >
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
            <span>Preset Templates</span>
          </div>
          {showTemplates ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {showTemplates && (
          <div className="mt-2 space-y-1.5">
            {TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="w-full p-2.5 bg-[var(--surface-1)] border border-white/[0.06] rounded hover:border-primary/30 hover:bg-[var(--surface-2)] transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white">{template.name}</span>
                  <span className="text-[9px] font-mono text-zinc-600">{template.blocks.length} blocks</span>
                </div>
                <p className="text-[9px] text-zinc-600">{template.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Guided base selection notice */}
      {!hasBaseStandard && !showTemplates && (
        <div className="mx-3 mt-3 p-3 rounded bg-[var(--surface-2)] border border-primary/20">
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
        {Object.entries(BLOCKS_BY_CATEGORY).map(([category, categoryBlocks]) => {
          const isBaseCategory = category === "Base Standards"
          const shouldHighlight = isBaseCategory && !hasBaseStandard
          const style = CATEGORY_STYLES[category]

          return (
            <div key={category} className="mb-2">
              <button
                onClick={() => toggleCategory(category)}
                className={`
                  w-full flex items-center justify-between p-2 text-xs font-medium transition-all rounded mb-1 group
                  ${shouldHighlight
                    ? 'text-zinc-200 bg-primary/10 hover:bg-primary/15 border border-primary/30'
                    : 'text-zinc-400 hover:text-zinc-200 bg-[var(--surface-0)]/50 hover:bg-[var(--surface-2)]'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {openCategories[category] ? (
                    <ChevronDown className={`w-3 h-3 ${shouldHighlight ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  ) : (
                    <ChevronRight className={`w-3 h-3 ${shouldHighlight ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  )}
                  <span className={style?.text}>{style?.icon}</span>
                  <span className="font-medium">{category}</span>
                  {shouldHighlight && (
                    <span className="text-[9px] text-primary font-mono uppercase tracking-wider">Required</span>
                  )}
                </div>
                <span className="text-[9px] text-zinc-700 font-mono">{categoryBlocks.length}</span>
              </button>

              {openCategories[category] && (
                <div className="space-y-1 pl-2 border-l border-white/[0.04] ml-3 mt-1">
                  {categoryBlocks.map((block) => {
                    const isAdded = isBlockTypeAdded(block.type)

                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block)}
                        onClick={() => addBlock(block as any)}
                        className={`
                          group relative w-full p-3 rounded border transition-all cursor-grab active:cursor-grabbing
                          ${isAdded
                            ? 'bg-[var(--surface-2)] border-white/[0.08]'
                            : 'bg-[var(--surface-1)] border-white/[0.06] hover:bg-[var(--surface-2)] hover:border-white/[0.08]'
                          }
                        `}
                      >
                        {/* Category accent strip */}
                        <div className={`
                          absolute left-0 top-0 bottom-0 w-[2px] ${style?.accent} transition-opacity rounded-l
                          ${isAdded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        `} />

                        {isAdded && (
                          <div className={`absolute right-2 top-2 w-1.5 h-1.5 rounded-full ${style?.accent}`} />
                        )}

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`
                              w-5 h-5 rounded flex items-center justify-center border
                              ${isAdded
                                ? `bg-${style?.accent?.replace('bg-', '')}/10 border-${style?.accent?.replace('bg-', '')}/30`
                                : 'bg-[var(--surface-2)] border-white/[0.04]'
                              }
                            `}>
                              <span className={`${isAdded ? style?.text : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors`}>
                                {style?.icon}
                              </span>
                            </div>
                            <div>
                              <p className={`
                                text-xs font-medium transition-colors
                                ${isAdded ? style?.text : 'text-zinc-300 group-hover:text-white'}
                              `}>
                                {block.label}
                              </p>
                              <p className="text-[10px] text-zinc-600">{block.desc}</p>
                            </div>
                          </div>
                          <GripHorizontal className="w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100" />
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-white/[0.04] pt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-zinc-600 font-mono uppercase">Gas:</span>
                            <span className={`text-[9px] font-mono ${block.gas === 'High' ? 'text-orange-500' : 'text-zinc-500'}`}>
                              {block.gas}
                            </span>
                          </div>
                          {isAdded && (
                            <span className="text-[8px] font-mono text-zinc-600 uppercase">Added</span>
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
