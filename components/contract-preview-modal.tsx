"use client"

import { X } from "lucide-react"

interface ContractPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  contract: {
    contractAddress: string
    contractName: string
    network: string
    networkName: string
  }
  walletAddress?: string | null
}

export function ContractPreviewModal({ isOpen, onClose }: ContractPreviewModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
      <div className="bg-[var(--surface-0)] rounded-lg border border-white/[0.08] w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-200">Feature Unavailable</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-zinc-200 font-medium mb-2">EVM Preview Deprecated</h3>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">
            Contract preview for EVM contracts is no longer supported. This platform is now Stellar-only.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
