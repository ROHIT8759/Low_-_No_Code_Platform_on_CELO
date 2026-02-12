"use client"

import { ProductWindow } from "@/components/infrastructure/product-window"
import { BentoGrid, BentoGridItem } from "@/components/reactbits/BentoGrid"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { Navbar } from "@/components/navbar"
import { WasmCompilationVisual, StateExpirationVisual, FormalVerificationVisual, CrossContractVisual } from "@/components/infrastructure/bento-visuals"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Zap, Database, Server, Cpu, Lock, Terminal, Activity, FileCheck, Layers } from "lucide-react"
import Link from "next/link"

const INFRASTRUCTURE_FEATURES = [
  {
    title: "Native WASM Compilation",
    description: "Direct Rust-to-WASM pipeline optimized for Soroban's runtime environment. Ensures minimal bytecode size and maximum execution efficiency.",
    header: <WasmCompilationVisual />,
    icon: <Cpu className="h-4 w-4 text-zinc-500" />,
    className: "md:col-span-2",
  },
  {
    title: "State Expiration Handling",
    description: "Automated ledger entry TTL management preventing state bloat and sustainable storage.",
    header: <StateExpirationVisual />,
    icon: <Database className="h-4 w-4 text-zinc-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Formal Verification",
    description: "Integrated Proptest and symbolic execution for contract logic validation before deployment.",
    header: <FormalVerificationVisual />,
    icon: <Shield className="h-4 w-4 text-zinc-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Cross-Contract Calls",
    description: "Composable architecture allowing seamless invocation between deployed logic modules.",
    header: <CrossContractVisual />,
    icon: <Layers className="h-4 w-4 text-zinc-500" />,
    className: "md:col-span-2",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-zinc-300 antialiased overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* 1. LAYERED BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-infrastructure-grid opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B0F14_100%)] opacity-80" />
      </div>

      <Navbar />

      {/* 2. INFRASTRUCTURE HERO */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto z-10 grid lg:grid-cols-12 gap-16 items-center">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-5 flex flex-col items-start text-left"
        >
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded border border-[#222730] bg-[#11151A] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">System Operational</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-6 leading-[1.1]">
            Deterministic <br />
            <span className="text-zinc-500">Contract Infrastructure</span>
          </h1>

          <p className="text-sm lg:text-base text-zinc-400 mb-8 leading-relaxed max-w-md">
            Deploy production-grade Soroban contracts with an architecture-first platform.
            Native compilation, formal verification, and automated state management included.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/builder"
              className="h-10 px-5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              Initialize Workbench <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button className="h-10 px-5 border border-[#222730] hover:border-zinc-600 bg-transparent text-zinc-300 text-xs font-medium rounded transition-all">
              View Documentation
            </button>
          </div>
        </motion.div>

        {/* Right: Product Window */}
        <div className="hidden lg:block lg:col-span-7 relative perspective-1000">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "circOut" }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-20" />
            <ProductWindow />
          </motion.div>
        </div>
      </section>

      {/* 3. ADVANCED BENTO GRID (RESTORED) */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Core Architecture</h2>
          <p className="text-sm text-zinc-500 max-w-xl">
            Built on the Soroban-Rust stack for maximum performance and security.
          </p>
        </motion.div>

        <BentoGrid>
          {INFRASTRUCTURE_FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={feature.className}
            >
              <BentoGridItem
                title={feature.title}
                description={feature.description}
                header={feature.header}
                icon={feature.icon}
                className="h-full"
              />
            </motion.div>
          ))}
        </BentoGrid>
      </section>

      {/* 4. SECURITY & COMPLIANCE (SPOTLIGHT CARDS) */}
      <section className="relative py-20 px-6 border-t border-[#1A1F26] bg-[#090C10]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-end justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Security Primitive</h2>
              <p className="text-sm text-zinc-500">Audit-grade verification pipeline standard.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#11151A] border border-[#222730] rounded-full">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-mono text-zinc-400">SOC2 COMPLIANT MODULES</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Static Analysis", desc: "Automated cargo-checks and clippy integration", icon: <Terminal className="w-5 h-5" /> },
              { title: "Bytecode Verification", desc: "WASM validation for deterministic execution", icon: <FileCheck className="w-5 h-5" /> },
              { title: "Runtime Protection", desc: "Memory safety guarantees via Rust ownership", icon: <Lock className="w-5 h-5" /> }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <SpotlightCard className="h-40 p-6 flex flex-col justify-between group">
                  <div className="w-10 h-10 rounded bg-[#1A1F26] border border-[#222730] flex items-center justify-center group-hover:border-zinc-500 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 mb-1">{item.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER (INFRASTRUCTURE) */}
      <footer className="border-t border-[#1A1F26] bg-[#0B0F14] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-white tracking-tight">STELLAR<span className="text-zinc-600">INFRA</span></span>
            <span className="text-[10px] text-zinc-600 mt-1">© 2024 Engineering Division</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-zinc-500">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
