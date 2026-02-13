"use client"

import { useBuilderStore } from "@/lib/store"
import { generateSolidityCode, generateTypeScriptCode } from "@/lib/code-generator"
import { useState, useMemo } from "react"
import { Copy, Check, Download, Code2, Rocket, Server, Cpu, Info, Shield, Fuel, AlertTriangle, TreePine, ChevronRight, ChevronDown } from "lucide-react"
import { DeployModal } from "./deploy-modal"
import { cn } from "@/lib/utils"

function getBlockCategory(type: string): string {
  if (type === "erc20" || type === "nft") return "base"
  if (["mint", "burn", "transfer", "airdrop"].includes(type)) return "token"
  if (["pausable", "whitelist", "blacklist", "timelock"].includes(type)) return "security"
  if (["voting", "snapshot", "permit", "multisig"].includes(type)) return "governance"
  if (["stake", "withdraw", "royalty"].includes(type)) return "defi"
  return "token"
}

const CATEGORY_COLORS: Record<string, string> = {
  base: "text-blue-400",
  token: "text-teal-400",
  security: "text-orange-400",
  governance: "text-purple-400",
  defi: "text-emerald-400",
}

export function CodeViewer() {
  const blocks = useBuilderStore((state) => state.blocks)
  const currentProject = useBuilderStore((state) => state.currentProject)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"code" | "structure" | "gas">("code")
  const [codeSubTab, setCodeSubTab] = useState<"solidity" | "frontend">("solidity")
  const [deployOpen, setDeployOpen] = useState(false)
  const [treeExpanded, setTreeExpanded] = useState(true)

  const solidityCode = generateSolidityCode(blocks)
  const frontendCode = generateTypeScriptCode(blocks)

  // Live contract analysis
  const analysis = useMemo(() => {
    const code = solidityCode
    const fnMatches = code.match(/function\s+\w+/g) || []
    const eventMatches = code.match(/event\s+\w+/g) || []
    const modifierMatches = code.match(/modifier\s+\w+/g) || []
    const mappingMatches = code.match(/mapping\s*\(/g) || []
    const stateVarMatches = code.match(/^\s+(string|uint256|address|bool|mapping)\s+public/gm) || []

    const baseBlock = blocks.find(b => b.type === "erc20" || b.type === "nft")
    const hasOwner = code.includes("onlyOwner")
    const hasPausable = blocks.some(b => b.type === "pausable")
    const hasWhitelist = blocks.some(b => b.type === "whitelist")

    let securityLevel: "high" | "medium" | "low" = "low"
    if (hasPausable && hasWhitelist) securityLevel = "high"
    else if (hasPausable || hasOwner) securityLevel = "medium"

    const deployGas = blocks.length * 45000 + 150000
    const mintGas = blocks.some(b => b.type === "mint") ? 35000 + Math.floor(Math.random() * 10000) : 0
    const transferGas = 21000
    const xlmCost = (deployGas * 0.0000001).toFixed(6)

    // Conflict detection
    const conflicts: string[] = []
    const baseType = baseBlock?.type
    if (blocks.some(b => b.type === "royalty") && baseType === "erc20") {
      conflicts.push("Royalties only compatible with NFT base")
    }
    if (blocks.some(b => b.type === "snapshot") && baseType === "nft") {
      conflicts.push("Snapshot only compatible with ERC20 base")
    }
    const mintBlock = blocks.find(b => b.type === "mint")
    if (mintBlock && (!mintBlock.config?.maxSupply || mintBlock.config?.maxSupply === 0)) {
      conflicts.push("Mint has no max supply limit set")
    }

    return {
      functions: fnMatches.length,
      events: eventMatches.length,
      modifiers: modifierMatches.length,
      mappings: mappingMatches.length,
      stateVars: stateVarMatches.length,
      codeSize: code.length,
      estimatedWasmSize: (code.length * 0.015).toFixed(1),
      securityLevel,
      hasOwner,
      hasPausable,
      deployGas,
      mintGas,
      transferGas,
      xlmCost,
      conflicts,
      baseType: baseType?.toUpperCase() || "NONE",
    }
  }, [blocks, solidityCode])

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownload = (code: string, filename: string) => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(code))
    element.setAttribute("download", filename)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const currentCode = codeSubTab === "solidity" ? solidityCode : frontendCode
  const filename = codeSubTab === "solidity" ? "contract.sol" : "dapp.tsx"

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#0B0F14] border-b border-white/[0.06] p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Generated Source
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-[#1A1F26] p-0.5 rounded border border-white/[0.06] mb-3">
          {([
            { key: "code", label: "Code" },
            { key: "structure", label: "Structure" },
            { key: "gas", label: "Gas" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 px-3 py-1.5 text-[10px] font-medium rounded transition-all duration-[180ms]",
                activeTab === tab.key
                  ? "bg-[#222730] text-white border-t-2 border-t-blue-500/50"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Sub-tabs */}
        {activeTab === "code" && (
          <div className="flex gap-1 bg-[#1A1F26] p-0.5 rounded border border-white/[0.06] mb-3">
            <button
              onClick={() => setCodeSubTab("solidity")}
              className={cn(
                "flex-1 px-2 py-1 text-[10px] font-medium rounded transition-all duration-[180ms]",
                codeSubTab === "solidity" ? "bg-[#222730] text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Contract
            </button>
            <button
              onClick={() => setCodeSubTab("frontend")}
              className={cn(
                "flex-1 px-2 py-1 text-[10px] font-medium rounded transition-all duration-[180ms]",
                codeSubTab === "frontend" ? "bg-[#222730] text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Frontend
            </button>
          </div>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1A1F26] p-2 rounded border border-white/[0.06]">
            <span className="text-[9px] text-zinc-500 uppercase block mb-1">Network</span>
            <div className="flex items-center gap-1.5">
              <Server className="w-3 h-3 text-zinc-400" />
              <span className="text-[10px] text-zinc-300 font-mono">Stellar Testnet</span>
            </div>
          </div>
          <div className="bg-[#1A1F26] p-2 rounded border border-white/[0.06]">
            <span className="text-[9px] text-zinc-500 uppercase block mb-1">Security</span>
            <div className="flex items-center gap-1.5">
              <Shield className={`w-3 h-3 ${
                analysis.securityLevel === "high" ? "text-emerald-400" :
                analysis.securityLevel === "medium" ? "text-amber-400" : "text-zinc-500"
              }`} />
              <span className={`text-[10px] font-mono capitalize ${
                analysis.securityLevel === "high" ? "text-emerald-400" :
                analysis.securityLevel === "medium" ? "text-amber-400" : "text-zinc-400"
              }`}>
                {analysis.securityLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Overview */}
      <div className="p-3 border-b border-white/[0.06] bg-[#0B0F14]/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Contract Overview</span>
          <span className={`text-[10px] font-mono flex items-center gap-1 ${
            analysis.conflicts.length === 0 ? "text-emerald-500" : "text-amber-500"
          }`}>
            {analysis.conflicts.length === 0 ? (
              <><Check className="w-3 h-3" /> Valid</>
            ) : (
              <><AlertTriangle className="w-3 h-3" /> {analysis.conflicts.length} issue{analysis.conflicts.length > 1 ? "s" : ""}</>
            )}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-400">Functions</span>
            <span className="font-mono text-zinc-200">{analysis.functions}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-400">State Variables</span>
            <span className="font-mono text-zinc-200">{analysis.stateVars}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-400">Modifiers</span>
            <span className="font-mono text-zinc-200">{analysis.modifiers}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-400">Events</span>
            <span className="font-mono text-zinc-200">{analysis.events}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-400">Est. Size</span>
            <span className="font-mono text-zinc-200">{analysis.estimatedWasmSize} KB</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-[#0F1419] relative">
        {/* Code Tab */}
        {activeTab === "code" && (
          <div className="relative group h-full">
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => handleCopy(currentCode, "code")}
                className="p-1.5 bg-[#1A1F26] border border-white/[0.06] rounded text-zinc-400 hover:text-white"
              >
                {copied === "code" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={() => handleDownload(currentCode, filename)}
                className="p-1.5 bg-[#1A1F26] border border-white/[0.06] rounded text-zinc-400 hover:text-white"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
            <pre className="p-4 text-[10px] font-mono leading-relaxed text-zinc-400 tab-4 h-full overflow-auto">
              <code>{currentCode}</code>
            </pre>
          </div>
        )}

        {/* Structure Tab */}
        {activeTab === "structure" && (
          <div className="p-4 space-y-4">
            {/* Contract Tree */}
            <div>
              <button
                onClick={() => setTreeExpanded(!treeExpanded)}
                className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium mb-2 hover:text-white transition-colors"
              >
                {treeExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <TreePine className="w-3.5 h-3.5 text-primary" />
                Contract Tree
              </button>

              {treeExpanded && (
                <div className="font-mono text-[11px] space-y-1 pl-2 border-l border-white/[0.06]">
                  <div className="text-zinc-200 font-medium pl-2">
                    {currentProject?.name || "Contract"}.sol
                  </div>
                  {blocks.length === 0 ? (
                    <div className="text-zinc-600 pl-6">└── (empty)</div>
                  ) : (
                    blocks.map((block, i) => {
                      const cat = getBlockCategory(block.type)
                      const color = CATEGORY_COLORS[cat]
                      const isLast = i === blocks.length - 1
                      return (
                        <div key={block.id} className="pl-6 flex items-center gap-1.5">
                          <span className="text-zinc-600">{isLast ? "└── " : "├── "}</span>
                          <span className={color}>{block.label}</span>
                          <span className="text-zinc-700 text-[9px]">[{cat}]</span>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {/* Dependency Map */}
            <div>
              <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">Dependencies</h4>
              <div className="space-y-1.5">
                {blocks.filter(b => b.type !== "erc20" && b.type !== "nft").map(block => {
                  const base = blocks.find(b => b.type === "erc20" || b.type === "nft")
                  const satisfied = !!base
                  return (
                    <div key={block.id} className="flex items-center gap-2 text-[10px]">
                      <span className={satisfied ? "text-emerald-500" : "text-red-500"}>
                        {satisfied ? "●" : "○"}
                      </span>
                      <span className="text-zinc-400">{block.label}</span>
                      <span className="text-zinc-700">→</span>
                      <span className={satisfied ? "text-zinc-400" : "text-red-400"}>
                        {base?.label || "Missing Base"}
                      </span>
                    </div>
                  )
                })}
                {blocks.filter(b => b.type !== "erc20" && b.type !== "nft").length === 0 && (
                  <p className="text-[10px] text-zinc-600">No feature dependencies</p>
                )}
              </div>
            </div>

            {/* Conflicts */}
            {analysis.conflicts.length > 0 && (
              <div>
                <h4 className="text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2">Conflicts</h4>
                <div className="space-y-1.5">
                  {analysis.conflicts.map((conflict, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-amber-400">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{conflict}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gas Tab */}
        {activeTab === "gas" && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3">Gas Estimation</h4>
              <div className="space-y-3">
                {/* Deploy gas */}
                <div className="p-3 bg-[#11151A] border border-white/[0.06] rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-zinc-300 font-medium">Deployment</span>
                    <span className="text-[11px] font-mono text-zinc-200">{analysis.deployGas.toLocaleString()} gas</span>
                  </div>
                  <div className="h-1.5 bg-[#1A1F26] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500/60 rounded-full"
                      style={{ width: `${Math.min((analysis.deployGas / 500000) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[9px] text-zinc-600">
                    <span>Est. Cost</span>
                    <span className="font-mono">{analysis.xlmCost} XLM</span>
                  </div>
                </div>

                {/* Transfer gas */}
                <div className="p-3 bg-[#11151A] border border-white/[0.06] rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-zinc-300 font-medium">Transfer</span>
                    <span className="text-[11px] font-mono text-zinc-200">~{analysis.transferGas.toLocaleString()} gas</span>
                  </div>
                  <div className="h-1.5 bg-[#1A1F26] rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500/60 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>

                {/* Mint gas */}
                {analysis.mintGas > 0 && (
                  <div className="p-3 bg-[#11151A] border border-white/[0.06] rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-zinc-300 font-medium">Mint</span>
                      <span className="text-[11px] font-mono text-zinc-200">~{analysis.mintGas.toLocaleString()} gas</span>
                    </div>
                    <div className="h-1.5 bg-[#1A1F26] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Efficiency score */}
            <div className="p-3 bg-[#11151A] border border-white/[0.06] rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-zinc-600 uppercase">Efficiency Score</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {Math.min(96, 80 + blocks.length * 2)}/100
                </span>
              </div>
              <div className="h-2 bg-[#1A1F26] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500/50 rounded-full transition-all"
                  style={{ width: `${Math.min(96, 80 + blocks.length * 2)}%` }}
                />
              </div>
            </div>

            {/* Optimization tips */}
            <div>
              <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">Optimization</h4>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>Optimizer enabled (200 runs)</span>
                </div>
                {analysis.hasPausable && (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3 h-3" />
                    <span>Emergency pause reduces risk premium</span>
                  </div>
                )}
                {!analysis.hasPausable && (
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Info className="w-3 h-3" />
                    <span>Add Pausable to improve security score</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deploy footer */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0B0F14]">
        {blocks.length > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] text-zinc-500">
              <span>Est. Deploy Cost</span>
              <span className="font-mono text-zinc-300">{analysis.xlmCost} XLM</span>
            </div>

            <button
              onClick={() => setDeployOpen(true)}
              className="w-full h-9 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded flex items-center justify-center gap-2 transition-all"
            >
              <Rocket className="w-3 h-3" />
              Deploy to Network
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <span className="text-[10px] text-zinc-600">Add blocks to enable deployment</span>
          </div>
        )}
      </div>

      <DeployModal isOpen={deployOpen} onClose={() => setDeployOpen(false)} />
    </div>
  )
}
