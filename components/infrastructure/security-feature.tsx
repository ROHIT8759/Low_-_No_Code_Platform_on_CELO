import React from 'react';

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function SecurityFeature({ icon, title, description }: SecurityFeatureProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-6 h-6 rounded bg-[var(--surface-2)] flex items-center justify-center mt-0.5 shrink-0 border border-white/[0.06]">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
