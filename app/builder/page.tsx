"use client"

import { useEffect } from "react"
import { useBuilderStore } from "@/lib/store"
import { Navbar } from "@/components/navbar"
import { BlockSidebar } from "@/components/block-sidebar"
import { Canvas } from "@/components/canvas"
import { CodeViewer } from "@/components/code-viewer"

export default function BuilderPage() {
  const createProject = useBuilderStore((state) => state.createProject)

  useEffect(() => {
    createProject("My First dApp")
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <BlockSidebar />
        <Canvas />
        <CodeViewer />
      </div>
    </div>
  )
}
