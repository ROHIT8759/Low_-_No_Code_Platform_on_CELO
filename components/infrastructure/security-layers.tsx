'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { MOTION_DURATION, MOTION_TRANSFORMS } from '@/lib/motion';

interface SecurityMetric {
  check: string;
  status: string;
  color: 'emerald' | 'blue';
}

const securityMetrics: SecurityMetric[] = [
  { check: 'Re-entrancy Check', status: 'SAFE', color: 'emerald' },
  { check: 'Overflow Protection', status: 'SAFE', color: 'emerald' },
  { check: 'Access Control', status: 'VERIFIED', color: 'emerald' },
  { check: 'Gas Optimization', status: '98/100', color: 'blue' },
];

export function SecurityLayers() {
  return (
    <div className="relative h-[500px] w-full flex items-center justify-center">
      <div className="relative w-full max-w-md">
        {/* Background Layer 3 - Furthest back */}
        <div 
          className="absolute top-24 left-8 right-8 h-40 bg-[#0F141B] border border-white/[0.04] rounded-xl transform scale-95 opacity-30 z-0"
          aria-hidden="true"
        />

        {/* Background Layer 2 - Middle */}
        <div 
          className="absolute top-12 left-4 right-4 h-40 bg-[#0F141B] border border-white/[0.06] rounded-xl transform scale-[0.97] opacity-50 z-10 flex items-center justify-between px-6"
          aria-hidden="true"
        >
          <span className="text-xs font-mono text-zinc-600">LAYER_02</span>
          <div className="h-1 w-12 bg-blue-500/20 rounded-full" />
        </div>

        {/* Primary Security Report Card - Front */}
        <motion.div
          initial={{ y: MOTION_TRANSFORMS.slideUp, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: MOTION_DURATION.normal / 1000, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-auto bg-[#11151A] border border-white/[0.06] rounded-xl p-8 z-20"
        >
          {/* Top accent strip */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Security Report</div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">ID: 0x82...9A2</div>
              </div>
            </div>
            <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 font-mono font-medium">
              PASSED
            </div>
          </div>

          <div className="space-y-3 font-mono text-[10px]">
            {securityMetrics.map((metric, index) => (
              <div 
                key={metric.check}
                className={`flex justify-between py-2 ${
                  index < securityMetrics.length - 1 ? 'border-b border-white/[0.04]' : ''
                }`}
              >
                <span className="text-zinc-400">{metric.check}</span>
                <span className={metric.color === 'emerald' ? 'text-emerald-500' : 'text-blue-500'}>
                  {metric.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
