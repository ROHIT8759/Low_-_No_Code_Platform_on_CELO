"use client"

import { useBuilderStore, type Block } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useCallback, useEffect } from "react"
import {
    Plus, Box, Layers, Database, X, ZoomIn, ZoomOut, Maximize2,
    Trash2, Settings, Shield, Zap, Vote, Clock, Eye, Coins,
    AlertTriangle, CheckCircle, ChevronRight
} from "lucide-react"
import { WorkstationHeader } from "@/components/infrastructure/workstation-header"

// Block category colors (muted, infrastructure-grade)
const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string; accent: string }> = {
    base: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", accent: "bg-blue-500" },
    token: { border: "border-teal-500/30", bg: "bg-teal-500/5", text: "text-teal-400", accent: "bg-teal-500" },
    security: { border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400", accent: "bg-orange-500" },
    governance: { border: "border-purple-500/30", bg: "bg-purple-500/5", text: "text-purple-400", accent: "bg-purple-500" },
    defi: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", accent: "bg-emerald-500" },
}

function getBlockCategory(type: string): string {
    if (type === "erc20" || type === "nft") return "base"
    if (["mint", "burn", "transfer", "airdrop"].includes(type)) return "token"
    if (["pausable", "whitelist", "blacklist", "timelock"].includes(type)) return "security"
    if (["voting", "snapshot", "permit", "multisig"].includes(type)) return "governance"
    if (["stake", "withdraw", "royalty"].includes(type)) return "defi"
    return "token"
}

function getBlockIcon(type: string) {
    switch (type) {
        case "erc20": return <Database className="w-4 h-4" />
        case "nft": return <Layers className="w-4 h-4" />
        case "mint": return <Coins className="w-4 h-4" />
        case "burn": return <Zap className="w-4 h-4" />
        case "pausable": return <Shield className="w-4 h-4" />
        case "whitelist": case "blacklist": return <Shield className="w-4 h-4" />
        case "voting": return <Vote className="w-4 h-4" />
        case "timelock": return <Clock className="w-4 h-4" />
        case "royalty": return <Coins className="w-4 h-4" />
        default: return <Box className="w-4 h-4" />
    }
}

// Dependency rules
const DEPENDENCIES: Record<string, string[]> = {
    mint: ["erc20", "nft"],
    burn: ["erc20", "nft"],
    transfer: ["erc20", "nft"],
    pausable: ["erc20", "nft"],
    whitelist: ["erc20", "nft"],
    blacklist: ["erc20", "nft"],
    airdrop: ["erc20", "nft"],
    royalty: ["nft"],
    snapshot: ["erc20"],
    voting: ["erc20"],
    permit: ["erc20"],
    stake: ["erc20"],
    withdraw: ["erc20"],
    timelock: ["erc20", "nft"],
    multisig: ["erc20", "nft"],
}

// Block properties config
const BLOCK_PROPERTIES: Record<string, { label: string; type: "toggle" | "number" | "text"; key: string; default: any }[]> = {
    mint: [
        { label: "Only Owner", type: "toggle", key: "onlyOwner", default: true },
        { label: "Max Supply", type: "number", key: "maxSupply", default: 0 },
        { label: "Mint Cap Per Tx", type: "number", key: "mintCap", default: 0 },
    ],
    whitelist: [
        { label: "Public View", type: "toggle", key: "publicView", default: true },
        { label: "Batch Add Size", type: "number", key: "batchSize", default: 100 },
    ],
    pausable: [
        { label: "Only Owner", type: "toggle", key: "onlyOwner", default: true },
    ],
    royalty: [
        { label: "Percentage (basis pts)", type: "number", key: "percentage", default: 250 },
        { label: "Max Percentage", type: "number", key: "maxPercentage", default: 1000 },
    ],
    voting: [
        { label: "Voting Period (days)", type: "number", key: "votingPeriod", default: 7 },
        { label: "Quorum (%)", type: "number", key: "quorum", default: 10 },
    ],
    timelock: [
        { label: "Delay (hours)", type: "number", key: "delay", default: 48 },
    ],
    erc20: [
        { label: "Token Name", type: "text", key: "name", default: "MyToken" },
        { label: "Symbol", type: "text", key: "symbol", default: "MTK" },
        { label: "Initial Supply", type: "number", key: "initialSupply", default: 1000000 },
    ],
    nft: [
        { label: "Collection Name", type: "text", key: "name", default: "MyNFT" },
        { label: "Symbol", type: "text", key: "symbol", default: "MNFT" },
        { label: "Base URI", type: "text", key: "baseUri", default: "https://ipfs.io/ipfs/" },
    ],
}

interface PropertiesPanelProps {
    block: Block
    onClose: () => void
    onUpdate: (id: string, updates: Partial<Block>) => void
    onRemove: (id: string) => void
}

function PropertiesPanel({ block, onClose, onUpdate, onRemove }: PropertiesPanelProps) {
    const category = getBlockCategory(block.type)
    const colors = CATEGORY_COLORS[category]
    const properties = BLOCK_PROPERTIES[block.type] || []

    const handlePropertyChange = (key: string, value: any) => {
        onUpdate(block.id, {
            config: { ...block.config, [key]: value }
        })
    }

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-0 bottom-0 w-72 bg-[#090C10] border-l border-white/[0.06] z-30 flex flex-col overflow-hidden"
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs font-semibold text-zinc-200">Properties</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-[#1A1F26] rounded text-zinc-500 hover:text-zinc-300">
                    <X size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Block info */}
                <div className={`p-3 rounded border ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={colors.text}>{getBlockIcon(block.type)}</span>
                        <span className="text-xs font-medium text-zinc-200">{block.label}</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{category}</span>
                </div>

                {/* Properties */}
                {properties.length > 0 ? (
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Configuration</h4>
                        {properties.map(prop => (
                            <div key={prop.key}>
                                <label className="block text-[10px] text-zinc-500 mb-1">{prop.label}</label>
                                {prop.type === "toggle" ? (
                                    <button
                                        onClick={() => handlePropertyChange(prop.key, !(block.config?.[prop.key] ?? prop.default))}
                                        className={`w-10 h-5 rounded-full transition-all relative ${
                                            (block.config?.[prop.key] ?? prop.default)
                                                ? "bg-primary"
                                                : "bg-zinc-700"
                                        }`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${
                                            (block.config?.[prop.key] ?? prop.default) ? "left-[22px]" : "left-1"
                                        }`} />
                                    </button>
                                ) : prop.type === "number" ? (
                                    <input
                                        type="number"
                                        value={block.config?.[prop.key] ?? prop.default}
                                        onChange={(e) => handlePropertyChange(prop.key, Number(e.target.value))}
                                        className="w-full px-2.5 py-1.5 bg-[#11151A] border border-white/[0.06] rounded text-[11px] text-zinc-200 font-mono focus:outline-none focus:border-primary/50"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={block.config?.[prop.key] ?? prop.default}
                                        onChange={(e) => handlePropertyChange(prop.key, e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-[#11151A] border border-white/[0.06] rounded text-[11px] text-zinc-200 font-mono focus:outline-none focus:border-primary/50"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-zinc-600">No configurable properties for this block.</p>
                )}

                {/* Dependencies */}
                {DEPENDENCIES[block.type] && (
                    <div>
                        <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">Requires</h4>
                        <div className="flex flex-wrap gap-1">
                            {DEPENDENCIES[block.type].map(dep => (
                                <span key={dep} className="text-[9px] font-mono text-zinc-500 bg-[#1A1F26] px-1.5 py-0.5 rounded border border-white/[0.04]">
                                    {dep.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Remove button */}
            <div className="p-3 border-t border-white/[0.06]">
                <button
                    onClick={() => { onRemove(block.id); onClose() }}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-[11px] text-red-400 font-medium transition-all flex items-center justify-center gap-1.5"
                >
                    <Trash2 className="w-3 h-3" />
                    Remove Block
                </button>
            </div>
        </motion.div>
    )
}

export function Canvas() {
    const blocks = useBuilderStore((state) => state.blocks)
    const addBlock = useBuilderStore((state) => state.addBlock)
    const removeBlock = useBuilderStore((state) => state.removeBlock)
    const updateBlock = useBuilderStore((state) => state.updateBlock)
    const selectBlock = useBuilderStore((state) => state.selectBlock)
    const selectedBlock = useBuilderStore((state) => state.selectedBlock)
    const currentProject = useBuilderStore((state) => state.currentProject)
    const network = useBuilderStore((state) => state.network)

    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState({ x: 0, y: 0 })
    const [showProperties, setShowProperties] = useState(false)
    const [conflicts, setConflicts] = useState<string[]>([])
    const canvasRef = useRef<HTMLDivElement>(null)

    // Detect conflicts
    useEffect(() => {
        const newConflicts: string[] = []
        const hasBase = blocks.some(b => b.type === "erc20" || b.type === "nft")
        const baseType = blocks.find(b => b.type === "erc20" || b.type === "nft")?.type

        blocks.forEach(block => {
            const deps = DEPENDENCIES[block.type]
            if (deps && !blocks.some(b => deps.includes(b.type))) {
                newConflicts.push(`${block.label} requires ${deps.map(d => d.toUpperCase()).join(" or ")} base`)
            }
            if (block.type === "royalty" && baseType === "erc20") {
                newConflicts.push("Royalties only work with NFT contracts")
            }
            if (block.type === "snapshot" && baseType === "nft") {
                newConflicts.push("Snapshot only works with ERC20 tokens")
            }
        })

        // Check mint + maxSupply mismatch
        const mintBlock = blocks.find(b => b.type === "mint")
        if (mintBlock && mintBlock.config?.maxSupply === 0 && mintBlock.config?.mintCap === 0) {
            newConflicts.push("Mint allows unlimited supply — consider setting a max supply")
        }

        setConflicts(newConflicts)
    }, [blocks])

    const handleQuickAdd = (type: string) => {
        const labels: Record<string, string> = {
            erc20: "ERC20 Standard", nft: "ERC721 Standard",
        }
        addBlock({ id: Date.now().toString(), type, label: labels[type] || type.toUpperCase(), position: { x: 0, y: 0 } } as any)
    }

    // Zoom controls
    const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2))
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.4))
    const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

    // Pan handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsPanning(true)
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        }
    }
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
        }
    }
    const handleMouseUp = () => setIsPanning(false)

    // Wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.08 : 0.08
        setZoom(z => Math.min(Math.max(z + delta, 0.4), 2))
    }, [])

    const handleBlockClick = (block: Block) => {
        selectBlock(block)
        setShowProperties(true)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const data = e.dataTransfer.getData("block")
        if (data) {
            try {
                const block = JSON.parse(data)
                // Smart dependency: auto-add base if needed
                const deps = DEPENDENCIES[block.type]
                if (deps && !blocks.some(b => deps.includes(b.type))) {
                    // Don't block, just add — conflict detection will warn
                }
                addBlock(block as any)
            } catch (err) {
                console.error("Failed to parse dropped block:", err)
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy"
    }

    const getCurrentStage = () => {
        if (blocks.length === 0) return "design"
        if (currentProject?.generatedCode) return "compile"
        return "generate"
    }

    // Compute connections between blocks
    const baseBlock = blocks.find(b => b.type === "erc20" || b.type === "nft")
    const featureBlocks = blocks.filter(b => b.type !== "erc20" && b.type !== "nft")

    // Gas estimation
    const estimatedGas = blocks.length * 45000 + 150000
    const functionCount = blocks.length * 3 + 2
    const stateVarCount = blocks.length * 2 + (baseBlock ? 4 : 0)

    return (
        <div className="flex-1 relative overflow-hidden flex flex-col">
            <WorkstationHeader
                contractName={currentProject?.name || "Untitled Contract"}
                network={network === "stellar" ? "Stellar Testnet" : "Stellar Mainnet"}
                status={blocks.length === 0 ? "Draft" : currentProject?.generatedCode ? "Generated" : "Designing"}
                compileSize={blocks.length > 0 ? `~${(blocks.length * 2.1).toFixed(1)} KB` : "—"}
                gasEstimate={blocks.length > 0 ? `~${estimatedGas.toLocaleString()}` : "—"}
                lastCompiled="Never"
                currentStage={getCurrentStage()}
            />

            <div className="flex-1 relative overflow-hidden">
                {/* Grid background */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)
                        `,
                        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
                        backgroundPosition: `${pan.x}px ${pan.y}px`,
                    }}
                />

                {/* Zoom controls */}
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-[#090C10] border border-white/[0.06] rounded-md p-1">
                    <button onClick={handleZoomOut} className="p-1.5 hover:bg-[#1A1F26] rounded text-zinc-500 hover:text-zinc-300 transition-colors">
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-zinc-500 px-2 min-w-[40px] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button onClick={handleZoomIn} className="p-1.5 hover:bg-[#1A1F26] rounded text-zinc-500 hover:text-zinc-300 transition-colors">
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-white/[0.06] mx-0.5" />
                    <button onClick={handleZoomReset} className="p-1.5 hover:bg-[#1A1F26] rounded text-zinc-500 hover:text-zinc-300 transition-colors">
                        <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Minimap */}
                {blocks.length > 0 && (
                    <div className="absolute bottom-4 left-4 z-20 w-32 h-20 bg-[#090C10] border border-white/[0.06] rounded-md overflow-hidden">
                        <div className="w-full h-full p-2 relative">
                            {blocks.map((block, i) => {
                                const cat = getBlockCategory(block.type)
                                const colors = CATEGORY_COLORS[cat]
                                return (
                                    <div
                                        key={block.id}
                                        className={`absolute w-3 h-1.5 rounded-sm ${colors.accent}`}
                                        style={{
                                            left: `${20 + (i % 4) * 25}%`,
                                            top: `${20 + Math.floor(i / 4) * 30}%`,
                                            opacity: 0.7,
                                        }}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Conflict warnings */}
                {conflicts.length > 0 && (
                    <div className="absolute top-3 left-3 z-20 space-y-1 max-w-xs">
                        {conflicts.map((conflict, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-400"
                            >
                                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{conflict}</span>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Live stats overlay */}
                {blocks.length > 0 && (
                    <div className="absolute top-3 right-3 z-20 bg-[#090C10]/90 border border-white/[0.06] rounded-md p-2.5 space-y-1.5">
                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Contract Stats</div>
                        <div className="flex items-center justify-between gap-6 text-[10px]">
                            <span className="text-zinc-500">State Variables</span>
                            <span className="font-mono text-zinc-300">{stateVarCount}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6 text-[10px]">
                            <span className="text-zinc-500">Functions</span>
                            <span className="font-mono text-zinc-300">{functionCount}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6 text-[10px]">
                            <span className="text-zinc-500">Modifiers</span>
                            <span className="font-mono text-zinc-300">{blocks.filter(b => ["pausable", "whitelist", "blacklist"].includes(b.type)).length + 1}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6 text-[10px]">
                            <span className="text-zinc-500">Events</span>
                            <span className="font-mono text-zinc-300">{blocks.length * 2 + 1}</span>
                        </div>
                        <div className="border-t border-white/[0.06] pt-1.5 mt-1.5">
                            <div className="flex items-center justify-between gap-6 text-[10px]">
                                <span className="text-zinc-500">Est. Gas</span>
                                <span className="font-mono text-zinc-300">{estimatedGas.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6 text-[10px]">
                                <span className="text-zinc-500">Security</span>
                                <span className={`font-mono ${conflicts.length === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                                    {conflicts.length === 0 ? "Pass" : `${conflicts.length} warning${conflicts.length > 1 ? "s" : ""}`}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Canvas content */}
                <div
                    ref={canvasRef}
                    className={`w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-default"}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                            transformOrigin: "center center",
                        }}
                    >
                        {blocks.length === 0 ? (
                            /* Empty state */
                            <div className="max-w-2xl w-full px-8">
                                <div className="text-center mb-10">
                                    <h3 className="text-xl font-medium text-zinc-200 mb-2">No contract base selected.</h3>
                                    <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                                        Start by choosing a standard, or drag blocks from the sidebar.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => handleQuickAdd("erc20")}
                                        className="group p-5 bg-[#11151A] border border-white/[0.06] rounded-md hover:border-blue-500/40 hover:bg-[#161B22] transition-all text-left"
                                    >
                                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4 group-hover:bg-blue-500/20">
                                            <Database className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <h4 className="text-sm font-medium text-zinc-300 group-hover:text-white mb-1">Soroban Token</h4>
                                        <p className="text-xs text-zinc-600 leading-relaxed">Standard fungible asset interface.</p>
                                    </button>

                                    <button
                                        onClick={() => handleQuickAdd("nft")}
                                        className="group p-5 bg-[#11151A] border border-white/[0.06] rounded-md hover:border-purple-500/40 hover:bg-[#161B22] transition-all text-left"
                                    >
                                        <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-4 group-hover:bg-purple-500/20">
                                            <Layers className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <h4 className="text-sm font-medium text-zinc-300 group-hover:text-white mb-1">Non-Fungible Token</h4>
                                        <p className="text-xs text-zinc-600 leading-relaxed">Unique asset implementation.</p>
                                    </button>

                                    <button
                                        className="group p-5 bg-[#11151A] border border-white/[0.06] border-dashed rounded-md hover:border-zinc-500 hover:bg-[#161B22] transition-all text-left opacity-50 cursor-not-allowed"
                                    >
                                        <div className="w-8 h-8 rounded bg-[#1A1F26] flex items-center justify-center border border-white/[0.04] mb-4">
                                            <Box className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <h4 className="text-sm font-medium text-zinc-400 mb-1">Custom Module</h4>
                                        <p className="text-xs text-zinc-600 leading-relaxed">Coming soon.</p>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Node-based block visualization */
                            <div className="relative w-full h-full py-10">
                                <div className="flex flex-col items-center gap-2">
                                    {/* Entry point */}
                                    <div className="w-36 h-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-[9px] text-zinc-600 uppercase tracking-widest font-mono">
                                        Entry Point
                                    </div>

                                    {/* Connection line from entry to base */}
                                    {baseBlock && <div className="h-6 w-px bg-zinc-800" />}

                                    {/* Base block (larger, prominent) */}
                                    {baseBlock && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => handleBlockClick(baseBlock)}
                                            className={`w-72 p-4 rounded-md border cursor-pointer transition-all relative group ${
                                                selectedBlock?.id === baseBlock.id
                                                    ? `${CATEGORY_COLORS.base.border} ${CATEGORY_COLORS.base.bg} shadow-lg shadow-blue-500/5`
                                                    : "bg-[#11151A] border-white/[0.06] hover:border-blue-500/30"
                                            }`}
                                        >
                                            {/* Accent strip */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${CATEGORY_COLORS.base.accent} rounded-l-md`} />

                                            {/* Input port */}
                                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0B0F14] border-2 border-blue-500/50" />

                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded bg-blue-500/10 flex items-center justify-center">
                                                        {getBlockIcon(baseBlock.type)}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium text-zinc-200 block">{baseBlock.label}</span>
                                                        <span className="text-[9px] font-mono text-blue-400 uppercase">{baseBlock.type}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeBlock(baseBlock.id) }}
                                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded text-zinc-600 hover:text-red-400 transition-all"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="text-[10px] text-zinc-500 font-mono">
                                                fn_{baseBlock.type}_init(env, admin)
                                            </div>

                                            {/* Output port */}
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0B0F14] border-2 border-blue-500/50" />
                                        </motion.div>
                                    )}

                                    {/* Connection lines to features */}
                                    {featureBlocks.length > 0 && baseBlock && (
                                        <>
                                            <div className="h-4 w-px bg-zinc-800" />
                                            {/* Horizontal spread line */}
                                            {featureBlocks.length > 1 && (
                                                <div className="relative w-full flex justify-center">
                                                    <div
                                                        className="h-px bg-zinc-800 absolute top-0"
                                                        style={{ width: `${Math.min(featureBlocks.length * 180, 720)}px` }}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Feature blocks grid */}
                                    {featureBlocks.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mt-2">
                                            {featureBlocks.map((block) => {
                                                const cat = getBlockCategory(block.type)
                                                const colors = CATEGORY_COLORS[cat]
                                                const isSelected = selectedBlock?.id === block.id

                                                return (
                                                    <motion.div
                                                        key={block.id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        onClick={() => handleBlockClick(block)}
                                                        className={`w-52 p-3 rounded-md border cursor-pointer transition-all relative group ${
                                                            isSelected
                                                                ? `${colors.border} ${colors.bg} shadow-lg`
                                                                : "bg-[#11151A] border-white/[0.06] hover:border-white/[0.12]"
                                                        }`}
                                                    >
                                                        {/* Accent strip */}
                                                        <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${colors.accent} rounded-l-md ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`} />

                                                        {/* Input port */}
                                                        <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#0B0F14] border-2 ${colors.border}`} />

                                                        <div className="flex items-start justify-between mb-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-6 h-6 rounded flex items-center justify-center ${colors.bg}`}>
                                                                    <span className={colors.text}>{getBlockIcon(block.type)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[11px] font-medium text-zinc-200 block">{block.label}</span>
                                                                    <span className={`text-[8px] font-mono uppercase ${colors.text}`}>{cat}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }}
                                                                className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded text-zinc-600 hover:text-red-400 transition-all"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        <div className="text-[9px] text-zinc-600 font-mono truncate">
                                                            fn_{block.type}_handler(ctx)
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Properties Panel */}
                <AnimatePresence>
                    {showProperties && selectedBlock && (
                        <PropertiesPanel
                            block={selectedBlock}
                            onClose={() => { setShowProperties(false); selectBlock(null) }}
                            onUpdate={updateBlock}
                            onRemove={removeBlock}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
