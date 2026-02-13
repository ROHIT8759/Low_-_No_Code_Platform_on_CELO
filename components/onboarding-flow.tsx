"use client"

import { useState, useEffect } from "react"
import { useBuilderStore, type Block } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database, Layers, Coins, Shield, Vote, Zap, ArrowRight, ArrowLeft,
  CheckCircle, ChevronRight, Sparkles, X, FileCode, Settings, Eye
} from "lucide-react"

type OnboardingStep = "welcome" | "base" | "features" | "configure" | "preview"

interface BaseOption {
  type: "erc20" | "nft"
  label: string
  description: string
  icon: React.ReactNode
  features: string[]
}

interface FeatureRecommendation {
  type: Block["type"]
  label: string
  description: string
  recommended: boolean
  category: string
  categoryColor: string
}

const BASE_OPTIONS: BaseOption[] = [
  {
    type: "erc20",
    label: "Fungible Token (ERC20)",
    description: "Standard interface for fungible assets. Ideal for utility tokens, stablecoins, and governance tokens.",
    icon: <Database className="w-6 h-6" />,
    features: ["Transfer", "Approve", "Balance tracking", "Total supply"],
  },
  {
    type: "nft",
    label: "Non-Fungible Token (ERC721)",
    description: "Unique asset implementation. Perfect for digital art, collectibles, memberships, and real-world asset tokenization.",
    icon: <Layers className="w-6 h-6" />,
    features: ["Unique ownership", "Metadata URI", "Transfer", "Approval"],
  },
]

const FEATURE_RECOMMENDATIONS: Record<string, FeatureRecommendation[]> = {
  erc20: [
    { type: "mint", label: "Mintable", description: "Allow privileged minting of new tokens", recommended: true, category: "Token Logic", categoryColor: "text-teal-400" },
    { type: "burn", label: "Burnable", description: "Enable token destruction to reduce supply", recommended: true, category: "Token Logic", categoryColor: "text-teal-400" },
    { type: "pausable", label: "Pausable", description: "Emergency stop mechanism for all transfers", recommended: true, category: "Security", categoryColor: "text-orange-400" },
    { type: "whitelist", label: "Whitelist", description: "Restrict transfers to approved addresses", recommended: false, category: "Security", categoryColor: "text-orange-400" },
    { type: "blacklist", label: "Blacklist", description: "Block malicious addresses from transfers", recommended: false, category: "Security", categoryColor: "text-orange-400" },
    { type: "snapshot", label: "Snapshot", description: "Record historical balances at specific points", recommended: false, category: "Governance", categoryColor: "text-amber-400" },
    { type: "voting", label: "Voting", description: "On-chain governance with token-weighted votes", recommended: false, category: "Governance", categoryColor: "text-amber-400" },
    { type: "permit", label: "Permit", description: "Gasless approvals via EIP-2612 signatures", recommended: false, category: "Advanced", categoryColor: "text-blue-400" },
    { type: "timelock", label: "Time Lock", description: "Delayed execution for critical operations", recommended: false, category: "Security", categoryColor: "text-orange-400" },
  ],
  nft: [
    { type: "mint", label: "Mintable", description: "Allow minting of new NFTs", recommended: true, category: "Token Logic", categoryColor: "text-teal-400" },
    { type: "burn", label: "Burnable", description: "Enable NFT destruction", recommended: false, category: "Token Logic", categoryColor: "text-teal-400" },
    { type: "royalty", label: "Royalties", description: "EIP-2981 royalty standard for secondary sales", recommended: true, category: "Token Logic", categoryColor: "text-teal-400" },
    { type: "pausable", label: "Pausable", description: "Emergency stop mechanism", recommended: true, category: "Security", categoryColor: "text-orange-400" },
    { type: "whitelist", label: "Whitelist", description: "Restrict minting to approved addresses", recommended: true, category: "Security", categoryColor: "text-orange-400" },
    { type: "blacklist", label: "Blacklist", description: "Block addresses from transfers", recommended: false, category: "Security", categoryColor: "text-orange-400" },
    { type: "timelock", label: "Time Lock", description: "Delayed execution for admin functions", recommended: false, category: "Security", categoryColor: "text-orange-400" },
  ],
}

const TEMPLATES = [
  {
    id: "starter-token",
    name: "Starter Token",
    description: "Basic ERC20 with mint and burn",
    base: "erc20" as const,
    features: ["mint", "burn"] as Block["type"][],
    config: { name: "StarterToken", symbol: "STK", initialSupply: "1000000" },
  },
  {
    id: "governance-token",
    name: "Governance Token",
    description: "ERC20 with voting and snapshot",
    base: "erc20" as const,
    features: ["mint", "burn", "pausable", "voting", "snapshot"] as Block["type"][],
    config: { name: "GovernanceToken", symbol: "GOV", initialSupply: "10000000" },
  },
  {
    id: "nft-drop",
    name: "NFT Drop",
    description: "NFT with whitelist and royalties",
    base: "nft" as const,
    features: ["mint", "royalty", "whitelist", "pausable"] as Block["type"][],
    config: { name: "NFTCollection", symbol: "NFTC" },
  },
  {
    id: "secure-token",
    name: "Secure Token",
    description: "ERC20 with full security suite",
    base: "erc20" as const,
    features: ["mint", "burn", "pausable", "whitelist", "blacklist", "timelock"] as Block["type"][],
    config: { name: "SecureToken", symbol: "SEC", initialSupply: "5000000" },
  },
]

interface OnboardingFlowProps {
  onComplete: () => void
  onDismiss: () => void
}

export function OnboardingFlow({ onComplete, onDismiss }: OnboardingFlowProps) {
  const addBlock = useBuilderStore((state) => state.addBlock)
  const blocks = useBuilderStore((state) => state.blocks)
  const clearAll = useBuilderStore((state) => state.clearAll)
  const createProject = useBuilderStore((state) => state.createProject)

  const [step, setStep] = useState<OnboardingStep>("welcome")
  const [selectedBase, setSelectedBase] = useState<"erc20" | "nft" | null>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<Set<Block["type"]>>(new Set())
  const [contractName, setContractName] = useState("MyToken")
  const [tokenSymbol, setTokenSymbol] = useState("MTK")
  const [initialSupply, setInitialSupply] = useState("1000000")

  const toggleFeature = (type: Block["type"]) => {
    setSelectedFeatures(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedBase(template.base)
    setSelectedFeatures(new Set(template.features))
    setContractName(template.config.name)
    setTokenSymbol(template.config.symbol)
    if (template.config.initialSupply) setInitialSupply(template.config.initialSupply)
    setStep("configure")
  }

  const handleFinish = () => {
    if (!selectedBase) return

    createProject(contractName)

    // Add base block
    const baseLabel = selectedBase === "erc20" ? "ERC20 Standard" : "ERC721 Standard"
    addBlock({
      id: Date.now().toString(),
      type: selectedBase,
      label: baseLabel,
      config: { name: contractName, symbol: tokenSymbol, initialSupply },
    })

    // Add feature blocks
    const featureLabels: Record<string, string> = {
      mint: "Mintable", burn: "Burnable", transfer: "Transferable",
      pausable: "Pausable", whitelist: "Whitelist", blacklist: "Blacklist",
      royalty: "Royalties", timelock: "Time Lock", voting: "Voting",
      snapshot: "Snapshot", permit: "Permit",
    }

    selectedFeatures.forEach(type => {
      addBlock({
        id: (Date.now() + Math.random() * 1000).toString(),
        type,
        label: featureLabels[type] || type,
      })
    })

    onComplete()
  }

  const stepIndex = ["welcome", "base", "features", "configure", "preview"].indexOf(step)
  const totalSteps = 5

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--surface-0)] border border-white/[0.08] rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[var(--surface-1)]">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-zinc-200">Guided Build Mode</h2>
            <span className="text-[10px] font-mono text-zinc-500 bg-[var(--surface-2)] px-2 py-0.5 rounded">
              Step {stepIndex + 1}/{totalSteps}
            </span>
          </div>
          <button onClick={onDismiss} className="p-1.5 hover:bg-[var(--surface-2)] rounded text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[var(--surface-2)]">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {step === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold text-zinc-200 mb-2">Build Your Smart Contract</h3>
                  <p className="text-sm text-zinc-500 max-w-md mx-auto">
                    Choose how you want to start. We'll guide you through the process step by step.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setStep("base")}
                    className="group p-5 bg-[var(--surface-1)] border border-white/[0.08] rounded-md hover:border-primary/40 hover:bg-[var(--surface-2)] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium text-zinc-200 mb-1">Build From Scratch</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Step-by-step guided flow. Choose base, add features, configure parameters.
                    </p>
                  </button>

                  <button
                    onClick={() => setStep("base")}
                    className="group p-5 bg-[var(--surface-1)] border border-white/[0.08] rounded-md hover:border-teal-500/40 hover:bg-[var(--surface-2)] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded bg-teal-500/10 flex items-center justify-center mb-3 group-hover:bg-teal-500/20 transition-colors">
                      <Zap className="w-5 h-5 text-teal-400" />
                    </div>
                    <h4 className="text-sm font-medium text-zinc-200 mb-1">Quick Start Template</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Pre-built contract configurations. Get started in seconds.
                    </p>
                  </button>

                  <button
                    onClick={onDismiss}
                    className="group p-5 bg-[var(--surface-1)] border border-white/[0.08] rounded-md hover:border-zinc-600 hover:bg-[var(--surface-2)] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-zinc-700 transition-colors">
                      <FileCode className="w-5 h-5 text-zinc-400" />
                    </div>
                    <h4 className="text-sm font-medium text-zinc-200 mb-1">Free Build</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Skip the guide. Drag and drop blocks on the canvas directly.
                    </p>
                  </button>
                </div>

                {/* Templates */}
                <div>
                  <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3">Preset Templates</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(template => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="group flex items-center gap-3 p-3 bg-[var(--surface-1)] border border-white/[0.08] rounded hover:border-white/[0.16] hover:bg-[var(--surface-2)] transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded bg-[var(--surface-2)] flex items-center justify-center border border-white/[0.08] flex-shrink-0">
                          {template.base === "erc20" ? <Coins className="w-4 h-4 text-teal-400" /> : <Layers className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-zinc-300 group-hover:text-white truncate">{template.name}</div>
                          <div className="text-[10px] text-zinc-600 truncate">{template.description}</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Choose Base */}
            {step === "base" && (
              <motion.div
                key="base"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1">Select Base Contract</h3>
                  <p className="text-xs text-zinc-500">This determines the core standard your contract implements.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BASE_OPTIONS.map(option => (
                    <button
                      key={option.type}
                      onClick={() => setSelectedBase(option.type)}
                      className={`group p-5 rounded-md border transition-all text-left ${
                        selectedBase === option.type
                          ? "bg-primary/5 border-primary/40"
                          : "bg-[var(--surface-1)] border-white/[0.08] hover:border-white/[0.16] hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 ${
                          selectedBase === option.type
                            ? "bg-primary/15 text-primary"
                            : "bg-[var(--surface-2)] text-zinc-400 group-hover:text-zinc-200"
                        }`}>
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium ${selectedBase === option.type ? "text-primary" : "text-zinc-200"}`}>
                              {option.label}
                            </h4>
                            {selectedBase === option.type && <CheckCircle className="w-4 h-4 text-primary" />}
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{option.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {option.features.map(f => (
                              <span key={f} className="text-[9px] font-mono text-zinc-500 bg-[var(--surface-2)] px-1.5 py-0.5 rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Add Features */}
            {step === "features" && selectedBase && (
              <motion.div
                key="features"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1">Add Features</h3>
                  <p className="text-xs text-zinc-500">
                    Recommended features are pre-selected based on your {selectedBase.toUpperCase()} base.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Group by category */}
                  {Object.entries(
                    (FEATURE_RECOMMENDATIONS[selectedBase] || []).reduce((acc, f) => {
                      if (!acc[f.category]) acc[f.category] = []
                      acc[f.category].push(f)
                      return acc
                    }, {} as Record<string, FeatureRecommendation[]>)
                  ).map(([category, features]) => (
                    <div key={category}>
                      <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {features.map(feature => {
                          const isSelected = selectedFeatures.has(feature.type)
                          return (
                            <button
                              key={feature.type}
                              onClick={() => toggleFeature(feature.type)}
                              className={`flex items-center gap-3 p-3 rounded border transition-all text-left ${
                                isSelected
                                  ? "bg-primary/5 border-primary/30"
                                  : "bg-[var(--surface-1)] border-white/[0.08] hover:border-white/[0.16]"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-zinc-700"
                              }`}>
                                {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium ${isSelected ? "text-zinc-200" : "text-zinc-400"}`}>
                                    {feature.label}
                                  </span>
                                  {feature.recommended && (
                                    <span className="text-[8px] font-mono text-primary bg-primary/10 px-1 py-0.5 rounded uppercase">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-600 truncate">{feature.description}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Configure Parameters */}
            {step === "configure" && (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1">Configure Parameters</h3>
                  <p className="text-xs text-zinc-500">Set the core parameters for your contract.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1.5 font-mono uppercase">Contract Name</label>
                    <input
                      type="text"
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                      className="w-full px-3 py-2.5 bg-[var(--surface-1)] border border-white/[0.08] rounded text-sm text-zinc-200 focus:outline-none focus:border-primary/50 font-mono"
                      placeholder="MyToken"
                    />
                    {contractName && !/^[A-Z]/.test(contractName) && (
                      <p className="text-[10px] text-amber-500 mt-1">Contract names should start with an uppercase letter</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1.5 font-mono uppercase">Token Symbol</label>
                      <input
                        type="text"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                        className="w-full px-3 py-2.5 bg-[var(--surface-1)] border border-white/[0.08] rounded text-sm text-zinc-200 focus:outline-none focus:border-primary/50 font-mono"
                        placeholder="MTK"
                      />
                      <p className="text-[10px] text-zinc-600 mt-1">{tokenSymbol.length}/6 characters</p>
                    </div>
                    {selectedBase === "erc20" && (
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1.5 font-mono uppercase">Initial Supply</label>
                        <input
                          type="number"
                          value={initialSupply}
                          onChange={(e) => setInitialSupply(e.target.value)}
                          className="w-full px-3 py-2.5 bg-[var(--surface-1)] border border-white/[0.08] rounded text-sm text-zinc-200 focus:outline-none focus:border-primary/50 font-mono"
                          placeholder="1000000"
                        />
                        {Number(initialSupply) > 0 && (
                          <p className="text-[10px] text-zinc-600 mt-1">
                            {Number(initialSupply).toLocaleString()} tokens (18 decimals)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Preview */}
            {step === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1">Contract Preview</h3>
                  <p className="text-xs text-zinc-500">Review your contract structure before building.</p>
                </div>

                {/* Tree view */}
                <div className="p-4 bg-[var(--surface-1)] border border-white/[0.08] rounded-md">
                  <div className="font-mono text-[12px] space-y-1.5">
                    <div className="text-zinc-200 font-medium">{contractName}.sol</div>
                    <div className="text-zinc-400 pl-4">
                      ├── <span className="text-primary">{selectedBase === "erc20" ? "ERC20 Base" : "ERC721 Base"}</span>
                    </div>
                    {Array.from(selectedFeatures).map((type, i) => {
                      const isLast = i === selectedFeatures.size - 1
                      const featureLabels: Record<string, string> = {
                        mint: "Mintable", burn: "Burnable", pausable: "Pausable",
                        whitelist: "Whitelist", blacklist: "Blacklist", royalty: "Royalties",
                        timelock: "Time Lock", voting: "Voting", snapshot: "Snapshot",
                        permit: "Permit", transfer: "Transferable",
                      }
                      return (
                        <div key={type} className="text-zinc-400 pl-4">
                          {isLast ? "└── " : "├── "}
                          <span className="text-zinc-300">{featureLabels[type] || type}</span>
                        </div>
                      )
                    })}
                    {selectedFeatures.size === 0 && (
                      <div className="text-zinc-600 pl-4">└── (no additional features)</div>
                    )}
                  </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[var(--surface-1)] border border-white/[0.08] rounded">
                    <div className="text-[9px] text-zinc-600 font-mono uppercase mb-1">Modules</div>
                    <div className="text-lg font-semibold text-zinc-200">{selectedFeatures.size + 1}</div>
                  </div>
                  <div className="p-3 bg-[var(--surface-1)] border border-white/[0.08] rounded">
                    <div className="text-[9px] text-zinc-600 font-mono uppercase mb-1">Est. Functions</div>
                    <div className="text-lg font-semibold text-zinc-200">{(selectedFeatures.size + 1) * 3 + 2}</div>
                  </div>
                  <div className="p-3 bg-[var(--surface-1)] border border-white/[0.08] rounded">
                    <div className="text-[9px] text-zinc-600 font-mono uppercase mb-1">Security</div>
                    <div className="text-lg font-semibold text-emerald-400">
                      {selectedFeatures.has("pausable") ? "High" : "Standard"}
                    </div>
                  </div>
                </div>

                {/* Config summary */}
                <div className="p-3 bg-[var(--surface-1)] border border-white/[0.08] rounded-md">
                  <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">Parameters</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-600">Name:</span>{" "}
                      <span className="text-zinc-300 font-mono">{contractName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600">Symbol:</span>{" "}
                      <span className="text-zinc-300 font-mono">{tokenSymbol}</span>
                    </div>
                    {selectedBase === "erc20" && (
                      <div>
                        <span className="text-zinc-600">Supply:</span>{" "}
                        <span className="text-zinc-300 font-mono">{Number(initialSupply).toLocaleString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-600">Base:</span>{" "}
                      <span className="text-zinc-300 font-mono">{selectedBase?.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[var(--surface-1)] flex items-center justify-between">
          <button
            onClick={() => {
              const steps: OnboardingStep[] = ["welcome", "base", "features", "configure", "preview"]
              const idx = steps.indexOf(step)
              if (idx > 0) setStep(steps[idx - 1])
            }}
            disabled={step === "welcome"}
            className="px-3 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>

          <div className="flex items-center gap-1.5">
            {["welcome", "base", "features", "configure", "preview"].map((s, i) => (
              <div
                key={s}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i <= stepIndex ? "bg-primary" : "bg-zinc-700"
                }`}
              />
            ))}
          </div>

          {step === "preview" ? (
            <button
              onClick={handleFinish}
              disabled={!selectedBase}
              className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-[11px] font-semibold rounded transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              Build Contract
              <Zap className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => {
                const steps: OnboardingStep[] = ["welcome", "base", "features", "configure", "preview"]
                const idx = steps.indexOf(step)
                if (step === "base" && !selectedBase) return
                if (idx < steps.length - 1) {
                  // Auto-select recommended features when moving from base to features
                  if (step === "base" && selectedBase) {
                    const recs = FEATURE_RECOMMENDATIONS[selectedBase]?.filter(f => f.recommended).map(f => f.type) || []
                    setSelectedFeatures(new Set(recs))
                  }
                  setStep(steps[idx + 1])
                }
              }}
              disabled={step === "base" && !selectedBase}
              className="px-4 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-white/[0.08] text-[11px] text-zinc-300 font-medium rounded transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
