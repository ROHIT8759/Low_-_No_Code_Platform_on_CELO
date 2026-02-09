"use client"

import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { Download, Play, Eye, FolderOpen, Wallet, Menu, X } from "lucide-react"
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
  const initializeUser = useSupabaseStore((state) => state.initializeUser)
  const currentUser = useSupabaseStore((state) => state.user)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [projectManagerOpen, setProjectManagerOpen] = useState(false)
  const [connectingWallet, setConnectingWallet] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

          // Initialize user in Supabase (store wallet on reconnection)
          await initializeUser(address)
          console.log('✅ Wallet reconnected and stored in Supabase')
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletAddress(null)
      setWalletChainId(null)
    } else {
      setWalletAddress(accounts[0])
      // Store new account in Supabase when user switches accounts
      await initializeUser(accounts[0])
      console.log('✅ Account changed and stored in Supabase')
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

      // Initialize user in Supabase
      await initializeUser(address)
      console.log('✅ User initialized in Supabase')
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
      <nav className="bg-card border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between animate-fade-in-down">
        <div className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/50 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-primary/50">
              <span className="text-background font-bold text-xs sm:text-sm">C</span>
            </div>
          </div>
          <div className="hidden xs:block">
            <h1 className="text-sm sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">Block Builder</h1>
            <p className="text-[10px] sm:text-xs text-muted group-hover:text-muted-foreground transition-colors truncate max-w-[100px] sm:max-w-none">{currentProject?.name || "New Project"}</p>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg bg-background border border-border hover:border-primary transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-3">
          {walletAddress ? (
            <div className="flex items-center gap-2 animate-fade-in-up">
              <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-medium flex items-center gap-2 hover:scale-105 hover:bg-cyan-500/20 transition-all">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </div>
                {formatAddress(walletAddress)}
              </div>
              <button
                onClick={disconnectWallet}
                className="px-3 py-2 bg-background border border-border rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-all hover:scale-110 hover:rotate-6 text-foreground text-sm font-medium"
                title="Disconnect wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connectingWallet}
              className="px-4 py-2 bg-primary/10 border border-primary rounded-lg hover:bg-primary hover:text-background transition-all hover:scale-105 hover:-translate-y-0.5 text-primary text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/40"
              title="Connect your wallet"
            >
              <Wallet size={16} className="group-hover:animate-pulse" />
              {connectingWallet ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
          <button
            onClick={() => setProjectManagerOpen(true)}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-all hover:scale-105 hover:-translate-y-0.5 text-foreground text-sm font-medium flex items-center gap-2 group"
            title="Manage projects"
          >
            <FolderOpen size={16} className="group-hover:scale-110 transition-transform" />
            Projects
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            disabled={blocks.length === 0}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-all hover:scale-105 hover:-translate-y-0.5 text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Preview the generated dApp"
          >
            <Eye size={16} className="group-hover:scale-110 transition-transform" />
            Preview
          </button>
          <button
            onClick={handleExportProject}
            disabled={blocks.length === 0}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-all hover:scale-105 hover:-translate-y-0.5 text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Export project as JSON"
          >
            <Download size={16} className="group-hover:scale-110 group-hover:translate-y-0.5 transition-transform" />
            Export
          </button>
          <button
            onClick={() => setDeployOpen(true)}
            disabled={blocks.length === 0}
            className="relative px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-primary-dark text-background rounded-lg transition-all text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 hover:scale-105 hover:-translate-y-1 disabled:hover:scale-100 disabled:shadow-none overflow-hidden group"
            title="Deploy to Celo Mainnet or Testnet"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
            <Play size={18} className="relative animate-bounce-subtle group-hover:scale-110 transition-transform" />
            <span className="relative hidden sm:inline">Deploy to Celo</span>
            <span className="relative sm:hidden">Deploy</span>
            {blocks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold animate-pulse shadow-lg shadow-cyan-500/50">
                ✓
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-card border-b border-border p-4 flex flex-col gap-3 animate-fade-in-down z-50 shadow-xl">
            {walletAddress ? (
              <div className="flex items-center justify-between gap-2">
                <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-medium flex items-center gap-2 flex-1">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                  </div>
                  {formatAddress(walletAddress)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-2 bg-background border border-border rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-all text-foreground text-sm font-medium"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={connectingWallet}
                className="w-full px-4 py-3 bg-primary/10 border border-primary rounded-lg hover:bg-primary hover:text-background transition-all text-primary text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Wallet size={16} />
                {connectingWallet ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setProjectManagerOpen(true); setMobileMenuOpen(false); }}
                className="px-3 py-3 bg-background border border-border rounded-lg hover:border-primary transition-all text-foreground text-sm font-medium flex items-center justify-center gap-2"
              >
                <FolderOpen size={16} />
                Projects
              </button>
              <button
                onClick={() => { setPreviewOpen(true); setMobileMenuOpen(false); }}
                disabled={blocks.length === 0}
                className="px-3 py-3 bg-background border border-border rounded-lg hover:border-primary transition-all text-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => { handleExportProject(); setMobileMenuOpen(false); }}
                disabled={blocks.length === 0}
                className="px-3 py-3 bg-background border border-border rounded-lg hover:border-primary transition-all text-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => { setDeployOpen(true); setMobileMenuOpen(false); }}
                disabled={blocks.length === 0}
                className="px-3 py-3 bg-primary text-background rounded-lg transition-all text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play size={16} />
                Deploy
              </button>
            </div>
          </div>
        )}
      </nav>

      <PreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
      <DeployModal isOpen={deployOpen} onClose={() => setDeployOpen(false)} />
      <ProjectManager isOpen={projectManagerOpen} onClose={() => setProjectManagerOpen(false)} />
    </>
  )
}
