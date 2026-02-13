"use client";

import React from "react";
import { Activity, Cpu, Database, Zap } from "lucide-react";

export function TelemetryMicrobar() {
  return (
    <div className="w-full h-7 bg-[var(--surface-1)] border-b border-white/[0.08] flex items-center px-3 gap-4 text-[9px] font-mono">
      {/* System Status */}
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-zinc-500 uppercase tracking-wider">Live</span>
      </div>

      <div className="h-3 w-px bg-white/[0.08]" />

      {/* CPU Usage */}
      <div className="flex items-center gap-1.5">
        <Cpu className="w-3 h-3 text-zinc-600" />
        <span className="text-zinc-500">CPU:</span>
        <span className="text-zinc-400">12%</span>
      </div>

      {/* Memory */}
      <div className="flex items-center gap-1.5">
        <Database className="w-3 h-3 text-zinc-600" />
        <span className="text-zinc-500">MEM:</span>
        <span className="text-zinc-400">84MB</span>
      </div>

      {/* Latency */}
      <div className="flex items-center gap-1.5">
        <Zap className="w-3 h-3 text-zinc-600" />
        <span className="text-zinc-500">LAT:</span>
        <span className="text-zinc-400">42ms</span>
      </div>

      <div className="h-3 w-px bg-white/[0.08]" />

      {/* Network */}
      <div className="flex items-center gap-1.5">
        <Activity className="w-3 h-3 text-blue-500" />
        <span className="text-zinc-500">NET:</span>
        <span className="text-blue-400">MAINNET</span>
      </div>
    </div>
  );
}
