"use client"

import type React from "react"

import { useBuilderStore, type Block } from "@/lib/store"
import { Trash2, Copy, Settings, Rocket } from "lucide-react"
import { useState } from "react"
import { DeployModal } from "./deploy-modal"

export function Canvas() {
  const blocks = useBuilderStore((state) => state.blocks)
  const removeBlock = useBuilderStore((state) => state.removeBlock)
  const selectBlock = useBuilderStore((state) => state.selectBlock)
  const updateBlock = useBuilderStore((state) => state.updateBlock)
  const selectedBlock = useBuilderStore((state) => state.selectedBlock)
  const [configOpen, setConfigOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const blockData = e.dataTransfer.getData("block")
    if (blockData) {
      const block = JSON.parse(blockData)
      useBuilderStore.getState().addBlock(block)
    }
  }

  const duplicateBlock = (block: Block) => {
    useBuilderStore.getState().addBlock(block)
  }

  return (
    <div className="flex-1 bg-background p-4 sm:p-6 md:p-8 overflow-auto flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1">
        <div className="flex items-center justify-between mb-4 sm:mb-6 animate-fade-in-down">
          <h2 className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-default">Canvas</h2>
          {blocks.length > 0 && (
            <span className="text-[10px] sm:text-xs bg-primary/20 text-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium animate-fade-in-up hover:scale-110 transition-transform cursor-default shadow-lg shadow-primary/20">
              {blocks.length} block{blocks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {blocks.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex items-center justify-center h-[500px] border-2 border-dashed border-border/50 rounded-2xl hover:border-primary/50 transition-all hover:bg-primary/5 group relative overflow-hidden animate-fade-in-up"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />
            <div className="text-center px-4 relative z-10">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/10 border border-primary/20">
                  <span className="text-4xl animate-bounce-subtle">📦</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Start Building</h3>
              <p className="text-muted text-base max-w-xs mx-auto mb-8">Drag components from the sidebar to assemble your smart contract.</p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-border/50 border border-border/50 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Waiting for input...
              </div>
            </div>
          </div>
        ) : (
          <div onDragOver={handleDragOver} onDrop={handleDrop} className="space-y-2 sm:space-y-3 pb-20 sm:pb-8">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                onClick={() => selectBlock(block)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group animate-fade-in-up relative overflow-hidden backdrop-blur-sm ${selectedBlock?.id === block.id
                  ? "border-primary bg-primary/10 shadow-2xl shadow-primary/20 scale-[1.02] ring-1 ring-primary/50"
                  : "border-white/10 bg-white/5 hover:border-primary/30 hover:bg-white/10 hover:scale-[1.01] hover:shadow-xl"
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Connection Line Visual */}
                {index < blocks.length - 1 && (
                  <div className="absolute left-6 bottom-0 w-0.5 h-4 bg-border/50 translate-y-full z-0" />
                )}
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-mono text-muted bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 rounded group-hover:bg-primary group-hover:text-background transition-all">{index + 1}</span>
                      <p className="font-medium text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">{block.label}</p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted mt-1 sm:mt-2 group-hover:text-muted-foreground transition-colors">Type: {block.type}</p>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateBlock(block)
                      }}
                      className="p-1.5 sm:p-2 hover:bg-background rounded-lg transition-all text-muted hover:text-foreground hover:scale-110"
                      title="Duplicate block"
                    >
                      <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfigOpen(!configOpen)
                      }}
                      className="p-1.5 sm:p-2 hover:bg-background rounded-lg transition-all text-muted hover:text-foreground hover:scale-110"
                      title="Configure block"
                    >
                      <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBlock(block.id)
                        selectBlock(null)
                      }}
                      className="p-1.5 sm:p-2 hover:bg-background rounded-lg transition-all text-muted hover:text-destructive hover:scale-110"
                      title="Delete block"
                    >
                      <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>

                {selectedBlock?.id === block.id && configOpen && (
                  <div className="mt-4 pt-4 border-t border-border animate-fade-in-up">
                    <p className="text-xs text-muted mb-3 font-semibold">Block Configuration</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Token name (optional)"
                        className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        onChange={(e) =>
                          updateBlock(block.id, {
                            config: { ...block.config, name: e.target.value },
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Symbol (optional)"
                        className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        onChange={(e) =>
                          updateBlock(block.id, {
                            config: { ...block.config, symbol: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Floating Deploy Button */}
        {blocks.length > 0 && (
          <button
            onClick={() => setDeployOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 bg-primary hover:bg-primary-dark text-background rounded-full shadow-2xl shadow-primary/50 hover:shadow-primary/70 flex items-center justify-center transition-all hover:scale-110 animate-bounce-slow z-40 group"
            title="Deploy your contract to Celo"
          >
            <Rocket size={24} className="sm:w-7 sm:h-7 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold animate-pulse shadow-lg shadow-cyan-500/50">
              !
            </span>
            <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
        )}
      </div>

      <DeployModal isOpen={deployOpen} onClose={() => setDeployOpen(false)} />
    </div>
  )
}
