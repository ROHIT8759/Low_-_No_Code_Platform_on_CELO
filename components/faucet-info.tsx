"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function FaucetInfo() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Card wrapper with subtle gradient border to add color */}
        <div className="rounded-2xl p-8 shadow-lg bg-card/60 border border-border" style={{ borderImage: 'linear-gradient(90deg, rgba(53,208,127,0.18), rgba(255,215,0,0.12)) 1' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Celo Faucet</h2>
              <p className="text-muted">Get test CELO for deploying and testing on Sepolia.</p>
            </div>
            <div>
              <Link
                href="https://faucet.celo.org/celo-sepolia"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium--dark btn-glow"
              >
                Visit Faucet
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-background border border-border rounded-lg" style={{ borderLeft: '4px solid rgba(53,208,127,0.12)' }}>
              <h3 className="text-lg font-semibold text-foreground mb-2">What is the Faucet?</h3>
              <p className="text-muted">The Celo faucet dispenses a small amount of test CELO so you can deploy contracts and test transactions on the Sepolia testnet.</p>
            </div>

            <div className="p-6 bg-background border border-border rounded-lg" style={{ borderLeft: '4px solid rgba(255,215,0,0.10)' }}>
              <h3 className="text-lg font-semibold text-foreground mb-2">One-time / Rate Limits</h3>
              <p className="text-muted">Faucets typically enforce limits per wallet or IP. If you hit limits, wait or try another address. Check the faucet page for current rate rules.</p>
            </div>

            <div className="p-6 bg-background border border-border rounded-lg" style={{ borderLeft: '4px solid rgba(99,102,241,0.10)' }}>
              <h3 className="text-lg font-semibold text-foreground mb-2">How to Claim</h3>
              <p className="text-muted">Click the button below to open the official Celo faucet. Follow the on-screen instructions to request CELO for your wallet address.</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="https://faucet.celo.org/celo-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium btn-glow inline-flex items-center gap-2"
            >
              Claim your Faucet <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
