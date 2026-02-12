"use client"

import { ProductWindow } from "@/components/infrastructure/product-window"
import { BentoGrid, BentoGridItem } from "@/components/reactbits/BentoGrid"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { Navbar } from "@/components/navbar"
import { WasmCompilationVisual, StateExpirationVisual, FormalVerificationVisual, CrossContractVisual } from "@/components/infrastructure/bento-visuals"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Zap, Database, Server, Cpu, Lock, Terminal, Activity, FileCheck, Layers, GitCommit, CheckCircle, Code2, Workflow, Box } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const INFRASTRUCTURE_FEATURES = [
  {
    title: "Native WASM Compilation",
    description: (
      <div className="flex flex-col gap-2">
        <span>Direct Rust-to-WASM pipeline optimized for Soroban's runtime environment.</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-500 font-medium">REL: OPTIMIZED</span>
          <span className="text-[10px] text-zinc-500 font-mono">14kb runtime</span>
        </div>
      </div>
    ),
    header: <WasmCompilationVisual />,
    icon: <Cpu className="h-4 w-4 text-zinc-500" />,
    className: "md:col-span-2",
  },
  {
    title: "State Expiration Handling",
    description: (
      <div className="flex flex-col gap-2">
        <span>Automated ledger entry TTL management preventing state bloat.</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-500 font-medium">AUTO-RENEW</span>
        </div>
      </div>
    ),
    header: <StateExpirationVisual />,
    icon: <Database className="h-4 w-4 text-zinc-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Formal Verification",
    description: (
      <div className="flex flex-col gap-2">
        <span>Integrated Proptest and symbolic execution for contract logic validation.</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono text-purple-500 font-medium">SYMBOLIC EXEC</span>
        </div>
      </div>
    ),
    header: <FormalVerificationVisual />,
    icon: <Shield className="h-4 w-4 text-zinc-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Cross-Contract Calls",
    description: (
      <div className="flex flex-col gap-2">
        <span>Composable architecture allowing seamless invocation between logic modules.</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400 font-medium">INVOKE_HOST</span>
        </div>
      </div>
    ),
    header: <CrossContractVisual />,
    icon: <Layers className="h-4 w-4 text-zinc-500" />,
    className: "md:col-span-2",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-zinc-300 antialiased overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* 1. LAYERED BACKGROUND SYSTEM */}
      {/* Grid only visible in hero + bento zone then fades out */}
      <div className="absolute inset-0 h-[1000px] z-0 pointer-events-none">
        <div className="absolute inset-0 bg-infrastructure-grid opacity-[0.03] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.03)_0%,transparent_50%)]" />
      </div>

      <Navbar />

      {/* 2. ADVANCED HERO */}
      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto z-10 grid lg:grid-cols-12 gap-16 items-center">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex flex-col items-start text-left"
        >
          <h1 className="text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-4 leading-[1.15]">
            Deterministic <br />
            <span className="text-zinc-500">Contract Infrastructure</span>
          </h1>

          <p className="text-xl text-zinc-400/90 font-light mb-1">
            For Soroban Deployments
          </p>

          <div className="h-px w-12 bg-zinc-800 my-6" />

          <p className="text-sm font-mono text-emerald-500/80 uppercase tracking-widest mb-8">
            Production-grade WASM <span className="text-zinc-700 px-2">·</span> Architecture-first tooling
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/builder"
              className="h-10 px-6 bg-[#0055eb] hover:bg-[#0044c2] text-white text-sm font-medium rounded transition-all shadow-none flex items-center gap-2"
            >
              Initialize Workbench <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="h-10 px-6 border border-[#222730] hover:border-zinc-500 hover:bg-[#11151A] text-zinc-300 text-sm font-medium rounded transition-all">
              Read Documentation
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
            <span>MAINNET READY</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>WASM NATIVE</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>FORMAL PIPELINE</span>
          </div>
        </motion.div>

        {/* Right: Product Window */}
        <div className="hidden lg:block lg:col-span-7 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <ProductWindow />
          </motion.div>
        </div>
      </section>

      {/* 3. ENGINEERING PRINCIPLES STRIP */}
      <section className="border-y border-[#1A1F26] bg-[#090C10] py-6 mb-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-6 text-sm font-mono text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-zinc-600" /> Deterministic by Default
          </div>
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-zinc-600" /> Architecture-First
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-zinc-600" /> WASM-Native
          </div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-zinc-600" /> Deployment Parity
          </div>
        </div>
      </section>

      {/* 4. UPGRADED BENTO GRID */}
      <section className="relative pb-24 px-6 max-w-7xl mx-auto z-10">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">Core Infrastructure</h2>
          <p className="text-zinc-500 max-w-xl">Primitives designed for high-assurance financial applications.</p>
        </div>
        <BentoGrid className="max-w-7xl mx-auto">
          {INFRASTRUCTURE_FEATURES.map((feature, i) => (
            <BentoGridItem
              key={i}
              title={feature.title}
              description={feature.description}
              header={feature.header}
              icon={feature.icon}
              className={feature.className}
            />
          ))}
        </BentoGrid>
      </section>

      {/* 5. SYSTEM ARCHITECTURE */}
      <section className="py-24 border-t border-[#1A1F26] bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold text-white mb-2">Build Pipeline</h2>
            <p className="text-zinc-500">From visual composition to deterministic bytecode.</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-xl bg-[#11151A] border border-[#222730] flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <Box className="w-6 h-6 text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-xs font-mono text-zinc-500">VISUAL ENGINE</span>
            </div>

            {/* Connector */}
            <div className="w-px h-8 md:w-16 md:h-px bg-zinc-800" />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-xl bg-[#11151A] border border-[#222730] flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <Code2 className="w-6 h-6 text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-xs font-mono text-zinc-500">RUST GEN</span>
            </div>

            {/* Connector */}
            <div className="w-px h-8 md:w-16 md:h-px bg-zinc-800" />

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-xl bg-[#11151A] border border-[#222730] flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <Terminal className="w-6 h-6 text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-xs font-mono text-zinc-500">COMPILER</span>
            </div>

            {/* Connector */}
            <div className="w-px h-8 md:w-16 md:h-px bg-zinc-800" />

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 rounded-xl bg-[#11151A] border border-[#222730] flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <Cpu className="w-6 h-6 text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-xs font-mono text-zinc-500">WASM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECURITY & COMPLIANCE */}
      <section className="relative py-20 px-6 border-t border-[#1A1F26] bg-[#090C10]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded border border-emerald-900/30 bg-emerald-900/10 mb-4">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">SOC2 Pipeline</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Security Architecture</h2>
            </div>
            <p className="text-zinc-500 max-w-sm text-sm">
              Every deployment undergoes static analysis and symbolic execution before hitting the network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard className="bg-[#0B0F14] border-l-2 border-l-blue-500 border-y border-r border-[#222730] min-h-[160px] p-6">
              <div className="mb-4 w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Runtime Assurance</h3>
              <p className="text-xs text-zinc-500">Real-time monitoring of gas metering and execution limits.</p>
            </SpotlightCard>

            <SpotlightCard className="bg-[#0B0F14] border-l-2 border-l-purple-500 border-y border-r border-[#222730] min-h-[160px] p-6 translate-y-4">
              <div className="mb-4 w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Bytecode Verification</h3>
              <p className="text-xs text-zinc-500">Cryptographic proof of source-code-to-wasm compilation.</p>
            </SpotlightCard>

            <SpotlightCard className="bg-[#0B0F14] border-l-2 border-l-emerald-500 border-y border-r border-[#222730] min-h-[160px] p-6 translate-y-8">
              <div className="mb-4 w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Access Control</h3>
              <p className="text-xs text-zinc-500">Role-based permissioning baked into every contract template.</p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-[#1A1F26] bg-[#0B0F14] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold">B</div>
            <span className="text-sm font-semibold">Block Builder</span>
          </div>
          <div className="text-xs text-zinc-600 font-mono">
            SYSTEM STATUS: <span className="text-emerald-500">ONLINE</span>
          </div>
          <div className="flex gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">API Reference</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
