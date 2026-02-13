import React from 'react';

export function PipelineConnector() {
  return (
    <div className="hidden md:flex w-12 h-48 items-center justify-center relative -ml-1 -mr-1 z-0">
      {/* Horizontal line */}
      <div className="w-full h-px bg-white/[0.06]" />
      {/* Dot in center */}
      <div className="absolute w-2 h-2 rounded-full bg-white/[0.06]" />
    </div>
  );
}
