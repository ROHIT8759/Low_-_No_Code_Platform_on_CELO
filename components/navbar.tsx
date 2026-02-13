"use client"

import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { Download, Play, Eye, FolderOpen, Wallet, Menu, X, Rocket, Zap, BookOpen, Layers, Sparkles, Terminal } from "lucide-react"
import { useState, useEffect } from "react"
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { MOTION_DURATION, MOTION_EASING } from "@/lib/motion"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20)
  })

  return (
    <div suppressHydrationWarning className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none pt-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          width: scrolled ? "min(90%, 60rem)" : "min(95%, 80rem)",
          paddingTop: scrolled ? "0.5rem" : "0.75rem",
          paddingBottom: scrolled ? "0.5rem" : "0.75rem",
        }}
        transition={{ 
          duration: MOTION_DURATION.normal / 1000, 
          ease: [0.16, 1, 0.3, 1]
        }}
        className={cn(
          "pointer-events-auto flex items-center justify-between px-4 relative",
          "bg-[var(--surface-1)]/80 backdrop-blur-md border border-white/[0.08]",
          "rounded-[var(--radius-md)] transition-infrastructure"
        )}
        style={{
          borderRadius: 'var(--radius-md)'
        }}
      >
        {}
        <Link href="/" className="flex items-center gap-3 group mr-6 pr-6 border-r border-[var(--border-outer)] h-8">
          <div className="w-6 h-6 flex items-center justify-center bg-[var(--surface-2)] rounded-[4px] text-white font-bold text-xs group-hover:bg-[var(--surface-3)] transition-colors">
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

        {}
        <div className="hidden md:flex items-center flex-1">
          <NavLinks scrolled={scrolled} />
        </div>

        {}
        <div className="flex items-center gap-3 pl-4 ml-2">
          <div className="hidden md:flex items-center gap-1 border-r border-[var(--border-outer)] pr-4 mr-2">
            <Link href="/docs">
              <button className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-infrastructure rounded hover:bg-[var(--surface-2)]">
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </Link>
            <button className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-infrastructure rounded hover:bg-[var(--surface-2)]">
              <Terminal className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link href="/builder">
            <button className={cn(
              "flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-[6px] transition-all shadow-sm active:translate-y-px",
              scrolled ? "px-3 py-1.5" : "px-4 py-2"
            )}>
              <span>Launch App</span>
              <ArrowRightIcon className="w-3 h-3 opacity-70" />
            </button>
          </Link>
        </div>

        {/* Bottom divider on scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION_DURATION.normal / 1000, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border-outer)]"
              data-testid="navbar-divider"
            />
          )}
        </AnimatePresence>
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
          <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-100 transition-infrastructure">
            {link.label}
          </span>
          <span className="absolute bottom-0 left-0 w-full h-px bg-white transform scale-x-0 group-hover:scale-x-100 transition-infrastructure origin-left opacity-30" />
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
