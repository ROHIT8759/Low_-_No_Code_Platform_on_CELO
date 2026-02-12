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

import { BorderBeam } from "@/components/reactbits/BorderBeam"
import Silk from "@/components/reactbits/Silk"
import { PipelineStage } from "@/components/infrastructure/pipeline-stage"
import { PipelineConnector } from "@/components/infrastructure/pipeline-connector"
import { SecurityFeature } from "@/components/infrastructure/security-feature"
import { SecurityLayers } from "@/components/infrastructure/security-layers"

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
    accentColor: "emerald" as const,
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
    accentColor: "blue" as const,
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
    accentColor: "purple" as const,
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
    accentColor: "zinc" as const,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-zinc-300 antialiased overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* 1. LAYERED BACKGROUND SYSTEM */}
      {/* Micro noise texture at 1-2% opacity with radial vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Silk component for subtle noise texture (1-2% opacity) */}
        <div className="absolute inset-0 opacity-[0.015]">
          <Silk
            speed={5}
            scale={1}
            color="#FFFFFF"
            noiseIntensity={1.0}
            rotation={0}
          />
        </div>
        
        {/* Radial vignette overlay */}
        <div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.3) 100%)'
          }}
        />
      </div>

      <Navbar />

      {/* 2. ADVANCED HERO */}
      <section className="relative pt-24 pb-12 px-6 max-w-7xl mx-auto z-10 grid lg:grid-cols-12 gap-12 items-center">
        {/* Conditional grid overlay for hero zone (2-3% opacity) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
            opacity: 0.025
          }}
        />
        
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex flex-col items-start text-left"
        >
          <h1 className="text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-3 leading-[1.15]">
            Deterministic <br />
            <span className="text-zinc-500">Contract Infrastructure</span>
          </h1>

          <p className="text-xl text-zinc-400/90 font-light mb-1">
            For Soroban Deployments
          </p>

          <div className="h-px w-12 bg-zinc-800 my-5" />

          <p className="text-sm font-mono text-emerald-500/80 uppercase tracking-widest mb-6">
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
          <div className="mt-3 flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
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
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-lg"
          >
            <ProductWindow />
            <BorderBeam duration={10} delay={5} borderWidth={1.5} size={300} colorFrom="#3b82f6" colorTo="#06b6d4" />
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
        {/* Conditional grid overlay for bento zone (2-3% opacity) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
            opacity: 0.025
          }}
        />
        
        <div className="mb-12 relative z-10">
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
              accentColor={feature.accentColor}
            />
          ))}
        </BentoGrid>
      </section>

      {/* 5. SYSTEM ARCHITECTURE / BUILD PIPELINE */}
      <section className="py-32 border-t border-[#1A1F26] bg-[#0B0F14] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-semibold text-white mb-3">Build Pipeline</h2>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider">Visual Engine <span className="text-zinc-700 mx-2">→</span> Deterministic WASM</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-start justify-center gap-0 max-w-6xl mx-auto">

            {/* Stage 1: Visual Engine */}
            <PipelineStage
              id="01"
              title="Visual Engine"
              description="Drag-and-drop composition with schema enforcement."
              icon={<Box className="w-4 h-4" />}
              accentColor="blue"
              metrics={[{ label: 'CTX', value: '84ms' }]}
            />

            <PipelineConnector />

            {/* Stage 2: Rust Synthesis */}
            <PipelineStage
              id="02"
              title="Rust Synthesis"
              description="AST generation + borrow checker compliance."
              icon={<Code2 className="w-4 h-4" />}
              accentColor="purple"
              metrics={[{ label: 'GEN', value: '12ms' }]}
            />

            <PipelineConnector />

            {/* Stage 3: LLVM Compiler */}
            <PipelineStage
              id="03"
              title="LLVM Compiler"
              description="Optimization pipeline for minimal bytecode size."
              icon={<Terminal className="w-4 h-4" />}
              accentColor="emerald"
              metrics={[{ label: 'OPT', value: 'Level 3' }]}
            />

            <PipelineConnector />

            {/* Stage 4: WASM Bytecode */}
            <PipelineStage
              id="04"
              title="WASM Bytecode"
              description="Mainnet-ready binary artifact."
              icon={<Cpu className="w-4 h-4" />}
              accentColor="indigo"
              metrics={[{ label: 'SIZE', value: '14kb' }]}
            />

          </div>
        </div>
      </section>

      {/* 6. SECURITY & COMPLIANCE - DEFENSE IN DEPTH SPLIT */}
      <section className="relative py-32 px-6 border-t border-[#1A1F26] bg-[#090C10]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: Copy Column */}
          <div>
            {/* Active Protection Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-900/30 bg-emerald-900/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Active Protection</span>
            </div>
            
            {/* Heading */}
            <h2 className="text-4xl font-semibold text-white mb-6 tracking-tight">
              Defense in Depth <br />
              <span className="text-zinc-500">Architecture</span>
            </h2>
            
            {/* Description */}
            <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-md opacity-85">
              We don't just compile; we verify. Every contract undergoes a rigorous multi-stage security pipeline before it ever touches the network.
            </p>

            {/* Security Features */}
            <div className="space-y-6">
              <SecurityFeature
                icon={<Shield className="w-3 h-3 text-zinc-400" />}
                title="Pre-Flight Analysis"
                description="Static analysis scans for common vector vulnerabilities."
              />
              <SecurityFeature
                icon={<FileCheck className="w-3 h-3 text-zinc-400" />}
                title="Symbolic Execution"
                description="Mathematical proof of contract logic correctness."
              />
              <SecurityFeature
                icon={<Lock className="w-3 h-3 text-zinc-400" />}
                title="Runtime Enclaves"
                description="Isolated execution environments for gas metering."
              />
            </div>
          </div>

          {/* Right: Visual Column - Layered Security Cards */}
          <SecurityLayers />

        </div>
      </section>

      {}
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
