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
    <div className="flex-1 bg-background p-8 overflow-auto flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1">
        <div className="flex items-center justify-between mb-6 animate-fade-in-down">
          <h2 className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-default">Canvas</h2>
          {blocks.length > 0 && (
            <span className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-full font-medium animate-fade-in-up hover:scale-110 transition-transform cursor-default shadow-lg shadow-primary/20">
              {blocks.length} block{blocks.length !== 1 ? "s" : ""} added
            </span>
          )}
        </div>

        {blocks.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex items-center justify-center h-96 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-all hover:bg-primary/5 hover:scale-[1.02] animate-fade-in-up"
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 border-4 border-dashed border-primary/30 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-3xl">📦</span>
                </div>
              </div>
              <p className="text-muted mb-2 text-lg font-medium">Drag blocks here to start building</p>
              <p className="text-xs text-muted/60">Your canvas is empty - add blocks from the sidebar</p>
            </div>
          </div>
        ) : (
          <div onDragOver={handleDragOver} onDrop={handleDrop} className="space-y-3 pb-8">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                onClick={() => selectBlock(block)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer group animate-fade-in-up ${selectedBlock?.id === block.id
                  ? "border-primary bg-primary/10 shadow-xl shadow-primary/30 scale-[1.02]"
                  : "border-border bg-card hover:border-primary/50 hover:bg-card/80 hover:scale-[1.01] hover:shadow-lg"
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted bg-background px-2 py-1 rounded group-hover:bg-primary group-hover:text-background transition-all">{index + 1}</span>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{block.label}</p>
                    </div>
                    <p className="text-xs text-muted mt-2 group-hover:text-muted-foreground transition-colors">Type: {block.type}</p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateBlock(block)
                      }}
                      className="p-2 hover:bg-background rounded-lg transition-all text-muted hover:text-foreground hover:scale-110 hover:rotate-6"
                      title="Duplicate block"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfigOpen(!configOpen)
                      }}
                      className="p-2 hover:bg-background rounded-lg transition-all text-muted hover:text-foreground hover:scale-110 hover:rotate-6"
                      title="Configure block"
                    >
                      <Settings size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBlock(block.id)
                        selectBlock(null)
                      }}
                      className="p-2 hover:bg-background rounded-lg transition-all text-muted hover:text-destructive hover:scale-110 hover:rotate-12"
                      title="Delete block"
                    >
                      <Trash2 size={18} />
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
            className="fixed bottom-8 right-8 w-16 h-16 bg-primary hover:bg-primary-dark text-background rounded-full shadow-2xl shadow-primary/50 hover:shadow-primary/70 flex items-center justify-center transition-all hover:scale-110 animate-bounce-slow z-40 group"
            title="Deploy your contract to Celo"
          >
            <Rocket size={28} className="group-hover:rotate-12 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse shadow-lg shadow-cyan-500/50">
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
