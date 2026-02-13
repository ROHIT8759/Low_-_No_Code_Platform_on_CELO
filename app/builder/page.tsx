"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from "react"
import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { BuilderNavbar } from "@/components/builder-navbar"
import { BlockSidebar } from "@/components/block-sidebar"
import { CodeViewer } from "@/components/code-viewer"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { ToastProvider, useToast } from "@/components/toast"
import { Keyboard, X } from "lucide-react"

const Canvas = dynamic(() => import("@/components/canvas").then(mod => ({ default: mod.Canvas })), {
  loading: () => <div className="w-full h-full bg-[var(--surface-0)] flex items-center justify-center">
    <div className="text-zinc-500 text-sm font-mono">Loading canvas...</div>
  </div>,
  ssr: false
})

const ONBOARDING_KEY = "block-builder-onboarded"

function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { keys: ["Ctrl", "S"], desc: "Save project" },
    { keys: ["Ctrl", "Z"], desc: "Undo last block" },
    { keys: ["Ctrl", "Shift", "Z"], desc: "Redo (restore block)" },
    { keys: ["?"], desc: "Toggle shortcuts" },
    { keys: ["Scroll"], desc: "Pan canvas" },
    { keys: ["Ctrl", "Scroll"], desc: "Zoom in/out" },
    { keys: ["Click", "Drag"], desc: "Pan canvas" },
    { keys: ["Esc"], desc: "Close panel / Deselect" },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-[var(--surface-1)] border border-white/[0.08] rounded-lg p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-zinc-200">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface-2)] rounded text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
              <span className="text-[11px] text-zinc-400">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j}>
                    <kbd className="px-1.5 py-0.5 bg-[var(--surface-2)] border border-white/[0.08] rounded text-[10px] font-mono text-zinc-400">{k}</kbd>
                    {j < s.keys.length - 1 && <span className="text-zinc-700 mx-0.5">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BuilderContent() {
  const createProject = useBuilderStore((state) => state.createProject)
  const currentProject = useBuilderStore((state) => state.currentProject)
  const projects = useBuilderStore((state) => state.projects)
  const blocks = useBuilderStore((state) => state.blocks)
  const saveProject = useBuilderStore((state) => state.saveProject)
  const addBlock = useBuilderStore((state) => state.addBlock)
  const removeBlock = useBuilderStore((state) => state.removeBlock)
  const selectBlock = useBuilderStore((state) => state.selectBlock)
  const currentUser = useSupabaseStore((state) => state.user)
  const syncProjects = useSupabaseStore((state) => state.syncProjects)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { addToast } = useToast()

  // Undo stack: stores removed blocks so Ctrl+Z is non-destructive
  const undoStackRef = useRef<any[]>([])
  const lastSaveHashRef = useRef<string>("")

  const isInTextInput = () => {
    const el = document.activeElement
    if (!el) return false
    const tag = el.tagName
    return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+S — save (always intercept to prevent browser save dialog)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (!isInTextInput()) {
          saveProject()
          addToast("success", "Project saved")
        }
      }
      // Ctrl+Z — undo last block (skip when typing in inputs to preserve native undo)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (isInTextInput()) return // let native text undo work
        e.preventDefault()
        const currentBlocks = useBuilderStore.getState().blocks
        if (currentBlocks.length > 0) {
          const last = currentBlocks[currentBlocks.length - 1]
          undoStackRef.current.push(last)
          removeBlock(last.id)
          addToast("info", `Removed ${last.label} (Ctrl+Shift+Z to restore)`)
        }
      }
      // Ctrl+Shift+Z — redo (restore last undone block)
      if ((e.ctrlKey || e.metaKey) && e.key === "Z" && e.shiftKey) {
        if (isInTextInput()) return
        e.preventDefault()
        const restored = undoStackRef.current.pop()
        if (restored) {
          addBlock(restored)
          addToast("success", `Restored ${restored.label}`)
        }
      }
      // ? — shortcuts overlay
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        if (isInTextInput()) return
        setShowShortcuts(prev => !prev)
      }
      // Escape — close panels
      if (e.key === "Escape") {
        selectBlock(null)
        setShowShortcuts(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [saveProject, removeBlock, addBlock, selectBlock, addToast])

  // Auto-save every 30s — only when state has actually changed
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useBuilderStore.getState()
      if (!state.currentProject || state.blocks.length === 0) return
      const hash = JSON.stringify(state.blocks.map(b => b.id))
      if (hash !== lastSaveHashRef.current) {
        lastSaveHashRef.current = hash
        saveProject()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [saveProject])

  // Detect first visit
  useEffect(() => {
    const hasOnboarded = localStorage.getItem(ONBOARDING_KEY)
    if (!hasOnboarded && projects.length === 0 && blocks.length === 0) {
      setShowOnboarding(true)
    }
  }, [])

  useEffect(() => {
    if (!hasInitialized && projects.length === 0 && !showOnboarding) {
      createProject("My First dApp")
      setHasInitialized(true)
    }
  }, [hasInitialized, projects.length, showOnboarding])

  useEffect(() => {
    if (currentUser && !hasInitialized) {
      syncProjects().then(() => {
        const state = useBuilderStore.getState()
        if (state.projects.length === 0 && !showOnboarding) {
          createProject("My First dApp")
        }
        setHasInitialized(true)
      })
    }
  }, [currentUser])

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setShowOnboarding(false)
    setHasInitialized(true)
    addToast("success", "Welcome to Block Builder!")
  }

  const handleOnboardingDismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setShowOnboarding(false)
    if (projects.length === 0) {
      createProject("My First dApp")
    }
    setHasInitialized(true)
  }

  return (
    <div suppressHydrationWarning className="flex flex-col h-screen bg-[var(--surface-0)] overflow-hidden relative selection:bg-emerald-400/20 selection:text-emerald-100">
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onDismiss={handleOnboardingDismiss}
        />
      )}

      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}

      <div className="relative z-10 flex flex-col h-full">
        <BuilderNavbar />

        <div className="flex flex-1 overflow-hidden border-t border-white/[0.06]">
          <div className={`
            md:block w-[280px] h-full bg-[var(--surface-1)] border-r border-white/[0.06]
            md:relative absolute inset-y-0 left-0 z-20 transform transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <BlockSidebar />
          </div>

          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden fixed bottom-4 left-4 z-30 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 h-full bg-[var(--surface-0)] border-r border-white/[0.06] flex flex-col lg:flex-row">
            <div className="flex-1 overflow-auto">
              <Canvas />
            </div>

            <div className="lg:w-[400px] w-full h-64 lg:h-full bg-[var(--surface-1)] border-t lg:border-t-0 lg:border-l border-white/[0.06]">
              <CodeViewer />
            </div>
          </div>
        </div>

        {/* Shortcuts hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-1)]/80 border border-white/[0.08] rounded-full text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors backdrop-blur-sm"
          >
            <Keyboard className="w-3 h-3" />
            <span>Press <kbd className="font-mono text-zinc-500">?</kbd> for shortcuts</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <ToastProvider>
      <BuilderContent />
    </ToastProvider>
  )
}
