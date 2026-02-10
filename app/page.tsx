"use client"

import { useEffect, useRef, useState, useCallback, memo } from "react"
import Link from "next/link"
import { ArrowRight, Zap, Code2, Rocket, Github, Twitter, Sparkles, Shield, Menu, X, Blocks, Layers, Globe, ChevronDown } from "lucide-react"
import dynamic from "next/dynamic"

// Components
import FaucetInfo from "../components/faucet-info"
import SectionDivider from "../components/section-divider"
import { ScrollReveal, ScrollProgress } from "../components/scroll-reveal"
import NetworkBackground from "../components/network-background"
import GrainOverlay from "../components/grain-overlay"
import TiltCard from "../components/TiltCard"
import ShineButton from "../components/ShineButton"

// New Components
import HeroVisualization from "@/components/hero-visualization"
import { MultiChainSection } from "@/components/multi-chain-section"
import LiveGeneratorDemo from "@/components/live-generator-demo"

// Legacy components kept for compatibility if needed (but HeroVisualization uses its own 3D scene)
const Hero3DObject = dynamic(() => import("../components/hero-3d-object"), { ssr: false })

// Optimized Animated Counter Component with memo
const AnimatedCounter = memo(function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          observer.unobserve(currentRef)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    let animationId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        animationId = requestAnimationFrame(step)
      }
    }
    animationId = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationId)
  }, [isVisible, end, duration])

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
      {count}{suffix}
    </div>
  )
})

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const ticking = useRef(false)

  // Throttled mouse move handler for better performance
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth - 0.5) * 20,
          y: (e.clientY / window.innerHeight - 0.5) * 20,
        })
        ticking.current = false
      })
      ticking.current = true
    }
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 overflow-hidden relative">
      <ScrollProgress />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/5 animate-fade-in-down supports-backdrop-filter:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/50 blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse"></div>
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-cyan-500/50">
                  <span className="text-white font-bold text-lg sm:text-xl">B</span>
                </div>
              </div>
              <span className="font-bold text-lg sm:text-xl text-white tracking-tight group-hover:text-cyan-400 transition-colors">Block Builder</span>
            </Link>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="#about" className="relative text-slate-300 hover:text-white transition-colors font-medium group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#features" className="relative text-slate-300 hover:text-white transition-colors font-medium group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#faucet" className="relative text-slate-300 hover:text-white transition-colors font-medium group">
                Faucet
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/docs" className="relative text-slate-300 hover:text-white transition-colors font-medium group">
                Docs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/builder"
                className="hover-shimmer hover-pulse-glow group relative px-4 sm:px-6 py-2 sm:py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 overflow-hidden text-sm sm:text-base"
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                <span className="relative flex items-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline">Launch App</span>
                  <span className="sm:hidden">Build</span>
                  <Sparkles size={14} className="group-hover:animate-spin sm:w-4 sm:h-4" />
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-800/50 pt-4 animate-fade-in-down">
              <div className="flex flex-col gap-3">
                <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2">About</Link>
                <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2">Features</Link>
                <Link href="#faucet" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2">Faucet</Link>
                <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2">Docs</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section Replaced with Visualization */}
      <HeroVisualization />

      {/* How It Works Section */}
      <section id="about" className="px-4 sm:px-6 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400 font-medium">Simple 3-Step Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Build production-ready smart contracts in minutes, not weeks
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines - Desktop only */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-linear-to-r from-cyan-500/50 via-fuchsia-500/50 to-cyan-500/50 -translate-y-1/2"></div>

            {/* Step 1 */}
            <ScrollReveal delay={100} variant="3d-card">
              <TiltCard>
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative h-full bg-slate-900/40 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all">
                    <div className="w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-cyan-500/20">
                      <Blocks className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-125 transition-transform shadow-lg shadow-cyan-500/40">1</div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Drag & Drop Blocks</h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                      Choose from 17+ pre-built smart contract blocks including ERC-20, NFT, staking, governance, and more.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal delay={200} variant="3d-card">
              <TiltCard>
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-fuchsia-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative h-full bg-slate-900/40 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 hover:border-fuchsia-500/50 transition-all">
                    <div className="w-16 h-16 bg-linear-to-br from-fuchsia-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-fuchsia-500/20">
                      <Code2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-125 transition-transform shadow-lg shadow-fuchsia-500/40">2</div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-400 transition-colors">Auto-Generate Code</h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                      Watch your Solidity code generate in real-time. Learn how contracts work as you build them.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={300} variant="3d-card">
              <TiltCard>
                <div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative h-full bg-slate-900/40 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 hover:border-green-500/50 transition-all">
                    <div className="w-16 h-16 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-green-500/20">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-125 transition-transform shadow-lg shadow-green-500/40">3</div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">Deploy & Launch</h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                      One-click deploy to Celo Mainnet or Testnet. Get auto-generated frontend and verification.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Multi-Chain Section */}
      <MultiChainSection />

      {/* Live Generator Demo */}
      <LiveGeneratorDemo />

      {/* Separator */}
      <SectionDivider />

      {/* Features Section */}
      <section id="features" className="px-4 sm:px-6 py-12 sm:py-20 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant="blur">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 hover:scale-105 transition-transform inline-block">
                Why Choose Block Builder?
              </h2>
              <p className="text-base sm:text-xl text-slate-400 hover:text-slate-300 transition-colors px-4">
                Everything you need to build, deploy, and manage smart contracts
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Feature Card 1 */}
            <ScrollReveal delay={100} variant="scale">
              <TiltCard>
                <div className="group relative h-full p-6 sm:p-8 rounded-2xl bg-linear-to-br from-slate-900/40 to-slate-800/40 border border-slate-800/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all hover-icon-spin shadow-lg shadow-cyan-500/10">
                      <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-cyan-400 transition-colors">Lightning Fast</h3>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      Build complex dApps in minutes, not weeks. No blockchain expertise needed. Just drag, drop, and deploy.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Feature Card 2 */}
            <ScrollReveal delay={200} variant="scale">
              <TiltCard>
                <div className="group relative h-full p-6 sm:p-8 rounded-2xl bg-linear-to-br from-slate-900/40 to-slate-800/40 border border-slate-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all hover-icon-spin shadow-lg shadow-blue-500/10">
                      <Code2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-blue-400 transition-colors">Learn by Doing</h3>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      See the generated Solidity code in real-time and learn how smart contracts work under the hood.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Feature Card 3 */}
            <ScrollReveal delay={300} variant="scale">
              <TiltCard>
                <div className="group relative h-full p-6 sm:p-8 rounded-2xl bg-linear-to-br from-slate-900/40 to-slate-800/40 border border-slate-800/50 hover:border-fuchsia-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-fuchsia-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-linear-to-br from-fuchsia-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all hover-icon-spin shadow-lg shadow-fuchsia-500/10">
                      <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-fuchsia-400 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-fuchsia-400 transition-colors">Deploy Instantly</h3>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      One-click deployment to Celo Mainnet or Testnet with MetaMask integration and auto-generated frontend.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Feature Card 4 - Security */}
            <ScrollReveal delay={400} variant="scale">
              <TiltCard>
                <div className="group relative h-full p-6 sm:p-8 rounded-2xl bg-linear-to-br from-slate-900/40 to-slate-800/40 border border-slate-800/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all hover-icon-spin shadow-lg shadow-green-500/10">
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-green-400 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-green-400 transition-colors">Battle-Tested</h3>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      Built with security best practices. Includes pausable, whitelist, blacklist, multisig, and timelock features.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Feature Card 5 - Global */}
            <ScrollReveal delay={500} variant="scale">
              <TiltCard>
                <div className="group relative h-full p-6 sm:p-8 rounded-2xl bg-linear-to-br from-slate-900/40 to-slate-800/40 border border-slate-800/50 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all hover-icon-spin shadow-lg shadow-yellow-500/10">
                      <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-yellow-400 transition-colors">Celo Native</h3>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      Built specifically for Celo blockchain. Support for both Mainnet and Alfajores Testnet with low gas fees.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Feature Card 6 - Blocks */}
            <ScrollReveal delay={600} variant="scale">
              <TiltCard>
                <div className="group relative h-full p-6 sm:p-8 rounded-2xl bg-linear-to-br from-slate-900/40 to-slate-800/40 border border-slate-800/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all hover-icon-spin shadow-lg shadow-purple-500/10">
                      <Blocks className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-purple-400 transition-colors">17+ Block Types</h3>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      ERC-20, NFT, mint, burn, stake, withdraw, voting, airdrop, snapshot, royalty, permit and more.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
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

      {/* CTA Section */}
      <section className="px-6 py-24 relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-fuchsia-500/10 blur-3xl animate-pulse"></div>

        <ScrollReveal variant="bounce">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8 animate-bounce">
              <span className="text-sm text-cyan-400 font-medium">🚀 Ready to Launch?</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-105 transition-transform inline-block">
              Start Building Your dApp Today
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto hover:text-slate-300 transition-colors">
              Join developers building the future of decentralized applications on Celo.
              No credit card required. Start for free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ShineButton href="/builder" className="w-full sm:w-auto px-10">
                <span>Launch Builder</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </ShineButton>
              <Link
                href="/docs"
                className="hover-lift group px-10 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-bold rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 flex items-center gap-2"
              >
                <span>View Documentation</span>
                <Sparkles size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Separator */}
      <SectionDivider />

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 px-6 overflow-hidden bg-black/40 backdrop-blur-xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-transparent"></div>

        <ScrollReveal>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400/50 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <span className="text-white font-bold text-xl">B</span>
                    </div>
                  </div>
                  <span className="font-bold text-xl text-white">Block Builder</span>
                </div>
                <p className="text-slate-400 mb-4 max-w-md">
                  Build, deploy, and manage smart contracts on Celo without writing a single line of code.
                  The easiest way to launch your Web3 project.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-magnetic w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-cyan-500/20 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all hover:rotate-6"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-magnetic w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-blue-500/20 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all hover:rotate-6"
                  >
                    <Twitter size={20} />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-white mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/#about" className="hover-underline text-slate-400 hover:text-cyan-400 transition-colors">About</Link>
                  </li>
                  <li>
                    <Link href="/#features" className="hover-underline text-slate-400 hover:text-cyan-400 transition-colors">Features</Link>
                  </li>
                  <li>
                    <Link href="/builder" className="hover-underline text-slate-400 hover:text-cyan-400 transition-colors">Builder</Link>
                  </li>
                  <li>
                    <Link href="/docs" className="hover-underline text-slate-400 hover:text-cyan-400 transition-colors">Documentation</Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-bold text-white mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="https://docs.celo.org" target="_blank" rel="noopener noreferrer" className="hover-underline text-slate-400 hover:text-cyan-400 transition-colors">Celo Docs</a>
                  </li>
                  <li>
                    <a href="https://faucet.celo.org" target="_blank" rel="noopener noreferrer" className="hover-underline text-slate-400 hover:text-cyan-400 transition-colors">Testnet Faucet</a>
                  </li>
                  <li>
                    <a href="https://explorer.celo.org" target="_blank" rel="noopener noreferrer" className="hover-underline text-slate-400 hover:text-cyan-400 transition-colors">Block Explorer</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-400 text-sm">
                © 2025 Block Builder. Built with ❤️ for the Celo Community.
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span>Powered by</span>
                <span className="font-semibold text-cyan-400">Celo</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </footer>
    </main>
  )
}
