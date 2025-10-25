"use client"

import { useBuilderStore } from "@/lib/store"
import { Download, Play, Eye, FolderOpen, Wallet } from "lucide-react"
import { useState, useEffect } from "react"
import { PreviewModal } from "./preview-modal"
import { DeployModal } from "./deploy-modal"
import { ProjectManager } from "./project-manager"
import { ethers } from "ethers"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function Navbar() {
  const currentProject = useBuilderStore((state) => state.currentProject)
  const blocks = useBuilderStore((state) => state.blocks)
  const saveProject = useBuilderStore((state) => state.saveProject)
  const walletAddress = useBuilderStore((state) => state.walletAddress)
  const setWalletAddress = useBuilderStore((state) => state.setWalletAddress)
  const setWalletChainId = useBuilderStore((state) => state.setWalletChainId)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [projectManagerOpen, setProjectManagerOpen] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected on load
    checkWalletConnection()

    // Listen for account and chain changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setWalletAddress(address)

          // Get current chain ID
          const network = await provider.getNetwork()
          setWalletChainId(Number(network.chainId))
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletAddress(null)
      setWalletChainId(null)
    } else {
      setWalletAddress(accounts[0])
    }
  }

  const handleChainChanged = async (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16)
    setWalletChainId(chainId)
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet!")
      return
    }

    setConnectingWallet(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setWalletAddress(address)

      // Get current chain ID
      const network = await provider.getNetwork()
      setWalletChainId(Number(network.chainId))
    } catch (err) {
      console.error("Error connecting wallet:", err)
      alert("Failed to connect wallet. Please try again.")
    } finally {
      setConnectingWallet(false)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setWalletChainId(null)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleExportProject = () => {
    if (!currentProject) return

    const projectData = {
      ...currentProject,
      blocks: blocks,
    }

    const element = document.createElement("a")
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2)),
    )
    element.setAttribute("download", `${currentProject.name}.json`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    // Save to store
    saveProject()
  }

  return (
    <>
      <nav className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Celo Builder</h1>
            <p className="text-xs text-muted">{currentProject?.name || "New Project"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {formatAddress(walletAddress)}
              </div>
              <button
                onClick={disconnectWallet}
                className="px-3 py-2 bg-background border border-border rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-colors text-foreground text-sm font-medium"
                title="Disconnect wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connectingWallet}
              className="px-4 py-2 bg-primary/10 border border-primary rounded-lg hover:bg-primary hover:text-background transition-colors text-primary text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Connect your wallet"
            >
              <Wallet size={16} />
              {connectingWallet ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
          <button
            onClick={() => setProjectManagerOpen(true)}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-colors text-foreground text-sm font-medium flex items-center gap-2"
            title="Manage projects"
          >
            <FolderOpen size={16} />
            Projects
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            disabled={blocks.length === 0}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-colors text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Preview the generated dApp"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={handleExportProject}
            disabled={blocks.length === 0}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-colors text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export project as JSON"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setDeployOpen(true)}
            disabled={blocks.length === 0}
            className="relative px-6 py-3 bg-primary hover:bg-primary-dark text-background rounded-lg transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 disabled:hover:scale-100 disabled:shadow-none animate-pulse-slow"
            title="Deploy to Celo Mainnet or Testnet"
          >
            <Play size={18} className="animate-bounce-subtle" />
            <span>Deploy to Celo</span>
            {blocks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                ✓
              </span>
            )}
          </button>
        </div>
      </nav>

      <PreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
      <DeployModal isOpen={deployOpen} onClose={() => setDeployOpen(false)} />
      <ProjectManager isOpen={projectManagerOpen} onClose={() => setProjectManagerOpen(false)} />
    </>
  )
}
