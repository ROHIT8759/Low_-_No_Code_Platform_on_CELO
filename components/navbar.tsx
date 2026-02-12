import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { Download, Play, Eye, FolderOpen, Wallet, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "framer-motion";
import { PreviewModal } from "./preview-modal"
import { DeployModal } from "./deploy-modal"
import { ProjectManager } from "./project-manager"
import { ethers } from "ethers"
import { NetworkSwitcher } from "./network-switcher"
import { useNetwork } from "@/lib/multi-chain/network-context"
import { connectStellarWallet, checkStellarConnection } from "@/lib/stellar/stellar-wallet"

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
  const { networkType } = useNetwork()
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
  }, [networkType])

  const checkWalletConnection = async () => {
    if (networkType === 'stellar') {
      const status = await checkStellarConnection();
      if (status.isConnected && status.publicKey) {
        setWalletAddress(status.publicKey);
        // setWalletChainId? Stellar doesn't have numeric chainId in the same way, maybe store network passphrase hash or 0
        setWalletChainId(0);
      }
      return;
    }

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
    setConnectingWallet(true)
    try {
      if (networkType === 'stellar') {
        const status = await connectStellarWallet();
        if (status.isConnected && status.publicKey) {
          setWalletAddress(status.publicKey);
          setWalletChainId(0);
          await initializeUser(status.publicKey);
        } else {
          alert("Failed to connect Stellar wallet. Please ensure Freighter is installed and unlocked.");
        }
        return;
      }

      if (!window.ethereum) {
        alert("Please install MetaMask or another Web3 wallet!")
        return
      }

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

  // Scroll visibility logic
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;
      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        setVisible(direction < 0);
      }
    }
  });

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-6 inset-x-0 mx-auto max-w-7xl z-50 flex items-center justify-between px-6 py-3 border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-xl shadow-2xl rounded-2xl"
        >
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative w-9 h-9 bg-linear-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-inner border border-white/10">
                <span className="text-white font-bold text-lg">B</span>
              </div>
            </div>
            <div className="hidden xs:block">
              <h1 className="text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">Block Builder</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Enterprise Edition</p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <NetworkSwitcher />

            {/* Wallet Section */}
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <div className="group relative px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-300 text-sm font-medium flex items-center gap-2 transition-all hover:bg-zinc-800 hover:border-zinc-600 cursor-default">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  {formatAddress(walletAddress)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Disconnect"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={connectingWallet}
                className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2"
              >
                <Wallet size={16} />
                {connectingWallet ? "Connecting..." : "Connect Wallet"}
              </button>
            )}

            <div className="h-6 w-px bg-zinc-800 mx-2"></div>

            {/* Project Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProjectManagerOpen(true)}
                className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="Projects"
              >
                <FolderOpen size={18} />
              </button>
              <button
                onClick={() => setPreviewOpen(true)}
                disabled={blocks.length === 0}
                className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-30"
                title="Preview"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={handleExportProject}
                disabled={blocks.length === 0}
                className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-30"
                title="Export"
              >
                <Download size={18} />
              </button>
            </div>

            <button
              onClick={() => setDeployOpen(true)}
              disabled={blocks.length === 0}
              className="group relative px-6 py-2.5 bg-primary text-white font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all overflow-hidden disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <div className="relative flex items-center gap-2">
                <Play size={16} className="fill-current" />
                <span>Deploy</span>
              </div>
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.nav>
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-24 mx-4 p-4 z-40 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl lg:hidden flex flex-col gap-4"
          >
            <NetworkSwitcher />
            {/* Mobile Wallet & Actions... (Simplified for brevity, can match desktop logic) */}
            <button
              onClick={() => setDeployOpen(true)}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold"
            >
              Deploy Project
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
      <DeployModal isOpen={deployOpen} onClose={() => setDeployOpen(false)} />
      <ProjectManager isOpen={projectManagerOpen} onClose={() => setProjectManagerOpen(false)} />
    </>
  );
}

