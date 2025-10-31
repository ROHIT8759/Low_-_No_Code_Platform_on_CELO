"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Zap, Code2, Rocket, Github, Twitter, Sparkles, Shield, Clock } from "lucide-react"
import FaucetInfo from "../components/faucet-info"
import SectionDivider from "../components/section-divider"

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [isVisible, end, duration])

  return (
    <div ref={ref} className="text-4xl font-bold mb-2">
      {count}{suffix}
    </div>
  )
}

// Scroll Reveal Component
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Navigation - Enhanced with Animations */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Enhanced 3D Effect */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/50 blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-cyan-500/50">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
              </div>
              <span className="font-bold text-xl text-white tracking-tight group-hover:text-cyan-400 transition-colors">CELO BUILDER</span>
            </Link>

            {/* Center Navigation Links - Enhanced */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#about"
                className="relative text-slate-300 hover:text-white transition-colors font-medium group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="#features"
                className="relative text-slate-300 hover:text-white transition-colors font-medium group"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="#faucet"
                className="relative text-slate-300 hover:text-white transition-colors font-medium group"
              >
                Faucet
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/docs"
                className="relative text-slate-300 hover:text-white transition-colors font-medium group"
              >
                Docs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Right Side - Enhanced Social & CTA */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all hover:scale-110 hover:rotate-6"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all hover:scale-110 hover:rotate-6"
              >
                <Twitter size={20} />
              </a>
              <Link
                href="/builder"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                <span className="relative flex items-center gap-2">
                  Launch App
                  <Sparkles size={16} className="group-hover:animate-spin" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced with Parallax & Animations */}
      <section className="relative px-6 pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements with Parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
              animationDelay: '1s'
            }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)`,
              animationDelay: '2s'
            }}
          ></div>

          {/* Floating Elements */}
          <div className="absolute top-40 right-1/4 animate-bounce" style={{ animationDuration: '3s' }}>
            <Code2 className="w-8 h-8 text-cyan-500/30" />
          </div>
          <div className="absolute bottom-40 left-1/4 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
            <Rocket className="w-10 h-10 text-fuchsia-500/30" />
          </div>
          <div className="absolute top-1/3 right-1/3 animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>
            <Shield className="w-6 h-6 text-blue-500/30" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Animated Badge with Pulse */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/20 rounded-full mb-8 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse absolute"></span>
            <span className="text-sm text-cyan-400 font-medium">No-Code Smart Contract Platform</span>
            <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
          </div>

          {/* Main Heading - Enhanced Typography Animation */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 text-transparent bg-clip-text inline-block animate-slide-in-left">
              Build Smart Contracts
              <br /><h4 className="text-8xl ">
                Without Code
              </h4>
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 text-transparent bg-clip-text inline-block animate-slide-in-right relative animate-neon-glow">
              Without Code
              <span className="absolute -right-2 -top-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </span>
          </h1>

          {/* Subtitle - Enhanced with Animation */}
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="hover:text-slate-300 transition-colors">Drag and drop smart contract components.</span>{" "}
            <span className="hover:text-slate-300 transition-colors">Generate Solidity code automatically.</span>{" "}
            <span className="hover:text-slate-300 transition-colors">Deploy to Celo in minutes.</span>
            <span className="block mt-2 text-slate-500 font-semibold hover:text-cyan-400 transition-colors">No coding experience required.</span>
          </p>

          {/* CTA Buttons - Enhanced */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/builder"
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center gap-3 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
              <span className="relative">Start Building Free</span>
              <ArrowRight size={20} className="relative group-hover:translate-x-1 group-hover:scale-110 transition-all" />
            </Link>
            <a
              href="#features"
              className="group px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-bold rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 flex items-center gap-2"
            >
              <span>Explore Features</span>
              <Clock size={20} className="group-hover:rotate-45 transition-transform" />
            </a>
          </div>

          {/* Stats - Enhanced with Animated Counters */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 pt-20 border-t border-slate-800/50">
            <ScrollReveal delay={600}>
              <div className="text-center group cursor-default hover:transform hover:scale-110 transition-all">
                <AnimatedCounter end={17} suffix="+" />
                <div className="text-sm text-slate-500 group-hover:text-cyan-400 transition-colors">Smart Contract Blocks</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={700}>
              <div className="text-center group cursor-default hover:transform hover:scale-110 transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text mb-2">1-Click</div>
                <div className="text-sm text-slate-500 group-hover:text-blue-400 transition-colors">Deploy to Celo</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={800}>
              <div className="text-center group cursor-default hover:transform hover:scale-110 transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-500 text-transparent bg-clip-text mb-2">Auto</div>
                <div className="text-sm text-slate-500 group-hover:text-fuchsia-400 transition-colors">Code Generation</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with Scroll Animations */}
      <section id="features" className="px-6 py-20 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 hover:scale-105 transition-transform inline-block">
                Why Choose Celo Builder?
              </h2>
              <p className="text-xl text-slate-400 hover:text-slate-300 transition-colors">
                Everything you need to build, deploy, and manage smart contracts
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1 - Enhanced 3D Effect */}
            <ScrollReveal delay={100}>
              <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-800/50 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Zap className="w-7 h-7 text-cyan-400 group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Lightning Fast</h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    Build complex dApps in minutes, not weeks. No blockchain expertise needed. Just drag, drop, and deploy.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Feature Card 2 - Enhanced 3D Effect */}
            <ScrollReveal delay={200}>
              <div className="group relative p-8 rounded-2xl bg-linear-to-br from-slate-900/50 to-slate-800/50 border border-slate-800/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Code2 className="w-7 h-7 text-blue-400 group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Learn by Doing</h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    See the generated Solidity code in real-time and learn how smart contracts work under the hood.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Feature Card 3 - Enhanced 3D Effect */}
            <ScrollReveal delay={300}>
              <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-800/50 hover:border-fuchsia-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-fuchsia-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Rocket className="w-7 h-7 text-fuchsia-400 group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-400 transition-colors">Deploy Instantly</h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    One-click deployment to Celo Mainnet or Testnet with MetaMask integration and auto-generated frontend.
                  </p>
                </div>
              </div>
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

      {/* CTA Section - Enhanced with Animations */}
      <section className="px-6 py-24 relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-fuchsia-500/10 blur-3xl animate-pulse"></div>

        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8 animate-bounce">
              <span className="text-sm text-cyan-400 font-medium">ðŸš€ Ready to Launch?</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-105 transition-transform inline-block">
              Start Building Your dApp Today
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto hover:text-slate-300 transition-colors">
              Join developers building the future of decentralized applications on Celo.
              No credit card required. Start for free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/builder"
                className="group relative px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center gap-3 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                <span className="relative">Launch Builder</span>
                <ArrowRight size={20} className="relative group-hover:translate-x-1 group-hover:scale-110 transition-all" />
              </Link>
              <Link
                href="/docs"
                className="group px-10 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-bold rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 flex items-center gap-2"
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
      <footer className="relative border-t border-slate-800/50 py-12 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>

        <ScrollReveal>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400/50 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <span className="text-white font-bold text-xl">C</span>
                    </div>
                  </div>
                  <span className="font-bold text-xl text-white">CELO BUILDER</span>
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
                    className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-cyan-500/20 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all hover:scale-110 hover:rotate-6"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-blue-500/20 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all hover:scale-110 hover:rotate-6"
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
                    <Link href="/#about" className="text-slate-400 hover:text-cyan-400 transition-colors">About</Link>
                  </li>
                  <li>
                    <Link href="/#features" className="text-slate-400 hover:text-cyan-400 transition-colors">Features</Link>
                  </li>
                  <li>
                    <Link href="/builder" className="text-slate-400 hover:text-cyan-400 transition-colors">Builder</Link>
                  </li>
                  <li>
                    <Link href="/docs" className="text-slate-400 hover:text-cyan-400 transition-colors">Documentation</Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-bold text-white mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://docs.celo.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      Celo Docs
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://faucet.celo.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      Testnet Faucet
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://explorer.celo.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      Block Explorer
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-400 text-sm">
                Â© 2025 CELO Builder. Built with â¤ï¸ for the Celo Community.
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
