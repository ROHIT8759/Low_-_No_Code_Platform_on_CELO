"use client"

import { useBuilderStore } from "@/lib/store"
import { generateFrontendCode } from "@/lib/code-generator"
import { X } from "lucide-react"
import { useState } from "react"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const blocks = useBuilderStore((state) => state.blocks)
  const [iframeKey, setIframeKey] = useState(0)

  if (!isOpen) return null

  const frontendCode = generateFrontendCode(blocks)

  // Create a data URL for the iframe
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>dApp Preview</title>
    </head>
    <body>
      <div id="root"></div>
      <script>
        document.body.innerHTML = '<div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8"><div class="max-w-2xl mx-auto"><div class="bg-slate-800 rounded-lg border border-slate-700 p-8"><h1 class="text-3xl font-bold text-white mb-2">Generated dApp Preview</h1><p class="text-slate-400 mb-6">Built with Celo No-Code Builder</p><button class="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">Connect Celo Wallet</button></div></div></div>';
      </script>
    </body>
    </html>
  `

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">dApp Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors text-muted hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <iframe
            key={iframeKey}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="dApp Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="px-4 py-2 bg-background hover:bg-border rounded text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Refresh Preview
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-background rounded text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
