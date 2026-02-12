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

      {}
      <div className="relative z-10 flex flex-col h-full">
        <BuilderNavbar />
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row border-t border-[#222730]">
          {}
          <div className="md:hidden">
            <BlockSidebar />
          </div>
          <div className="hidden md:block h-full">
            <BlockSidebar />
          </div>

          <Canvas />

          {}
          <div className="hidden lg:block h-full">
            <CodeViewer />
          </div>
        </div>
      </div>
    </div>
  )
}
