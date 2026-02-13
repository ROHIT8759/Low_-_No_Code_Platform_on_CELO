"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { BentoGrid, BentoGridItem } from "@/components/reactbits/BentoGrid"
import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Database, Cpu, Layers, GitCommit, CheckCircle, Code2, Workflow, Box, Terminal, FileCheck, Lock } from "lucide-react"
import Link from "next/link"
import { MOTION_DURATION, MOTION_TRANSFORMS } from "@/lib/motion"
import { useIsMobile, useIsTablet } from "@/lib/use-breakpoint"

import { BorderBeam } from "@/components/reactbits/BorderBeam"
import Silk from "@/components/reactbits/Silk"
import { PipelineStage } from "@/components/infrastructure/pipeline-stage"
import { PipelineConnector } from "@/components/infrastructure/pipeline-connector"
import { SecurityFeature } from "@/components/infrastructure/security-feature"
import { SecurityLayers } from "@/components/infrastructure/security-layers"

// Lazy load heavy components for better performance
const ProductWindow = dynamic(() => import("@/components/infrastructure/product-window").then(mod => ({ default: mod.ProductWindow })), {
  loading: () => <div className="w-full aspect-[16/10] bg-[var(--surface-1)] rounded-lg border border-white/[0.08] animate-pulse" />,
  ssr: false
})

const WasmCompilationVisual = dynamic(() => import("@/components/infrastructure/bento-visuals").then(mod => ({ default: mod.WasmCompilationVisual })), {
  loading: () => <div className="w-full h-32 bg-[var(--surface-1)] rounded animate-pulse" />
})

const StateExpirationVisual = dynamic(() => import("@/components/infrastructure/bento-visuals").then(mod => ({ default: mod.StateExpirationVisual })), {
  loading: () => <div className="w-full h-32 bg-[var(--surface-1)] rounded animate-pulse" />
})

const FormalVerificationVisual = dynamic(() => import("@/components/infrastructure/bento-visuals").then(mod => ({ default: mod.FormalVerificationVisual })), {
  loading: () => <div className="w-full h-32 bg-[var(--surface-1)] rounded animate-pulse" />
})

const CrossContractVisual = dynamic(() => import("@/components/infrastructure/bento-visuals").then(mod => ({ default: mod.CrossContractVisual })), {
  loading: () => <div className="w-full h-32 bg-[var(--surface-1)] rounded animate-pulse" />
})

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
    accentColor: "amber" as const,
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
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  // Staggered animation variants for hero elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATION.normal / 1000,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
      }
    }
  }

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[var(--surface-0)] text-[var(--text-secondary)] antialiased overflow-hidden selection:bg-emerald-400/20 selection:text-emerald-100">

      {/* 1. LAYERED BACKGROUND SYSTEM */}
      {/* Micro noise texture at 1-2% opacity with radial vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
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
            background: "radial-gradient(900px 420px at 12% 10%, rgba(46, 200, 146, 0.16), transparent 65%), radial-gradient(800px 520px at 82% 12%, rgba(76, 141, 255, 0.12), transparent 70%), radial-gradient(900px 540px at 50% 100%, rgba(244, 183, 64, 0.08), transparent 70%), radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.35) 100%)"
          }}
        />
      </div>

      <Navbar />

      {/* 2. ADVANCED HERO */}
      <section className="relative pt-24 pb-12 px-6 max-w-7xl mx-auto z-10 grid lg:grid-cols-12 gap-12 items-center" aria-labelledby="hero-heading">
        {/* Conditional grid overlay for hero zone (2-3% opacity) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
            opacity: 0.025
          }}
        />
        
        {/* Left: Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-5 flex flex-col items-start text-left"
        >
          <motion.h1 
            variants={itemVariants}
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-3 leading-[1.08]"
          >
            Deterministic <br />
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">Contract Infrastructure</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-zinc-300/90 font-light mb-1"
          >
            For Soroban Deployments
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="h-px w-12 bg-zinc-800 my-5" 
          />

          <motion.p 
            variants={itemVariants}
            className="text-xs sm:text-sm font-mono text-emerald-400/90 uppercase tracking-widest mb-6"
          >
            Production-grade WASM <span className="text-zinc-700 px-2">·</span> Architecture-first tooling
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
          >
            <Link
              href="/builder"
              className="h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded transition-all shadow-none flex items-center justify-center gap-2"
              aria-label="Initialize Workbench - Start building contracts"
            >
              Initialize Workbench <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button 
              className="h-10 px-6 border border-white/[0.1] hover:border-white/[0.2] hover:bg-[var(--surface-1)] text-zinc-300 text-sm font-medium rounded transition-all"
              aria-label="Read Documentation"
            >
              Read Documentation
            </button>
          </motion.div>
          
          {!isMobile && (
            <motion.div 
              variants={itemVariants}
              className="mt-3 flex items-center gap-3 text-[10px] text-zinc-500 font-mono"
            >
              <span>MAINNET READY</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>WASM NATIVE</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>FORMAL PIPELINE</span>
            </motion.div>
          )}
        </motion.div>

        {/* Right: Product Window - Hidden on mobile/tablet */}
        {!isMobile && !isTablet && (
          <div className="lg:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, y: MOTION_TRANSFORMS.slideUp }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MOTION_DURATION.slow / 1000, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-lg"
            >
              <Suspense fallback={<div className="w-full aspect-[16/10] bg-[var(--surface-1)] rounded-lg border border-white/[0.08] animate-pulse" />}>
                <ProductWindow />
              </Suspense>
              <BorderBeam duration={10} delay={5} borderWidth={1.5} size={300} colorFrom="#2EC892" colorTo="#4C8DFF" />
            </motion.div>
          </div>
        )}
      </section>

      {/* 3. ENGINEERING PRINCIPLES STRIP - LOOPING MARQUEE */}
      <section className="border-y border-white/[0.06] bg-[var(--surface-1)] py-4 md:py-5 overflow-hidden" aria-label="Engineering principles">
        <div className="relative max-w-7xl mx-auto">
          {/* Marquee container with gradient fade edges */}
          <div className="relative flex overflow-hidden">
            {/* Left gradient fade */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[var(--surface-1)] to-transparent z-10 pointer-events-none" />
            {/* Right gradient fade */}
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[var(--surface-1)] to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling content */}
            <motion.div
              className="flex shrink-0 gap-6 md:gap-12 items-center text-xs md:text-sm font-mono text-zinc-500 uppercase tracking-wider whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate content for seamless loop */}
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex shrink-0 gap-6 md:gap-12 items-center">
                  <div className="flex items-center gap-2 shrink-0">
                    <CheckCircle className="w-3 md:w-4 h-3 md:h-4 text-zinc-600" aria-hidden="true" />
                    <span className="hidden sm:inline">Deterministic by Default</span>
                    <span className="sm:hidden">Deterministic</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Workflow className="w-3 md:w-4 h-3 md:h-4 text-zinc-600" />
                    <span className="hidden sm:inline">Architecture-First</span>
                    <span className="sm:hidden">Architecture</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Code2 className="w-3 md:w-4 h-3 md:h-4 text-zinc-600" /> WASM-Native
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <GitCommit className="w-3 md:w-4 h-3 md:h-4 text-zinc-600" /> Deployment Parity
                  </div>
                  {/* Separator dot */}
                  <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. UPGRADED BENTO GRID */}
      <section className="relative pb-24 px-6 max-w-7xl mx-auto z-10" aria-labelledby="features-heading">
        {/* Conditional grid overlay for bento zone (2-3% opacity) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
            opacity: 0.025
          }}
        />
        
        <div className="mb-8 md:mb-12 relative z-10">
          <h2 id="features-heading" className="text-xl md:text-2xl font-semibold text-white mb-2">Core Infrastructure</h2>
          <p className="text-sm md:text-base text-zinc-500 max-w-xl">Primitives designed for high-assurance financial applications.</p>
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
      <section className="py-16 md:py-24 lg:py-32 border-t border-white/[0.06] bg-[var(--surface-0)] relative overflow-hidden" aria-labelledby="pipeline-heading">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h2 id="pipeline-heading" className="text-2xl md:text-3xl font-semibold text-white mb-3">Build Pipeline</h2>
            <p className="text-zinc-500 font-mono text-xs md:text-sm uppercase tracking-wider">
              Visual Engine <span className="text-zinc-700 mx-2">→</span> Deterministic WASM
            </p>
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
      <section className="relative py-16 md:py-24 lg:py-32 px-6 border-t border-white/[0.06] bg-[var(--surface-1)]" aria-labelledby="security-heading">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">

          {/* Left: Copy Column */}
          <div>
            {/* Active Protection Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-900/30 bg-emerald-900/10 mb-6" role="status">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Active Protection</span>
            </div>
            
            {/* Heading */}
            <h2 id="security-heading" className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-6 tracking-tight">
              Defense in Depth <br />
              <span className="text-zinc-500">Architecture</span>
            </h2>
            
            {/* Description */}
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-8 max-w-md opacity-85">
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
      <footer className="border-t border-white/[0.06] bg-[var(--surface-0)] py-12 px-6" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold" aria-hidden="true">B</div>
            <span className="text-sm font-semibold">Block Builder</span>
          </div>
          <div className="text-xs text-zinc-600 font-mono" role="status">
            SYSTEM STATUS: <span className="text-emerald-500">ONLINE</span>
          </div>
          <nav className="flex gap-6 text-xs text-zinc-500" aria-label="Footer navigation">
            <a href="#" className="hover:text-zinc-300 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">API Reference</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Status</a>
          </nav>
        </div>
      </footer>
    </main>
  )
}
