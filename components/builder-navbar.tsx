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

export function BuilderNavbar() {
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

    return (
        <>
            <nav className="border-b border-zinc-800 bg-[#0B0F14] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 group cursor-pointer bg-[#1A1F26] hover:bg-[#222730] border border-[#222730] rounded-lg px-2 py-1 transition-colors">
                        <span className="text-primary font-bold">B</span>
                        <span className="text-sm font-semibold text-zinc-200">Block Builder</span>
                    </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <NetworkSwitcher />

                    {/* Wallet Section */}
                    {walletAddress ? (
                        <div className="flex items-center gap-2">
                            <div className="group relative px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 text-xs font-medium flex items-center gap-2 hover:bg-zinc-800 hover:border-zinc-600 cursor-default transition-all">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                {formatAddress(walletAddress)}
                            </div>
                            <button
                                onClick={disconnectWallet}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Disconnect"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={connectWallet}
                            disabled={connectingWallet}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-all border border-zinc-700 flex items-center gap-2"
                        >
                            <Wallet size={14} />
                            {connectingWallet ? "Connecting..." : "Connect Wallet"}
                        </button>
                    )}

                    <div className="h-4 w-px bg-zinc-800 mx-1"></div>

                    {/* Project Tools */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setProjectManagerOpen(true)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-[#1A1F26] rounded-lg transition-all"
                            title="Projects"
                        >
                            <FolderOpen size={16} />
                        </button>
                        <button
                            onClick={() => setPreviewOpen(true)}
                            disabled={blocks.length === 0}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-[#1A1F26] rounded-lg transition-all disabled:opacity-30"
                            title="Preview"
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            onClick={handleExportProject}
                            disabled={blocks.length === 0}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-[#1A1F26] rounded-lg transition-all disabled:opacity-30"
                            title="Export"
                        >
                            <Download size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => setDeployOpen(true)}
                        disabled={blocks.length === 0}
                        className="group relative px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <Play size={12} className="fill-current" />
                        <span>Deploy</span>
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 text-zinc-400 hover:text-white"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-16 mx-4 p-4 z-40 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-lg shadow-2xl lg:hidden flex flex-col gap-4"
                    >
                        <NetworkSwitcher />
                        <button
                            onClick={() => setDeployOpen(true)}
                            className="w-full py-3 bg-primary text-white rounded-lg font-bold"
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
