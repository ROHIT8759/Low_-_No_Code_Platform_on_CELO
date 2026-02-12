"use client"

import { useEffect, useState } from "react"
import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { BuilderNavbar } from "@/components/builder-navbar"
import { BlockSidebar } from "@/components/block-sidebar"
import { Canvas } from "@/components/canvas"
import { CodeViewer } from "@/components/code-viewer"

export default function BuilderPage() {
  const createProject = useBuilderStore((state) => state.createProject)
  const currentProject = useBuilderStore((state) => state.currentProject)
  const projects = useBuilderStore((state) => state.projects)
  const currentUser = useSupabaseStore((state) => state.user)
  const syncProjects = useSupabaseStore((state) => state.syncProjects)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    if (!hasInitialized && projects.length === 0) {
      createProject("My First dApp")
      setHasInitialized(true)
    }
  }, [hasInitialized, projects.length])

  useEffect(() => {
    if (currentUser && !hasInitialized) {
      syncProjects().then(() => {
        const state = useBuilderStore.getState()
        if (state.projects.length === 0) {
          createProject("My First dApp")
        }
        setHasInitialized(true)
      })
    }
  }, [currentUser])

  return (
    <div className="flex flex-col h-screen bg-[#0B0F14] overflow-hidden relative selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="relative z-10 flex flex-col h-full">
        <BuilderNavbar />
        
        {/* Three-column layout with surface zoning */}
        <div className="flex flex-1 overflow-hidden border-t border-white/[0.06]">
          {/* Sidebar Zone - 280px, Surface #090C10 */}
          <div className="hidden md:block w-[280px] h-full bg-[#090C10] border-r border-white/[0.06]">
            <BlockSidebar />
          </div>

          {/* Canvas Zone - flex-1, Surface #0B0F14 */}
          <div className="flex-1 h-full bg-[#0B0F14] border-r border-white/[0.06]">
            <Canvas />
          </div>

          {/* Code Viewer Zone - 400px, Surface #11151A */}
          <div className="hidden lg:block w-[400px] h-full bg-[#11151A]">
            <CodeViewer />
          </div>
        </div>

        {/* Mobile: Show sidebar in overlay or stacked layout */}
        <div className="md:hidden">
          <BlockSidebar />
        </div>
      </div>
    </div>
  )
}
