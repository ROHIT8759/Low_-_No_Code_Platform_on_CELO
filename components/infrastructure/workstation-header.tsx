"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, Circle, Clock, Pencil, Save, Blocks, Cpu, Flame, Globe } from "lucide-react";

interface PipelineStage {
  id: string;
  label: string;
  status: "complete" | "active" | "pending";
}

interface WorkstationHeaderProps {
  contractName?: string;
  network?: string;
  status?: string;
  compileSize?: string;
  gasEstimate?: string;
  lastCompiled?: string;
  blockCount?: number;
  currentStage?: "design" | "generate" | "compile" | "deploy";
  onRename?: (name: string) => void;
}

export function WorkstationHeader({
  contractName = "Untitled Contract",
  network = "Stellar Testnet",
  status = "Draft",
  compileSize = "—",
  gasEstimate = "—",
  lastCompiled = "Never",
  blockCount = 0,
  currentStage = "design",
  onRename,
}: WorkstationHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(contractName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(contractName);
  }, [contractName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== contractName && onRename) {
      onRename(trimmed);
    } else {
      setEditValue(contractName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setEditValue(contractName); setIsEditing(false); }
  };

  const stages: PipelineStage[] = [
    { id: "design", label: "Design", status: "pending" },
    { id: "generate", label: "Generate", status: "pending" },
    { id: "compile", label: "Compile", status: "pending" },
    { id: "deploy", label: "Deploy", status: "pending" },
  ];

  const stageOrder = ["design", "generate", "compile", "deploy"];
  const currentIndex = stageOrder.indexOf(currentStage);

  stages.forEach((stage, index) => {
    if (index < currentIndex) stage.status = "complete";
    else if (index === currentIndex) stage.status = "active";
    else stage.status = "pending";
  });

  const getStageIcon = (stageStatus: string) => {
    switch (stageStatus) {
      case "complete":
        return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case "active":
        return <Circle className="w-3 h-3 text-primary fill-primary" />;
      default:
        return <Circle className="w-3 h-3 text-zinc-700" />;
    }
  };

  const statusColor = status === "Generated" || status === "Compiled"
    ? "bg-emerald-500"
    : status === "Deployed"
    ? "bg-blue-500"
    : status === "Designing"
    ? "bg-amber-500 animate-pulse"
    : "bg-zinc-600";

  return (
    <div className="w-full border-b border-white/[0.08] bg-[var(--surface-0)]">
      {/* Pipeline stages */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-1">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all duration-200 ${
                  stage.status === "active"
                    ? "bg-primary/10 border border-primary/30"
                    : stage.status === "complete"
                    ? "bg-emerald-500/5 border border-emerald-500/10"
                    : "border border-transparent"
                }`}
              >
                {getStageIcon(stage.status)}
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    stage.status === "active"
                      ? "text-primary"
                      : stage.status === "complete"
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`w-5 h-px mx-0.5 transition-colors ${
                    index < currentIndex ? "bg-emerald-500/30" : "bg-white/[0.08]"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right side: quick stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <Blocks className="w-3 h-3 text-zinc-600" />
            <span>{blockCount} blocks</span>
          </div>
          <div className="h-3 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <Globe className="w-3 h-3 text-zinc-600" />
            <span>{network}</span>
          </div>
        </div>
      </div>

      {/* Contract info bar */}
      <div className="h-9 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Editable contract name */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
              Contract:
            </span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="bg-[var(--surface-2)] border border-primary/40 rounded px-2 py-0.5 text-xs text-white font-medium focus:outline-none focus:border-primary w-40"
                  maxLength={40}
                />
                <button
                  onClick={handleSave}
                  className="p-0.5 text-primary hover:text-white transition-colors"
                >
                  <Save className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="group flex items-center gap-1.5 hover:bg-[var(--surface-2)] rounded px-1.5 py-0.5 -ml-1.5 transition-colors"
              >
                <span className="text-xs text-primary font-medium">
                  {contractName}
                </span>
                <Pencil className="w-2.5 h-2.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          <div className="h-3 w-px bg-white/[0.08]" />

          {/* Status badge */}
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {status}
            </span>
          </div>
        </div>

        {/* Compile metadata */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-zinc-700" />
            <span className="text-[10px] text-zinc-500 font-mono">{compileSize}</span>
          </div>
          <div className="h-3 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-zinc-700" />
            <span className="text-[10px] text-zinc-500 font-mono">{gasEstimate}</span>
          </div>
          <div className="h-3 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-zinc-700" />
            <span className="text-[10px] text-zinc-500 font-mono">{lastCompiled}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
