"use client"

import { useEffect, useState } from "react"
import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { Navbar } from "@/components/navbar"
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

  // Initialize project on first load
  useEffect(() => {
    if (!hasInitialized && projects.length === 0) {
      createProject("My First dApp")
      setHasInitialized(true)
    }
  }, [hasInitialized, projects.length])

  // Sync projects when user logs in
  useEffect(() => {
    if (currentUser && !hasInitialized) {
      syncProjects().then(() => {
        // If no projects exist after sync, create a default one
        const state = useBuilderStore.getState()
        if (state.projects.length === 0) {
          createProject("My First dApp")
        }
        setHasInitialized(true)
      })
    }
  }, [currentUser])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Mobile: Horizontal scrollable blocks, Desktop: Sidebar */}
        <div className="md:hidden">
          <BlockSidebar />
        </div>
        <div className="hidden md:block">
          <BlockSidebar />
        </div>
        <Canvas />
        {/* CodeViewer hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <CodeViewer />
        </div>
      </div>
    </div>
  )
}
