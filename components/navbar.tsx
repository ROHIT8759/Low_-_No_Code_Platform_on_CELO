"use client"

import { useBuilderStore } from "@/lib/store"
import { Download, Play, Eye, FolderOpen } from "lucide-react"
import { useState } from "react"
import { PreviewModal } from "./preview-modal"
import { DeployModal } from "./deploy-modal"
import { ProjectManager } from "./project-manager"

export function Navbar() {
  const currentProject = useBuilderStore((state) => state.currentProject)
  const blocks = useBuilderStore((state) => state.blocks)
  const saveProject = useBuilderStore((state) => state.saveProject)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [projectManagerOpen, setProjectManagerOpen] = useState(false)

  const handleExportProject = () => {
    if (!currentProject) return

    const projectData = {
      ...currentProject,
      blocks: blocks,
    }

    const element = document.createElement("a")
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2)),
    )
    element.setAttribute("download", `${currentProject.name}.json`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    // Save to store
    saveProject()
  }

  return (
    <>
      <nav className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Celo Builder</h1>
            <p className="text-xs text-muted">{currentProject?.name || "New Project"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setProjectManagerOpen(true)}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-colors text-foreground text-sm font-medium flex items-center gap-2"
            title="Manage projects"
          >
            <FolderOpen size={16} />
            Projects
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            disabled={blocks.length === 0}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-colors text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Preview the generated dApp"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={handleExportProject}
            disabled={blocks.length === 0}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary hover:bg-background/80 transition-colors text-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export project as JSON"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setDeployOpen(true)}
            disabled={blocks.length === 0}
            className="relative px-6 py-3 bg-primary hover:bg-primary-dark text-background rounded-lg transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 disabled:hover:scale-100 disabled:shadow-none animate-pulse-slow"
            title="Deploy to Celo testnet"
          >
            <Play size={18} className="animate-bounce-subtle" />
            <span>Deploy to Celo</span>
            {blocks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                ✓
              </span>
            )}
          </button>
        </div>
      </nav>

      <PreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
      <DeployModal isOpen={deployOpen} onClose={() => setDeployOpen(false)} />
      <ProjectManager isOpen={projectManagerOpen} onClose={() => setProjectManagerOpen(false)} />
    </>
  )
}
