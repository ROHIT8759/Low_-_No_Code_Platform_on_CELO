"use client"

import type React from "react"

import { useBuilderStore } from "@/lib/store"
import { Trash2, Edit2, Plus, Upload, Download } from "lucide-react"
import { useState, useRef } from "react"

interface ProjectManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectManager({ isOpen, onClose }: ProjectManagerProps) {
  const projects = useBuilderStore((state) => state.projects)
  const currentProject = useBuilderStore((state) => state.currentProject)
  const loadProject = useBuilderStore((state) => state.loadProject)
  const deleteProject = useBuilderStore((state) => state.deleteProject)
  const renameProject = useBuilderStore((state) => state.renameProject)
  const createProject = useBuilderStore((state) => state.createProject)
  const importProject = useBuilderStore((state) => state.importProject)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [newProjectName, setNewProjectName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName)
      setNewProjectName("")
    }
  }

  const handleRename = (id: string, name: string) => {
    renameProject(id, name)
    setEditingId(null)
  }

  const handleExportProject = (id: string) => {
    const project = projects.find((p) => p.id === id)
    if (!project) return

    const element = document.createElement("a")
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2)),
    )
    element.setAttribute("download", `${project.name}.json`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target?.result as string)
        importProject(projectData)
      } catch (error) {
        alert("Failed to import project. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-semibold text-foreground">Project Manager</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Create New Project */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Create New Project</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary"
                onKeyPress={(e) => e.key === "Enter" && handleCreateProject()}
              />
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-background rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Create
              </button>
            </div>
          </div>

          {/* Import Project */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Import Project</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-background border-2 border-dashed border-border hover:border-primary rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-foreground hover:text-primary"
            >
              <Upload size={18} />
              Click to import project file
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportProject} className="hidden" />
          </div>

          {/* Projects List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Your Projects ({projects.length})</h3>

            {projects.length === 0 ? (
              <div className="p-8 text-center bg-background border border-border rounded-lg">
                <p className="text-muted">No projects yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      currentProject?.id === project.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {editingId === project.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleRename(project.id, editingName)}
                            onKeyPress={(e) => e.key === "Enter" && handleRename(project.id, editingName)}
                            autoFocus
                            className="px-2 py-1 bg-background border border-primary rounded text-foreground focus:outline-none"
                          />
                        ) : (
                          <div>
                            <p className="font-semibold text-foreground">{project.name}</p>
                            <p className="text-xs text-muted mt-1">
                              {project.blocks.length} blocks • Updated{" "}
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => loadProject(project.id)}
                          className="px-3 py-1 bg-primary hover:bg-primary-dark text-background rounded text-sm font-medium transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(project.id)
                            setEditingName(project.name)
                          }}
                          className="p-2 hover:bg-border rounded transition-colors text-muted hover:text-foreground"
                          title="Rename project"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleExportProject(project.id)}
                          className="p-2 hover:bg-border rounded transition-colors text-muted hover:text-foreground"
                          title="Export project"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${project.name}"?`)) {
                              deleteProject(project.id)
                            }
                          }}
                          className="p-2 hover:bg-border rounded transition-colors text-muted hover:text-destructive"
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
