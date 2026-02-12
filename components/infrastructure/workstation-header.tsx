"use client";

import React from "react";
import { CheckCircle2, Circle, Clock, Rocket } from "lucide-react";

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
  currentStage?: "design" | "generate" | "compile" | "deploy";
}

export function WorkstationHeader({
  contractName = "Untitled Contract",
  network = "Stellar Testnet",
  status = "Draft",
  compileSize = "—",
  gasEstimate = "—",
  lastCompiled = "Never",
  currentStage = "design",
}: WorkstationHeaderProps) {
  const stages: PipelineStage[] = [
    { id: "design", label: "Design", status: "complete" },
    { id: "generate", label: "Generate", status: "complete" },
    { id: "compile", label: "Compile", status: "pending" },
    { id: "deploy", label: "Deploy", status: "pending" },
  ];

  // Update stage statuses based on currentStage
  const stageOrder = ["design", "generate", "compile", "deploy"];
  const currentIndex = stageOrder.indexOf(currentStage);
  
  stages.forEach((stage, index) => {
    if (index < currentIndex) {
      stage.status = "complete";
    } else if (index === currentIndex) {
      stage.status = "active";
    } else {
      stage.status = "pending";
    }
  });

  const getStageIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case "active":
        return <Circle className="w-3 h-3 text-blue-500 fill-blue-500" />;
      default:
        return <Circle className="w-3 h-3 text-zinc-700" />;
    }
  };

  return (
    <div className="w-full border-b border-white/[0.06] bg-[#0B0F14]">
      {/* Pipeline View */}
      <div className="h-12 flex items-center px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-1">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  stage.status === "active"
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : stage.status === "complete"
                    ? "bg-emerald-500/5 border border-emerald-500/10"
                    : "border border-transparent"
                }`}
              >
                {getStageIcon(stage.status)}
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    stage.status === "active"
                      ? "text-blue-400"
                      : stage.status === "complete"
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div className="w-6 h-px bg-white/[0.06] mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Contract Overview & Compile Metadata */}
      <div className="h-10 flex items-center justify-between px-4">
        {/* Contract Overview Panel */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
              Contract:
            </span>
            <span className="text-xs text-zinc-300 font-medium">
              {contractName}
            </span>
          </div>
          
          <div className="h-3 w-px bg-white/[0.06]" />
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
              Network:
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {network}
            </span>
          </div>
          
          <div className="h-3 w-px bg-white/[0.06]" />
          
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                status === "Compiled"
                  ? "bg-emerald-500"
                  : status === "Deployed"
                  ? "bg-blue-500"
                  : "bg-zinc-600"
              }`}
            />
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {status}
            </span>
          </div>
        </div>

        {/* Compile Metadata Panel */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
              Size:
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {compileSize}
            </span>
          </div>
          
          <div className="h-3 w-px bg-white/[0.06]" />
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
              Gas:
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {gasEstimate}
            </span>
          </div>
          
          <div className="h-3 w-px bg-white/[0.06]" />
          
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] text-zinc-500 font-mono">
              {lastCompiled}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
