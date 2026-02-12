"use client"

import Link from "next/link"
import { ArrowRight, Droplet, Clock, Info, Sparkles } from "lucide-react"

export default function FaucetInfo() {
  return (
    <section className="px-6 py-16 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-fuchsia-500/5 blur-3xl animate-pulse pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {}
        <div className="group rounded-2xl p-8 shadow-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 hover:shadow-cyan-500/20 hover:scale-[1.01] backdrop-blur-sm">
          {}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-start gap-4">
              {}
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/30 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-cyan-500/30">
                  <Droplet className="w-7 h-7 text-cyan-400 group-hover:animate-pulse" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 group-hover:from-cyan-300 group-hover:to-blue-400 transition-all duration-300">
                  Celo Faucet
                </h2>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Get test CELO for deploying and testing on Sepolia.
                </p>
              </div>
            </div>

            <Link
              href="https://faucet.celo.org/celo-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center gap-2 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></span>
              <Sparkles size={18} className="relative animate-spin-slow" />
              <span className="relative">Visit Faucet</span>
              <ArrowRight size={18} className="relative group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {}
            <div className="group/card relative p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-cyan-500/50 rounded-xl transition-all duration-300 hover:transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500 transform scale-y-0 group-hover/card:scale-y-100 transition-transform duration-300 origin-top"></div>

              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-300">
                  <Info className="w-6 h-6 text-cyan-400 group-hover/card:animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover/card:text-cyan-400 transition-colors">
                  What is the Faucet?
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover/card:text-slate-300 transition-colors">
                  The Celo faucet dispenses a small amount of test CELO so you can deploy contracts and test transactions on the Sepolia testnet.
                </p>
              </div>
            </div>

            {}
            <div className="group/card relative p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-fuchsia-500/50 rounded-xl transition-all duration-300 hover:transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-fuchsia-500/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-pink-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-400 to-pink-500 transform scale-y-0 group-hover/card:scale-y-100 transition-transform duration-300 origin-top"></div>

              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-300">
                  <Clock className="w-6 h-6 text-fuchsia-400 group-hover/card:animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover/card:text-fuchsia-400 transition-colors">
                  Rate Limits
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover/card:text-slate-300 transition-colors">
                  Faucets typically enforce limits per wallet or IP. If you hit limits, wait or try another address. Check the faucet page for current rules.
                </p>
              </div>
            </div>

            {}
            <div className="group/card relative p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all duration-300 hover:transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-500 transform scale-y-0 group-hover/card:scale-y-100 transition-transform duration-300 origin-top"></div>

              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-300">
                  <Droplet className="w-6 h-6 text-blue-400 group-hover/card:animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover/card:text-blue-400 transition-colors">
                  How to Claim
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover/card:text-slate-300 transition-colors">
                  Click the button below to open the official Celo faucet. Follow the on-screen instructions to request CELO for your wallet address.
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="relative text-center">
            <Link
              href="https://faucet.celo.org/celo-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="group/cta relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover/cta:translate-x-[200%] transition-transform duration-700"></span>
              <Droplet className="relative w-5 h-5 group-hover/cta:animate-bounce" />
              <span className="relative">Claim Your Free Test CELO</span>
              <ArrowRight size={20} className="relative group-hover/cta:translate-x-1 group-hover/cta:scale-110 transition-all" />
            </Link>

            {}
            <div className="absolute -top-2 -right-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-fuchsia-400 rounded-full animate-ping opacity-75 animation-delay-300"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
