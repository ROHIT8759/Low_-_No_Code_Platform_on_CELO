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
      {/* 1. LAYERED BACKGROUND SYSTEM */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Silk
          speed={5}
          scale={1}
          color="#1A1F26" // Tilted slightly lighter to ensure visibility against the #0B0F14 bg
          noiseIntensity={1.5} // Increased noise for texture
          rotation={0}
        />
        {/* We keep a subtle gradient overlay to ensure text readability if the silk is too busy */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0B0F14]/50 to-[#0B0F14]" />
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

      {/* 5. SYSTEM ARCHITECTURE / BUILD PIPELINE */}
      <section className="py-32 border-t border-[#1A1F26] bg-[#0B0F14] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-semibold text-white mb-3">Build Pipeline</h2>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider">Visual Engine <span className="text-zinc-700 mx-2">→</span> Deterministic WASM</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-start justify-center gap-0 max-w-6xl mx-auto">

            {/* ITEM 1 */}
            <div className="flex-1 flex flex-col gap-4 relative group z-10">
              <div className="h-48 p-6 mx-2 rounded-xl border border-zinc-800 bg-[#0F141B] hover:bg-[#11161D] transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50" />
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">ID: 01</span>
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-500/10 text-blue-500">
                    <Box className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">Visual Engine</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Drag-and-drop composition with schema enforcement.</p>
              </div>
              {/* Micro Stats */}
              <div className="px-6 flex gap-4 text-[10px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                <span>CTX: 84ms</span>
              </div>
            </div>

            {/* CONNECTOR 1 */}
            <div className="hidden md:flex w-12 h-48 items-center justify-center relative -ml-1 -mr-1 z-0">
              <div className="w-full h-px bg-zinc-800" />
              <div className="absolute w-2 h-2 rounded-full bg-zinc-800" />
            </div>

            {/* ITEM 2 */}
            <div className="flex-1 flex flex-col gap-4 relative group z-10">
              <div className="h-48 p-6 mx-2 rounded-xl border border-zinc-800 bg-[#0F141B] hover:bg-[#11161D] transition-all hover:-translate-y-1 duration-300 delay-75 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50" />
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">ID: 02</span>
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-purple-500/10 text-purple-500">
                    <Code2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">Rust Synthesis</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">AST generation + borrow checker compliance.</p>
              </div>
              <div className="px-6 flex gap-4 text-[10px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 delay-75">
                <span>GEN: 12ms</span>
              </div>
            </div>

            {/* CONNECTOR 2 */}
            <div className="hidden md:flex w-12 h-48 items-center justify-center relative -ml-1 -mr-1 z-0">
              <div className="w-full h-px bg-zinc-800" />
              <div className="absolute w-2 h-2 rounded-full bg-zinc-800" />
            </div>

            {/* ITEM 3 */}
            <div className="flex-1 flex flex-col gap-4 relative group z-10">
              <div className="h-48 p-6 mx-2 rounded-xl border border-zinc-800 bg-[#0F141B] hover:bg-[#11161D] transition-all hover:-translate-y-1 duration-300 delay-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50" />
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">ID: 03</span>
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                    <Terminal className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">LLVM Compiler</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Optimization pipeline for minimal bytecode size.</p>
              </div>
              <div className="px-6 flex gap-4 text-[10px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 delay-100">
                <span>OPT: Level 3</span>
              </div>
            </div>

            {/* CONNECTOR 3 */}
            <div className="hidden md:flex w-12 h-48 items-center justify-center relative -ml-1 -mr-1 z-0">
              <div className="w-full h-px bg-zinc-800" />
              <div className="absolute w-2 h-2 rounded-full bg-zinc-800" />
            </div>

            {/* ITEM 4 */}
            <div className="flex-1 flex flex-col gap-4 relative group z-10">
              <div className="h-48 p-6 mx-2 rounded-xl border border-zinc-800 bg-[#0F141B] hover:bg-[#11161D] transition-all hover:-translate-y-1 duration-300 delay-150 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50" />
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">ID: 04</span>
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">WASM Bytecode</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Mainnet-ready binary artifact.</p>
              </div>
              <div className="px-6 flex gap-4 text-[10px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 delay-150">
                <span>SIZE: 14kb</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SECURITY & COMPLIANCE - DEFENSE IN DEPTH SPLIT */}
      <section className="relative py-32 px-6 border-t border-[#1A1F26] bg-[#090C10]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: Strategic Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-900/30 bg-emerald-900/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Active Protection</span>
            </div>
            <h2 className="text-4xl font-semibold text-white mb-6 tracking-tight">
              Defense in Depth <br />
              <span className="text-zinc-500">Architecture</span>
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-md">
              We don't just compile; we verify. Every contract undergoes a rigorous multi-stage security pipeline before it ever touches the network.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center mt-0.5 shrink-0">
                  <Shield className="w-3 h-3 text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Pre-Flight Analysis</h4>
                  <p className="text-xs text-zinc-500 mt-1">Static analysis scans for common vector vulnerabilities.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center mt-0.5 shrink-0">
                  <FileCheck className="w-3 h-3 text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Symbolic Execution</h4>
                  <p className="text-xs text-zinc-500 mt-1">Mathematical proof of contract logic correctness.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center mt-0.5 shrink-0">
                  <Lock className="w-3 h-3 text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Runtime Enclaves</h4>
                  <p className="text-xs text-zinc-500 mt-1">Isolated execution environments for gas metering.</p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="relative h-[500px] w-full flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {}
              <div className="absolute top-24 left-8 right-8 h-40 bg-[#0F141B] border border-zinc-800 rounded-lg p-6 transform scale-95 opacity-40 z-0"></div>

              {}
              <div className="absolute top-12 left-4 right-4 h-40 bg-[#0F141B] border border-zinc-800 rounded-lg p-6 shadow-2xl transform scale-100 opacity-70 z-10 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-600">LAYER_02</span>
                <div className="h-1 w-12 bg-purple-500/30 rounded-full" />
              </div>

              {}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="relative h-auto bg-[#0F141B] border border-zinc-700/50 rounded-xl p-8 shadow-2xl z-20"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Security Report</div>
                      <div className="text-[10px] text-zinc-500 font-mono">ID: 0x82...9A2</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 font-mono">
                    PASSED
                  </div>
                </div>

                <div className="space-y-3 font-mono text-[10px] text-zinc-400">
                  <div className="flex justify-between py-2 border-b border-zinc-800">
                    <span>Re-entrancy Check</span>
                    <span className="text-emerald-500">SAFE</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-800">
                    <span>Overflow Protection</span>
                    <span className="text-emerald-500">SAFE</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-800">
                    <span>Access Control</span>
                    <span className="text-emerald-500">VERIFIED</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Gas Optimization</span>
                    <span className="text-blue-500">98/100</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

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
