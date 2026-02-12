"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  Terminal,
  Shield,
  Zap,
  Activity,
  Box,
  Cpu,
  Globe,
  FileCode,
  Lock
} from "lucide-react";
import { useDevice } from "@/lib/use-device";

// Components
import { Navbar } from "@/components/navbar";
import { ProductWindow } from "@/components/infrastructure/product-window";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function Home() {
  const { isMobile } = useDevice();

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 overflow-hidden relative">

      {/* 1. LAYERED BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep Charcoal Base is set in CSS (bg-background) */}
        {/* Layer 2: Ultra Subtle Grid */}
        <div className="absolute inset-0 bg-infrastructure-grid opacity-30" />
        {/* Layer 3: Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0B0F14_100%)] opacity-80" />
      </div>

      <Navbar />

      {/* 2. INFRASTRUCTURE HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto z-10 grid lg:grid-cols-12 gap-16 items-center">

        {/* Left: Technical Editorial (5 cols) */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <ScrollReveal>
            {/* Micro Typography Label */}
            <div className="inline-flex items-center gap-2 mb-6 border-b border-primary/20 pb-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span className="text-[11px] font-mono text-primary tracking-widest uppercase">
                Visual Infrastructure // Soroban
              </span>
            </div>

            {/* Headline: 600 weight, tight spacing */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-[1.1] text-zinc-100">
              Production-Grade <br />
              Soroban Deployment.
            </h1>

            {/* Subtext: 400 weight, 80% opacity */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-lg mb-8 leading-relaxed font-normal">
              Notes on deterministic contract generation. <br className="hidden sm:block" />
              Compile visual logic to optimized WASM without boilerplate.
              Audit-ready, formal verification standard.
            </p>

            {/* CTA System */}
            <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
              <Link href="/builder" className="w-full sm:w-auto">
                <button className="h-11 px-8 w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 rounded-md">
                  Launch Console
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
              <Link href="/docs" className="w-full sm:w-auto">
                <button className="h-11 px-8 w-full sm:w-auto border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-medium transition-all rounded-md flex items-center justify-center gap-2 bg-[#11151A]">
                  <FileCode className="w-3.5 h-3.5" />
                  Documentation
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 pt-6 border-t border-zinc-800 w-full flex gap-8">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Network</span>
                <span className="text-zinc-300 font-mono text-xs">Stellar Mainnet</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Compiler</span>
                <span className="text-zinc-300 font-mono text-xs">Rust/WASM v2</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Status</span>
                <span className="text-emerald-500 font-mono text-xs flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
            </div>

          </ScrollReveal>
        </div>

        {/* Right: Framed Product Window (7 cols) */}
        {!isMobile && (
          <div className="lg:col-span-6 relative mt-8 lg:mt-0 perspective-1000">
            {/* No float, static placement with shadow depth */}
            <div className="relative transform transition-transform duration-500 hover:scale-[1.01]">
              <ProductWindow />
            </div>
          </div>
        )}
      </section>

      {/* 3. CORE INFRASTRUCTURE GRID (DENSE) */}
      <section className="py-24 px-6 relative z-10 border-t border-zinc-900 bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-zinc-800/50 pb-6">
            <div>
              <h2 className="text-xl font-medium text-zinc-100 mb-2">Core Infrastructure</h2>
              <p className="text-zinc-500 text-sm max-w-md">
                Modular components for decentralized systems.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <span className="text-[10px] font-mono text-zinc-600">SYS_V2.0.1</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-800">
            {/* Card 1 */}
            <div className="bg-[#0D1117] p-8 group hover:bg-[#11161D] transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 rounded-md group-hover:border-zinc-700 transition-colors">
                <Box className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-zinc-200 font-medium mb-2">Visual Composition</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Drag-and-drop logic flows. Compile directly to bare-metal WASM. No interpretation overhead.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0D1117] p-8 group hover:bg-[#11161D] transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 rounded-md group-hover:border-zinc-700 transition-colors">
                <Shield className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-zinc-200 font-medium mb-2">Security Verification</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Automated formal verification checks for common attack vectors before compilation.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0D1117] p-8 group hover:bg-[#11161D] transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 rounded-md group-hover:border-zinc-700 transition-colors">
                <Zap className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-zinc-200 font-medium mb-2">Instant Propagation</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Direct RPC submission to Soroban Testnet and Mainnet with receipt validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BREAK SECTION - DARK STATEMENT */}
      <section className="py-32 bg-[#050709] border-y border-zinc-900 flex items-center justify-center text-center">
        <div className="max-w-2xl px-6">
          <h2 className="text-3xl font-medium text-zinc-100 mb-6 tracking-tight">
            "This is serious infrastructure tooling."
          </h2>
          <p className="text-zinc-500 text-lg font-light leading-relaxed">
            We removed the abstraction layers. You are building directly on the metal of the Stellar network, with a visual interface that respects the engineering process.
          </p>
        </div>
      </section>

      {/* 5. TECHNICAL ARCHITECTURE */}
      <section className="py-24 px-6 bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* List */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                Architecture // Stack
              </span>
            </div>
            <h2 className="text-3xl font-medium text-zinc-100 mb-8">
              Built for the <span className="text-zinc-500">production environment.</span>
            </h2>

            <div className="space-y-6">
              {[
                { title: "WASM Optimization", desc: "Contracts compile to minimal bytecode size." },
                { title: "State Expiration", desc: "Auto-handling of ledger entry TTL." },
                { title: "Cross-Contract Calls", desc: "Composable invocation between deployed logic." },
                { title: "Event Indexing", desc: "Structured event emission for off-chain indexers." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="mt-1 w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900 group-hover:border-primary/50 transition-colors">
                    <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full group-hover:bg-primary transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-zinc-200 font-medium text-sm">{item.title}</h4>
                    <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Representation */}
          <div className="relative border border-zinc-800 bg-[#0D1117] rounded-lg p-8 aspect-square flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-zinc-600">
              ARCH_DIAGRAM_01
            </div>

            {/* Simplified Diagram */}
            <div className="flex-1 flex flex-col justify-center items-center gap-4">
              <div className="w-32 h-12 border border-zinc-700 bg-zinc-800 rounded flex items-center justify-center text-xs text-zinc-300">
                Visual Input
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="w-32 h-12 border border-primary/30 bg-primary/10 rounded flex items-center justify-center text-xs text-primary">
                Compiler L1
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="w-32 h-12 border border-zinc-700 bg-zinc-900 rounded flex items-center justify-center text-xs text-zinc-300">
                WASM Output
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs font-mono text-zinc-500 mt-4">Deterministic Compilation Pipeline</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer (Minimal) */}
      <footer className="relative border-t border-zinc-900 py-16 px-6 bg-[#050709]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
          <div className="md:col-span-2">
            <span className="font-semibold text-zinc-100 block mb-4">Block Builder</span>
            <p className="text-zinc-500 max-w-xs font-light">
              Enterprise-grade visual smart contract development platform for Stellar.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-zinc-100">Product</h4>
            <ul className="space-y-2 text-zinc-600">
              <li><Link href="/builder" className="hover:text-primary transition-colors">Console</Link></li>
              <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-zinc-100">Connect</h4>
            <div className="flex gap-4 text-zinc-600">
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
