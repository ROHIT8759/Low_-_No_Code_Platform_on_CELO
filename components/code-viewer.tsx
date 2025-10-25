"use client"

import { useBuilderStore } from "@/lib/store"
import { generateSolidityCode, generateFrontendCode, generateContractABI } from "@/lib/code-generator"
import { useState } from "react"
import { Copy, Check, Download, Eye, Code2, FileJson, Rocket } from "lucide-react"
import { DeployModal } from "./deploy-modal"

export function CodeViewer() {
  const blocks = useBuilderStore((state) => state.blocks)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"solidity" | "frontend" | "abi">("solidity")
  const [deployOpen, setDeployOpen] = useState(false)

  const solidityCode = generateSolidityCode(blocks)
  const frontendCode = generateFrontendCode(blocks)
  const abiCode = generateContractABI(blocks)

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

  const getCode = () => {
    switch (activeTab) {
      case "frontend":
        return frontendCode
      case "abi":
        return abiCode
      default:
        return solidityCode
    }
  }

  const getFilename = () => {
    switch (activeTab) {
      case "frontend":
        return "dapp.tsx"
      case "abi":
        return "contract-abi.json"
      default:
        return "contract.sol"
    }
  }

  const currentCode = getCode()

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Generated Code</h2>
        <div className="flex gap-1 bg-background p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("solidity")}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === "solidity"
                ? "bg-primary text-background"
                : "text-muted hover:text-foreground hover:bg-border/50"
              }`}
          >
            <Code2 size={14} />
            Solidity
          </button>
          <button
            onClick={() => setActiveTab("frontend")}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === "frontend"
                ? "bg-primary text-background"
                : "text-muted hover:text-foreground hover:bg-border/50"
              }`}
          >
            <Eye size={14} />
            Frontend
          </button>
          <button
            onClick={() => setActiveTab("abi")}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === "abi" ? "bg-primary text-background" : "text-muted hover:text-foreground hover:bg-border/50"
              }`}
          >
            <FileJson size={14} />
            ABI
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col">
        <div className="relative flex-1 flex flex-col mb-3">
          <div className="absolute top-0 right-0 text-xs text-muted/50 px-2 py-1">
            {currentCode.split("\n").length} lines
          </div>
          <pre className="text-xs text-muted-foreground bg-background p-3 rounded border border-border overflow-x-auto flex-1 font-mono">
            <code>{currentCode}</code>
          </pre>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleCopy(currentCode, activeTab)}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-background hover:bg-border rounded transition-colors text-sm font-medium text-muted hover:text-foreground"
            title="Copy to clipboard"
          >
            {copied === activeTab ? (
              <>
                <Check size={16} className="text-primary" />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>
          <button
            onClick={() => handleDownload(currentCode, getFilename())}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-background hover:bg-border rounded transition-colors text-sm font-medium text-muted hover:text-foreground"
            title="Download file"
          >
            <Download size={16} />
            Download
          </button>
        </div>

        {/* Deploy CTA */}
        {blocks.length > 0 && activeTab === "solidity" && (
          <div className="mt-4 p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <Rocket size={20} className="text-background" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Ready to Deploy?</h3>
                <p className="text-xs text-muted">
                  Your smart contract is ready! Deploy it to Celo Alfajores testnet in just a few clicks.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeployOpen(true)}
              className="w-full px-4 py-3 bg-primary hover:bg-primary-dark text-background rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              <Rocket size={18} />
              Deploy to Celo Now
            </button>
          </div>
        )}
      </div>

      <DeployModal isOpen={deployOpen} onClose={() => setDeployOpen(false)} />
    </div>
  )
}
