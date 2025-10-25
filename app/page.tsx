"use client"

import Link from "next/link"
import { ArrowRight, Zap, Code2, Rocket } from "lucide-react"
import FaucetInfo from "../components/faucet-info"
import SectionDivider from "../components/section-divider"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-background font-bold">C</span>
            </div>
            <span className="font-bold text-foreground">Celo Builder</span>
          </div>
          <Link href="/builder" className="btn-premium--dark btn-glow">
            Launch Builder
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Build Smart Contracts Without Code
          </h1>
          <p className="text-xl text-muted mb-8 text-balance">
            Drag and drop smart contract components, generate Solidity code automatically, and deploy to Celo in
            minutes. No coding experience required.
          </p>
          <Link href="/builder" className="btn-premium btn-glow">
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Celo Builder?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div
              className="p-6 rounded-lg"
              style={{
                background: 'linear-gradient(160deg, rgba(53,208,127,0.06), rgba(16,185,129,0.03))',
                border: '1px solid rgba(53,208,127,0.08)'
              }}
            >
              <div className="w-12 h-12 rounded-md flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(53,208,127,0.18), rgba(16,185,129,0.08))' }}>
                <Zap className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-muted">Build complex dApps in minutes, not weeks. No blockchain expertise needed.</p>
            </div>

            <div
              className="p-6 rounded-lg"
              style={{
                background: 'linear-gradient(160deg, rgba(255,215,0,0.05), rgba(255,215,0,0.02))',
                border: '1px solid rgba(255,215,0,0.06)'
              }}
            >
              <div className="w-12 h-12 rounded-md flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.16), rgba(255,200,0,0.06))' }}>
                <Code2 className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Learn by Doing</h3>
              <p className="text-muted">See the generated Solidity code and learn how smart contracts work.</p>
            </div>

            <div
              className="p-6 rounded-lg"
              style={{
                background: 'linear-gradient(160deg, rgba(99,102,241,0.05), rgba(79,70,229,0.03))',
                border: '1px solid rgba(99,102,241,0.06)'
              }}
            >
              <div className="w-12 h-12 rounded-md flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(79,70,229,0.06))' }}>
                <Rocket className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Deploy Instantly</h3>
              <p className="text-muted">One-click deployment to Celo Mainnet or Testnet with wallet integration.</p>
            </div>
          </div>
        </div>
      </section>

  {/* Separator */}
  <SectionDivider />

  {/* Faucet details (second-last) */}
  <FaucetInfo />

  {/* Separator */}
  <SectionDivider />

  {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to build?</h2>
          <p className="text-muted mb-8">Start creating your first smart contract dApp today.</p>
          <Link href="/builder" className="btn-premium btn-glow">
            Launch Builder <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  )
}
