import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { Download, Play, Eye, FolderOpen, Wallet, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion";
import { PreviewModal } from "./preview-modal"
import { DeployModal } from "./deploy-modal"
import { ProjectManager } from "./project-manager"
import { NetworkSwitcher } from "./network-switcher"
import { connectStellarWallet, checkStellarConnection } from "@/lib/stellar/stellar-wallet"

export function BuilderNavbar() {
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
        checkWalletConnection()
    }, [])

    const checkWalletConnection = async () => {
        try {
            const status = await checkStellarConnection();
            if (status.isConnected && status.publicKey) {
                setWalletAddress(status.publicKey);
                setWalletChainId(0);
                await initializeUser(status.publicKey);
            }
        } catch (err) {
            console.error("Error checking Stellar wallet connection:", err)
        }
    }

    const connectWallet = async () => {
        setConnectingWallet(true)
        try {
            const status = await connectStellarWallet();
            if (status.isConnected && status.publicKey) {
                setWalletAddress(status.publicKey);
                setWalletChainId(0);
                await initializeUser(status.publicKey);
            } else {
                alert("Failed to connect Stellar wallet. Please ensure Freighter is installed and unlocked.");
            }
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

        
        saveProject()
    }

    return (
        <>
            <nav className="border-b border-white/[0.06] bg-[var(--surface-0)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 group cursor-pointer bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-white/[0.08] rounded-lg px-2 py-1 transition-colors">
                        <span className="text-primary font-bold">B</span>
                        <span className="text-sm font-semibold text-zinc-200">Block Builder</span>
                    </div>
                </div>

                {}
                <div className="hidden lg:flex items-center gap-4">
                    <NetworkSwitcher />

                    {}
                    {walletAddress ? (
                        <div className="flex items-center gap-2">
                            <div className="group relative px-3 py-1.5 bg-[var(--surface-2)]/70 border border-white/[0.08] rounded-lg text-zinc-300 text-xs font-medium flex items-center gap-2 hover:bg-[var(--surface-3)] cursor-default transition-all">
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
                            className="px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-zinc-300 rounded-lg text-xs font-medium transition-all border border-white/[0.08] flex items-center gap-2"
                        >
                            <Wallet size={14} />
                            {connectingWallet ? "Connecting..." : "Connect Wallet"}
                        </button>
                    )}

                        <div className="h-4 w-px bg-white/[0.08] mx-1"></div>

                    {}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setProjectManagerOpen(true)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-[var(--surface-2)] rounded-lg transition-all"
                            title="Projects"
                        >
                            <FolderOpen size={16} />
                        </button>
                        <button
                            onClick={() => setPreviewOpen(true)}
                            disabled={blocks.length === 0}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-[var(--surface-2)] rounded-lg transition-all disabled:opacity-30"
                            title="Preview"
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            onClick={handleExportProject}
                            disabled={blocks.length === 0}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-[var(--surface-2)] rounded-lg transition-all disabled:opacity-30"
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

                {}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 text-zinc-400 hover:text-white"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-16 mx-4 p-4 z-40 bg-[var(--surface-1)]/95 backdrop-blur-xl border border-white/[0.08] rounded-lg shadow-2xl lg:hidden flex flex-col gap-4"
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
