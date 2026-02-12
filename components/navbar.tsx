"use client"

import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { Download, Play, Eye, FolderOpen, Wallet, Menu, X, Rocket, Zap, BookOpen, Layers, Sparkles, Terminal } from "lucide-react"
import { useState, useEffect } from "react"
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20)
  })

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none pt-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          width: scrolled ? "min(90%, 60rem)" : "min(95%, 80rem)",
          paddingTop: scrolled ? "0.5rem" : "0.75rem",
          paddingBottom: scrolled ? "0.5rem" : "0.75rem",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        className={cn(
          "pointer-events-auto flex items-center justify-between px-4 transition-all duration-300 ease-out",
          "bg-[#0F141B]/80 backdrop-blur-md border border-white/5 shadow-xl shadow-black/20",
          "rounded-xl"
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group mr-6 pr-6 border-r border-white/5 h-8">
          <div className="w-6 h-6 flex items-center justify-center bg-zinc-100 rounded-[4px] text-black font-bold text-xs group-hover:bg-white transition-colors">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-200 leading-none tracking-tight">Block Builder</span>
            <AnimatePresence>
              {!scrolled && (
                <motion.span
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5"
                >
                  Infrastructure
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center flex-1">
          <NavLinks scrolled={scrolled} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 pl-4 ml-2">
          <div className="hidden md:flex items-center gap-1 border-r border-white/5 pr-4 mr-2">
            <Link href="/docs">
              <button className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded hover:bg-white/5">
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </Link>
            <button className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded hover:bg-white/5">
              <Terminal className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link href="/builder">
            <button className={cn(
              "flex items-center gap-2 bg-[#0055eb] hover:bg-[#0044c2] text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm active:translate-y-px",
              scrolled ? "px-3 py-1.5" : "px-4 py-2"
            )}>
              <span>Launch App</span>
              <ArrowRightIcon className="w-3 h-3 opacity-70" />
            </button>
          </Link>
        </div>
      </motion.nav>
    </div>
  )
}

function NavLinks({ scrolled }: { scrolled: boolean }) {
  const links = [
    { label: "Features", href: "#features" },
    { label: "Templates", href: "#templates" },
    { label: "Enterprise", href: "#enterprise" },
  ]

  return (
    <div className="flex items-center gap-6">
      {links.map((link) => (
        <Link key={link.label} href={link.href} className="group relative py-1">
          <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors">
            {link.label}
          </span>
          <span className="absolute bottom-0 left-0 w-full h-px bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left opacity-30" />
        </Link>
      ))}
    </div>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
