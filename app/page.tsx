"use client";

import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Code2,
  Rocket,
  Github,
  Twitter,
  Shield,
  Blocks,
  Globe,
} from "lucide-react";
import { useDevice } from "@/lib/use-device"; // Device awareness

// Components
import { Navbar } from "@/components/navbar";
import FaucetInfo from "@/components/faucet-info";
import SectionDivider from "@/components/section-divider";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MultiChainSection } from "@/components/multi-chain-section";
import LiveGeneratorDemo from "@/components/live-generator-demo";
import HeroVisualization from "@/components/hero-visualization";

// Elite Components (Matte/Precision)
import { AnimatedGridPattern } from "@/components/reactbits/AnimatedGridPattern";
import { BentoGrid, BentoGridItem } from "@/components/reactbits/BentoGrid";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { ShinyButton } from "@/components/reactbits/ShinyButton";
import { TextReveal } from "@/components/reactbits/TextReveal";
import { BorderBeam } from "@/components/reactbits/BorderBeam";

export default function Home() {
  const { isMobile } = useDevice();

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Structural Grid Background (No Beams/Blobs) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatedGridPattern
          numSquares={50}
          maxOpacity={0.05}
          duration={5}
          repeatDelay={2}
          className="text-zinc-500/100 mask-[radial-gradient(1500px_circle_at_center,white,transparent)]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/80 to-background"></div>
      </div>

      <Navbar />

      {/* Asymmetric Editorial Hero */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto z-10 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: Editorial Content (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <ScrollReveal>
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">Stellar Infrastructure // Soroban</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight mb-8 leading-[1.1] text-zinc-100">
              Soroban Contracts <br />
              <span className="text-zinc-500">Engineered Visually.</span>
            </h1>

            <p className="text-lg text-zinc-400 max-w-xl mb-10 leading-relaxed font-light">
              The infrastructure standard for no-code Stellar development.
              Deploy audited, enterprise-grade WASM logic to Testnet & Mainnet without maintaining boilerplate.
            </p>

            <div className="flex flex-row items-center gap-4">
              <Link href="/builder">
                <ShinyButton className="h-10 px-6 text-sm">
                  Launch Builder
                  <ArrowRight className="ml-2 w-3 h-3" />
                </ShinyButton>
              </Link>
              <Link href="/docs">
                <button className="h-10 px-6 rounded-md border border-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-900 transition-colors">
                  Documentation
                </button>
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Right: Technical Visualization (Desktop Only) */}
        {!isMobile && (
          <div className="lg:col-span-5 relative mt-12 lg:mt-0">
            <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden aspect-square lg:aspect-[4/3]">
              {/* Precision Border Beam */}
              <BorderBeam size={150} duration={10} delay={0} colorFrom="#6366f1" colorTo="#818cf8" borderWidth={1} />
              <div className="absolute inset-0 opacity-80">
                <HeroVisualization />
              </div>
              {/* Technical Overlay */}
              <div className="absolute bottom-4 left-4 font-mono text-[10px] text-zinc-600">
                <div>NETWORK: STELLAR_MAINNET</div>
                <div>RPC_LATENCY: 12ms</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Precision Bento Grid */}
      <section id="features" className="py-32 px-6 relative z-10 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-medium text-zinc-100 mb-4">Core Infrastructure</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Built for scale. Our visual engine compiles to optimized Rust/WASM using standard factory patterns.
              </p>
            </div>
          </div>

          <BentoGrid className="max-w-none mx-0">
            <BentoGridItem
              title="Soroban Visual Engine"
              description="Compose complex WASM logic flows."
              header={<div className="flex flex-1 w-full h-full min-h-[8rem] bg-zinc-900/50 border-b border-zinc-800" />}
              icon={<Zap className="h-4 w-4 text-zinc-500" />}
              className="lg:col-span-2 border border-zinc-800 bg-zinc-950"
            />
            <BentoGridItem
              title="Instant Propagation"
              description="Direct RPC ledger submission."
              header={<div className="flex flex-1 w-full h-full min-h-[8rem] bg-zinc-900/50 border-b border-zinc-800" />}
              icon={<Rocket className="h-4 w-4 text-zinc-500" />}
              className="lg:col-span-1 border border-zinc-800 bg-zinc-950"
            />
            <BentoGridItem
              title="Audit-Grade Security"
              description="Automated formal verification."
              header={<div className="flex flex-1 w-full h-full min-h-[8rem] bg-zinc-900/50 border-b border-zinc-800" />}
              icon={<Shield className="h-4 w-4 text-zinc-500" />}
              className="lg:col-span-1 border border-zinc-800 bg-zinc-950"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Text Reveal - Editorial Statement */}
      <section className="py-24 relative z-10 w-full bg-zinc-950 border-y border-zinc-900">
        <TextReveal text="We are building the operating system for decentralized finance on Stellar. Precision tools for serious builders." className="min-h-[100vh] font-medium" />
      </section>

      {/* Legacy Sections (Preserved but integrated) */}
      <MultiChainSection />
      <LiveGeneratorDemo />
      <SectionDivider />

      {/* Footer (Minimal) */}
      <footer className="relative border-t border-zinc-800 py-16 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
          <div className="md:col-span-2">
            <span className="font-semibold text-zinc-100 block mb-4">Block Builder</span>
            <p className="text-zinc-500 max-w-xs">
              Enterprise-grade visual smart contract development platform for Stellar.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-zinc-100">Product</h4>
            <ul className="space-y-2 text-zinc-600">
              <li><Link href="/builder" className="hover:text-indigo-400 transition-colors">Builder</Link></li>
              <li><Link href="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-zinc-100">Connect</h4>
            <div className="flex gap-4 text-zinc-600">
              <Github className="w-5 h-5 hover:text-zinc-100 cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 hover:text-zinc-100 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
