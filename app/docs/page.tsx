"use client";

import { ArrowLeft, Code2, Rocket, Sparkles, Shield, Zap, Github, Twitter } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CELO BUILDER
              </span>
            </Link>

            <Link
              href="/builder"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-6">
              <span className="text-cyan-400 text-sm font-semibold">📚 Documentation</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 bg-clip-text text-transparent">
                Getting Started with CELO Builder
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Learn how to build, deploy, and manage your smart contracts with our intuitive no-code platform.
              From zero to deployed dApp in minutes.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className="px-6 py-20 relative">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                How to Use CELO Builder
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Follow these simple steps to create and deploy your smart contract
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column: Steps */}
            <div className="space-y-8">
              {/* Step 1 */}
              <ScrollReveal delay={100}>
                <div className="group relative p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 backdrop-blur transition-all hover:shadow-xl hover:shadow-cyan-500/10">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      1
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        Choose Your Contract Type
                      </h3>
                      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        Select from ERC-20 tokens, NFT collections, or create a custom smart contract.
                        Each template comes with pre-built security features and best practices.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Step 2 */}
              <ScrollReveal delay={200}>
                <div className="group relative p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 bg-slate-900/50 backdrop-blur transition-all hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      2
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        Drag & Drop Components
                      </h3>
                      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        Add functionality by dragging blocks into your contract. Include features like minting,
                        burning, pausing, and access control with just a few clicks.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Step 3 */}
              <ScrollReveal delay={300}>
                <div className="group relative p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 bg-slate-900/50 backdrop-blur transition-all hover:shadow-xl hover:shadow-purple-500/10">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-fuchsia-600 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      3
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                        Deploy to Celo Network
                      </h3>
                      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        Connect your MetaMask wallet and deploy directly to Celo Mainnet or Alfajores Testnet.
                        Our platform handles all the complexity of deployment for you.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Step 4 */}
              <ScrollReveal delay={400}>
                <div className="group relative p-6 rounded-2xl border border-slate-800 hover:border-fuchsia-500/50 bg-slate-900/50 backdrop-blur transition-all hover:shadow-xl hover:shadow-fuchsia-500/10">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-500 to-pink-600 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      4
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-400 transition-colors">
                        Generate & Download Frontend
                      </h3>
                      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        Automatically generate a production-ready Next.js frontend for your contract.
                        Download the code and deploy to Vercel or any hosting platform in seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Screenshots */}
            <div className="space-y-6">
              <ScrollReveal delay={500}>
                <div className="group relative rounded-2xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 backdrop-blur overflow-hidden transition-all">
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    <img
                      src="/Bulder page.png"
                      alt="CELO Builder Interface"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                    <p className="text-white font-semibold">Builder Interface</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={600}>
                <div className="group relative rounded-2xl border border-slate-800 hover:border-blue-500/50 bg-slate-900/50 backdrop-blur overflow-hidden transition-all">
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    <img
                      src="/Project Section.png"
                      alt="Project Management"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                    <p className="text-white font-semibold">Project Management</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={700}>
                <div className="group relative rounded-2xl border border-slate-800 hover:border-purple-500/50 bg-slate-900/50 backdrop-blur overflow-hidden transition-all">
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    <img
                      src="/Landing page.png"
                      alt="Landing Page"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                    <p className="text-white font-semibold">Landing Page</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Pro Tips */}
          <ScrollReveal delay={200}>
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                💡 Pro Tips
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-cyan-500/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Security First</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    All contracts are built using OpenZeppelin's battle-tested standards
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-blue-500/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Code2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Learn Solidity</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    View the generated code to understand how smart contracts work
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-purple-500/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Test First</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Always deploy to Alfajores testnet before going to mainnet
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Separator */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* Developer Section */}
      <section id="developer" className="px-6 py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/20 mb-6">
                <span className="text-cyan-400 text-sm font-semibold">👨‍💻 Meet the Creator</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 bg-clip-text text-transparent">
                About the Developer
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Built with passion for the Web3 community
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column: Developer Photo */}
            <ScrollReveal delay={200}>
              <div className="group relative">
                <div className="relative rounded-2xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 backdrop-blur p-8 transition-all">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative text-center">
                    {/* Developer Photo */}
                    <div className="aspect-square max-w-md mx-auto mb-6 rounded-2xl overflow-hidden border-4 border-cyan-500/20 group-hover:border-cyan-500/50 transition-all">
                      <img
                        src="/developer-photo.jpg"
                        alt="Rohit Kumar - Full-Stack Blockchain Developer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Column: Developer Info */}
            <div className="space-y-6">
              <ScrollReveal delay={400}>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Rohit Kumar Kundu</h3>
                  <p className="text-xl text-cyan-400 mb-4">Full-Stack Blockchain Developer</p>
                  <p className="text-slate-400 leading-relaxed">
                    Passionate about making Web3 accessible to everyone. Building tools that bridge
                    the gap between traditional development and blockchain technology.
                  </p>
                </div>
              </ScrollReveal>

              {/* Info Cards */}
              <div className="space-y-4">
                <ScrollReveal delay={500}>
                  <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-cyan-500/50 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Code2 className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">Expertise</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Next.js, React, TypeScript, Solidity, Smart Contract Development, Web3 Integration
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={600}>
                  <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-blue-500/50 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Rocket className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">Mission</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          To democratize smart contract development and reduce the barrier to entry for Web3 innovation
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={700}>
                  <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-fuchsia-500/50 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5 text-fuchsia-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">Vision</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Making blockchain technology accessible to developers worldwide through intuitive tools
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Social Links */}
              <ScrollReveal delay={800}>
                <div className="flex gap-4 pt-4">
                  <a
                    href="https://github.com/ROHIT8759"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all group"
                  >
                    <Github className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
                    <span className="text-white font-semibold">GitHub</span>
                  </a>

                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group"
                  >
                    <Twitter className="w-5 h-5 text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                    <span className="text-white font-semibold">Twitter</span>
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Quote */}
          <ScrollReveal delay={300}>
            <div className="relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 rounded-full blur-3xl" />

              <div className="relative">
                <p className="text-xl text-slate-300 italic leading-relaxed text-center max-w-4xl mx-auto">
                  "My goal is to enable every developer, regardless of their frontend expertise,
                  to launch complete dApps on Celo. CELO Builder is just the beginning of making
                  Web3 development as easy as Web2."
                </p>
                <p className="text-cyan-400 font-bold text-center mt-6">
                  — Rohit Kumar Kundu
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Project Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <ScrollReveal delay={100}>
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur text-center hover:border-cyan-500/50 hover:-translate-y-1 transition-all group">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform inline-block">
                  Open Source
                </div>
                <p className="text-slate-400 text-sm">MIT Licensed</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur text-center hover:border-blue-500/50 hover:-translate-y-1 transition-all group">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform inline-block">
                  Built for Celo
                </div>
                <p className="text-slate-400 text-sm">Native Integration</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur text-center hover:border-purple-500/50 hover:-translate-y-1 transition-all group">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform inline-block">
                  TypeScript
                </div>
                <p className="text-slate-400 text-sm">Type-Safe Code</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur text-center hover:border-fuchsia-500/50 hover:-translate-y-1 transition-all group">
                <div className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform inline-block">
                  Next.js 15
                </div>
                <p className="text-slate-400 text-sm">Latest Tech</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400">
            © 2025 CELO Builder. Built with ❤️ for the Celo Community
          </p>
        </div>
      </footer>
    </div>
  );
}
