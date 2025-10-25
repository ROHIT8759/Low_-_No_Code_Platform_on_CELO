"use client"

import Link from "next/link"
import { ArrowRight, Zap, Code2, Rocket, Github, Twitter } from "lucide-react"
import FaucetInfo from "../components/faucet-info"
import SectionDivider from "../components/section-divider"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation - STATIK Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/50">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">CELO BUILDER</span>
            </Link>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#about" className="text-slate-300 hover:text-white transition-colors font-medium">
                About
              </Link>
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors font-medium">
                Features
              </Link>
              <Link href="#faucet" className="text-slate-300 hover:text-white transition-colors font-medium">
                Faucet
              </Link>
              <a
                href="https://docs.celo.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Docs
              </a>
            </div>

            {/* Right Side - Social & CTA */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
              >
                <Twitter size={20} />
              </a>
              <Link
                href="/builder"
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Design */}
      <section className="relative px-6 pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-green-400 font-medium">No-Code Smart Contract Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 text-transparent bg-clip-text">
              Build Smart Contracts
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-transparent bg-clip-text animate-pulse">
              Without Code
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Drag and drop smart contract components. Generate Solidity code automatically. Deploy to Celo in minutes.
            <span className="block mt-2 text-slate-500">No coding experience required.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/builder"
              className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-green-500/30 flex items-center gap-3"
            >
              <span>Start Building Free</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-bold rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
            >
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 pt-20 border-t border-slate-800/50">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text mb-2">17+</div>
              <div className="text-sm text-slate-500">Smart Contract Blocks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text mb-2">1-Click</div>
              <div className="text-sm text-slate-500">Deploy to Celo</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">Auto</div>
              <div className="text-sm text-slate-500">Code Generation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Celo Builder?
            </h2>
            <p className="text-xl text-slate-400">
              Everything you need to build, deploy, and manage smart contracts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-800/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
                <p className="text-slate-400 leading-relaxed">
                  Build complex dApps in minutes, not weeks. No blockchain expertise needed. Just drag, drop, and deploy.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-800/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Code2 className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Learn by Doing</h3>
                <p className="text-slate-400 leading-relaxed">
                  See the generated Solidity code in real-time and learn how smart contracts work under the hood.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-800/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Rocket className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Deploy Instantly</h3>
                <p className="text-slate-400 leading-relaxed">
                  One-click deployment to Celo Mainnet or Testnet with MetaMask integration and auto-generated frontend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <SectionDivider />

      {/* Faucet details */}
      <div id="faucet">
        <FaucetInfo />
      </div>

      {/* Separator */}
      <SectionDivider />
      {/* Separator */}
      <SectionDivider />

      {/* CTA Section */}
      <section className="px-6 py-24 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-8">
            <span className="text-sm text-green-400 font-medium">🚀 Ready to Launch?</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Building Your dApp Today
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join developers building the future of decentralized applications on Celo.
            No credit card required. Start for free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/builder"
              className="group px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-green-500/30 flex items-center gap-3"
            >
              <span>Launch Builder</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://docs.celo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-bold rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-slate-600"
            >
              View Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="font-bold text-xl text-white">CELO BUILDER</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                The easiest way to build, deploy, and manage smart contracts on Celo blockchain. No coding required.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/builder" className="text-slate-400 hover:text-white transition-colors">Builder</Link></li>
                <li><Link href="#features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#faucet" className="text-slate-400 hover:text-white transition-colors">Faucet</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="https://docs.celo.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://celo.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Celo Network</a></li>
                <li><a href="https://celoscan.io" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Block Explorer</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 Celo Builder. Built with ❤️ for the Celo community.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
