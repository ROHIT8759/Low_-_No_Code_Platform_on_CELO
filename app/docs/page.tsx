"use client";

import { ArrowLeft, Code2, Rocket, Sparkles, Shield, Zap, Terminal, Box, Cpu } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-zinc-300">
      {}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F14]/80 backdrop-blur-md border-b border-[#1A1F26]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-xs font-bold text-white group-hover:bg-zinc-700 transition-colors">
                B
              </div>
              <span className="text-sm font-semibold text-white">
                Block Builder
              </span>
            </Link>

            <Link
              href="/builder"
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-zinc-200 transition-all"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden bg-[#0B0F14]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-zinc-800 bg-zinc-900/50 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Documentation v1.0</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight">
              Build pipeline infrastructure <br />
              <span className="text-zinc-500">for smart contracts.</span>
            </h1>

            <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl mx-auto font-light">
              A deterministic environment for visual composition, compilation, and deployment to the Celo network.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {}
      <section id="how-to-use" className="px-6 py-20 bg-[#0B0F14] border-t border-[#1A1F26]">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="mb-16">
              <h2 className="text-2xl font-semibold text-white mb-2">Workflow</h2>
              <p className="text-zinc-500">
                From abstraction to artifact.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {}
            <ScrollReveal delay={100}>
              <div className="p-6 rounded-xl border border-zinc-800 bg-[#0F141B] hover:border-zinc-700 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded bg-[#1A1F26] flex items-center justify-center border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
                    <Box className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-zinc-600">01</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">Select Template</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Initialize your project with an ERC-20, NFT, or Custom Schema standard. Pre-configured for security compliance.
                </p>
              </div>
            </ScrollReveal>

            {}
            <ScrollReveal delay={200}>
              <div className="p-6 rounded-xl border border-zinc-800 bg-[#0F141B] hover:border-zinc-700 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded bg-[#1A1F26] flex items-center justify-center border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-zinc-600">02</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">Visual Composition</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Assemble logic blocks. The visual engine enforces type safety and logical consistency before code generation.
                </p>
              </div>
            </ScrollReveal>

            {}
            <ScrollReveal delay={300}>
              <div className="p-6 rounded-xl border border-zinc-800 bg-[#0F141B] hover:border-zinc-700 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded bg-[#1A1F26] flex items-center justify-center border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-zinc-600">03</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">Network Deployment</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Direct RPC connection to Celo Mainnet or Alfajores. Handles gas estimation and transaction signing.
                </p>
              </div>
            </ScrollReveal>

            {}
            <ScrollReveal delay={400}>
              <div className="p-6 rounded-xl border border-zinc-800 bg-[#0F141B] hover:border-zinc-700 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded bg-[#1A1F26] flex items-center justify-center border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-zinc-600">04</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">Client Generation</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Automatically synthesize strict TypeScript bindings and a Next.js scaffolding for your contract.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {}
          <ScrollReveal delay={200}>
            <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-[#1A1F26]">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Security Standard</h4>
                  <p className="text-xs text-zinc-500 mt-1">OpenZeppelin compliance baked into every primitive.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1">
                  <Cpu className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">WASM Native</h4>
                  <p className="text-xs text-zinc-500 mt-1">Optimization pipeline ensures minimal bytecode footprint.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1">
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Testnet First</h4>
                  <p className="text-xs text-zinc-500 mt-1">Sandboxed environment for risk-free deployment testing.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {}
      <footer className="border-t border-[#1A1F26] bg-[#0B0F14] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="w-5 h-5 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold">B</div>
            <span className="text-xs font-semibold">Block Builder Documentation</span>
          </div>
          <div className="text-[10px] text-zinc-600 font-mono">
            VERSION: <span className="text-zinc-400">1.0.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
