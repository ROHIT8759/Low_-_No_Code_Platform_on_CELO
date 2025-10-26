"use client"

import { useBuilderStore } from "@/lib/store"
import { generateSolidityCode, generateTypeScriptCode } from "@/lib/code-generator"
import { useState } from "react"
import { Copy, Check, Download, Eye, Code2, FileJson, Rocket } from "lucide-react"
import { DeployModal } from "./deploy-modal"

export function CodeViewer() {
  const blocks = useBuilderStore((state) => state.blocks)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"solidity" | "frontend">("solidity")
  const [deployOpen, setDeployOpen] = useState(false)

  const solidityCode = generateSolidityCode(blocks)
  const frontendCode = generateTypeScriptCode(blocks)

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
      default:
        return solidityCode
    }
  }

  const getFilename = () => {
    switch (activeTab) {
      case "frontend":
        return "dapp.tsx"
      default:
        return "contract.sol"
    }
  }

  const currentCode = getCode()

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col h-full animate-fade-in-up">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3 hover:text-primary transition-colors cursor-default">Generated Code</h2>
        <div className="flex gap-1 bg-background p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("solidity")}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-all hover:scale-105 ${activeTab === "solidity"
              ? "bg-primary text-background shadow-lg shadow-primary/30"
              : "text-muted hover:text-foreground hover:bg-border/50"
              }`}
          >
            <Code2 size={14} className={activeTab === "solidity" ? "animate-pulse" : ""} />
            Solidity
          </button>
          <button
            onClick={() => setActiveTab("frontend")}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-all hover:scale-105 ${activeTab === "frontend"
              ? "bg-primary text-background shadow-lg shadow-primary/30"
              : "text-muted hover:text-foreground hover:bg-border/50"
              }`}
          >
            <Eye size={14} className={activeTab === "frontend" ? "animate-pulse" : ""} />
            Frontend
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col">
        <div className="relative flex-1 flex flex-col mb-3 animate-fade-in-up">
          <div className="absolute top-0 right-0 text-xs text-muted/50 px-2 py-1 bg-background rounded-bl border-l border-b border-border">
            {currentCode.split("\n").length} lines
          </div>
          <pre className="text-xs text-muted-foreground bg-background p-3 rounded border border-border overflow-x-auto flex-1 font-mono hover:border-primary/50 transition-colors">
            <code>{currentCode}</code>
          </pre>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleCopy(currentCode, activeTab)}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-background hover:bg-border rounded transition-all hover:scale-105 text-sm font-medium text-muted hover:text-foreground group"
            title="Copy to clipboard"
          >
            {copied === activeTab ? (
              <>
                <Check size={16} className="text-primary animate-bounce" />
                <span className="text-primary">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} className="group-hover:scale-110 transition-transform" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={() => handleDownload(currentCode, getFilename())}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-background hover:bg-border rounded transition-all hover:scale-105 text-sm font-medium text-muted hover:text-foreground group"
            title="Download file"
          >
            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
            Download
          </button>
        </div>

        {/* Enhanced Deploy CTA */}
        {blocks.length > 0 && activeTab === "solidity" && (
          <div className="mt-4 p-4 bg-primary/10 border-2 border-primary/30 rounded-lg hover:border-primary/50 transition-all hover:scale-[1.02] animate-fade-in-up">
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/50 blur-xl animate-pulse"></div>
                <div className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0 animate-bounce-subtle">
                  <Rocket size={20} className="text-background" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1 hover:text-primary transition-colors">Ready to Deploy? 🚀</h3>
                <p className="text-xs text-muted hover:text-muted-foreground transition-colors">
                  Your smart contract is ready! Deploy it to Celo Mainnet or Testnet in just a few clicks.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeployOpen(true)}
              className="relative w-full px-4 py-3 bg-primary hover:bg-primary-dark text-background rounded-lg font-semibold transition-all hover:scale-105 hover:-translate-y-0.5 shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 group overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
              <Rocket size={18} className="relative group-hover:rotate-12 group-hover:scale-110 transition-transform" />
              <span className="relative">Deploy to Celo Now</span>
            </button>
          </div>
        )}
      </div>

      <DeployModal isOpen={deployOpen} onClose={() => setDeployOpen(false)} />
    </div>
  )
}
