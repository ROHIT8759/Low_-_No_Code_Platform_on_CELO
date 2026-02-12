import React from 'react';

interface PipelineMetric {
  label: string;
  value: string;
}

interface PipelineStageProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: 'blue' | 'purple' | 'emerald' | 'indigo';
  metrics: PipelineMetric[];
}

const accentColorMap = {
  blue: 'bg-blue-500/50',
  purple: 'bg-purple-500/50',
  emerald: 'bg-emerald-500/50',
  indigo: 'bg-indigo-500/50',
};

const iconBgColorMap = {
  blue: 'bg-blue-500/10 text-blue-500',
  purple: 'bg-purple-500/10 text-purple-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  indigo: 'bg-indigo-500/10 text-indigo-500',
};

export function PipelineStage({
  id,
  title,
  description,
  icon,
  accentColor,
  metrics,
}: PipelineStageProps) {
  return (
    <div className="flex-1 flex flex-col gap-4 relative group z-10">
      <div className="h-48 p-6 mx-2 rounded-xl border border-white/[0.06] bg-[#0F141B] hover:bg-[#11161D] transition-all hover:-translate-y-1 duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden">
        {/* Colored top accent strip */}
        <div className={`absolute top-0 left-0 w-full h-[2px] ${accentColorMap[accentColor]}`} />
        
        {/* ID badge and icon */}
        <div className="flex justify-between items-start mb-8">
          <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">
            ID: {id}
          </span>
          <div className={`w-8 h-8 rounded flex items-center justify-center ${iconBgColorMap[accentColor]}`}>
            {icon}
          </div>
        </div>
        
        {/* Title and description */}
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">{title}</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
      </div>
      
      {/* Micro telemetry metrics - revealed on hover */}
      <div className="px-6 flex gap-4 text-[10px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
        {metrics.map((metric, index) => (
          <span key={index}>
            {metric.label}: {metric.value}
          </span>
        ))}
      </div>
    </div>
  );
}
