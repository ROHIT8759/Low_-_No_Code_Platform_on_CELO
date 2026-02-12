"use client"

import { useBuilderStore } from "@/lib/store"
import { generateSolidityCode, generateTypeScriptCode } from "@/lib/code-generator"
import { useState } from "react"
import { Copy, Check, Download, Eye, Code2, Rocket, Server, Cpu, Activity, Info, Shield, ChevronDown } from "lucide-react"
import { DeployModal } from "./deploy-modal"
import { cn } from "@/lib/utils"

export function CodeViewer() {
  const blocks = useBuilderStore((state) => state.blocks)
  const currentProject = useBuilderStore((state) => state.currentProject)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"code" | "abi" | "metadata">("code")
  const [codeSubTab, setCodeSubTab] = useState<"solidity" | "frontend">("solidity")
  const [deployOpen, setDeployOpen] = useState(false)

  const solidityCode = generateSolidityCode(blocks)
  const frontendCode = generateTypeScriptCode(blocks)

  // Mock ABI data - in real implementation, this would come from compilation
  const abiData = JSON.stringify({
    "contract_name": "BlockBuilderContract",
    "functions": blocks.map((block, idx) => ({
      "name": `function_${idx}`,
      "inputs": [],
      "outputs": []
    })),
    "version": "1.0.0"
  }, null, 2)

  // Mock metadata
  const metadataContent = JSON.stringify({
    "compiler": {
      "name": "soroban-sdk",
      "version": "20.0.0"
    },
    "contract": {
      "name": currentProject?.name || "Untitled Contract",
      "functions": blocks.length + 2,
      "estimated_size": "12.4 KB"
    },
    "network": {
      "target": "Stellar Testnet",
      "protocol": "Soroban"
    },
    "security": {
      "checks_passed": true,
      "vulnerabilities": 0
    },
    "optimization": {
      "level": "3",
      "size_reduction": "42%"
    }
  }, null, 2)

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
  const filename = codeSubTab === "solidity" ? "contract.rs" : "dapp.tsx"

  // Get content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case "code":
        return currentCode
      case "abi":
        return abiData
      case "metadata":
        return metadataContent
      default:
        return currentCode
    }
  }

  const getFilename = () => {
    switch (activeTab) {
      case "code":
        return filename
      case "abi":
        return "contract.abi.json"
      case "metadata":
        return "metadata.json"
      default:
        return filename
    }
  }

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

        {/* Main Tab Navigation - Code, ABI, Metadata */}
        <div className="flex gap-1 bg-[#1A1F26] p-0.5 rounded border border-white/[0.06] mb-3">
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex-1 px-3 py-1.5 text-[10px] font-medium rounded transition-colors",
              activeTab === "code" 
                ? "bg-[#222730] text-white border-t-2 border-t-blue-500/50" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab("abi")}
            className={cn(
              "flex-1 px-3 py-1.5 text-[10px] font-medium rounded transition-colors",
              activeTab === "abi" 
                ? "bg-[#222730] text-white border-t-2 border-t-blue-500/50" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            ABI
          </button>
          <button
            onClick={() => setActiveTab("metadata")}
            className={cn(
              "flex-1 px-3 py-1.5 text-[10px] font-medium rounded transition-colors",
              activeTab === "metadata" 
                ? "bg-[#222730] text-white border-t-2 border-t-blue-500/50" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Metadata
          </button>
        </div>

        {/* Code Sub-tabs (only visible when Code tab is active) */}
        {activeTab === "code" && (
          <div className="flex gap-1 bg-[#1A1F26] p-0.5 rounded border border-white/[0.06] mb-3">
            <button
              onClick={() => setCodeSubTab("solidity")}
              className={cn(
                "flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors",
                codeSubTab === "solidity" 
                  ? "bg-[#222730] text-white" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Rust/WASM
            </button>
            <button
              onClick={() => setCodeSubTab("frontend")}
              className={cn(
                "flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors",
                codeSubTab === "frontend" 
                  ? "bg-[#222730] text-white" 
                  : "text-zinc-500 hover:text-zinc-300"
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
            <span className="text-[9px] text-zinc-500 uppercase block mb-1">Compiler</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-zinc-400" />
              <span className="text-[10px] text-zinc-300 font-mono">soroban-sdk v20</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Overview */}
      <div className="p-3 border-b border-white/[0.06] bg-[#0B0F14]/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Contract Overview</span>
          <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
            <Check className="w-3 h-3" /> Valid
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-400">Functions Exported</span>
            <span className="font-mono text-zinc-200">{blocks.length + 2}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-400">Est. WASM Size</span>
            <span className="font-mono text-zinc-200">12.4 KB</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-400">Security Checks</span>
            <span className="font-mono text-emerald-400">Pass</span>
          </div>
        </div>
      </div>

      {/* Code display */}
      <div className="flex-1 overflow-auto bg-[#0F1419] relative group">
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button 
            onClick={() => handleCopy(getTabContent(), activeTab)} 
            className="p-1.5 bg-[#1A1F26] border border-white/[0.06] rounded text-zinc-400 hover:text-white"
          >
            {copied === activeTab ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
          <button 
            onClick={() => handleDownload(getTabContent(), getFilename())} 
            className="p-1.5 bg-[#1A1F26] border border-white/[0.06] rounded text-zinc-400 hover:text-white"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
        <pre className="p-4 text-[10px] font-mono leading-relaxed text-zinc-400 tab-4">
          <code>{getTabContent()}</code>
        </pre>
      </div>

      {/* Deploy footer */}
      <div className="p-4 border-t border-white/[0.06] bg-[#0B0F14]">
        {blocks.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] text-zinc-500">
              <span>Est. Cost</span>
              <span className="font-mono text-zinc-300">0.0021 XLM</span>
            </div>

            <button
              onClick={() => setDeployOpen(true)}
              className="w-full h-9 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all"
            >
              <Rocket className="w-3 h-3" />
              Deploy to Network
            </button>

            <div className="flex justify-center">
              <span className="text-[9px] text-zinc-600 flex items-center gap-1">
                <Info className="w-2.5 h-2.5" />
                Automated verification enabled
              </span>
            </div>
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
