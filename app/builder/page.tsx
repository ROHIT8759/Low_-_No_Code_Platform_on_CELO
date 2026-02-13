"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from "react"
import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { BuilderNavbar } from "@/components/builder-navbar"
import { BlockSidebar } from "@/components/block-sidebar"
import { CodeViewer } from "@/components/code-viewer"
import { OnboardingFlow } from "@/components/onboarding-flow"

const Canvas = dynamic(() => import("@/components/canvas").then(mod => ({ default: mod.Canvas })), {
  loading: () => <div className="w-full h-full bg-[#0B0F14] flex items-center justify-center">
    <div className="text-zinc-500 text-sm font-mono">Loading canvas...</div>
  </div>,
  ssr: false
})

const ONBOARDING_KEY = "block-builder-onboarded"

export default function BuilderPage() {
  const createProject = useBuilderStore((state) => state.createProject)
  const currentProject = useBuilderStore((state) => state.currentProject)
  const projects = useBuilderStore((state) => state.projects)
  const blocks = useBuilderStore((state) => state.blocks)
  const currentUser = useSupabaseStore((state) => state.user)
  const syncProjects = useSupabaseStore((state) => state.syncProjects)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

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
    <div className="flex flex-col h-screen bg-[#0B0F14] overflow-hidden relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onDismiss={handleOnboardingDismiss}
        />
      )}

      <div className="relative z-10 flex flex-col h-full">
        <BuilderNavbar />
        
        <div className="flex flex-1 overflow-hidden border-t border-white/[0.06]">
          <div className={`
            md:block w-[280px] h-full bg-[#090C10] border-r border-white/[0.06]
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

          <div className="flex-1 h-full bg-[#0B0F14] border-r border-white/[0.06] flex flex-col lg:flex-row">
            <div className="flex-1 overflow-auto">
              <Canvas />
            </div>

            <div className="lg:w-[400px] w-full h-64 lg:h-full bg-[#11151A] border-t lg:border-t-0 lg:border-l border-white/[0.06]">
              <CodeViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
