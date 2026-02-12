"use client"

import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { Download, Play, Eye, FolderOpen, Wallet, Menu, X, Rocket, Zap, BookOpen, Layers, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  })

  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none">
      <motion.nav
        initial={{ width: "100%", maxWidth: "80rem" }} // max-w-7xl
        animate={{
          width: scrolled ? "fit-content" : "100%",
          maxWidth: scrolled ? "fit-content" : "80rem",
          y: scrolled ? 10 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "pointer-events-auto flex items-center justify-between px-4 py-2 mx-6",
          "bg-[#0B0F14]/80 backdrop-blur-xl border border-[#222730] shadow-2xl shadow-black/50",
          scrolled ? "rounded-full pr-2 pl-3" : "rounded-xl"
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group mr-4">
          <div className="relative w-8 h-8 flex items-center justify-center bg-[#1A1F26] border border-[#222730] rounded-lg group-hover:border-primary/50 transition-colors shadow-lg shadow-black/20">
            <span className="text-primary font-bold">B</span>
          </div>
          <AnimatePresence>
            {!scrolled && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-semibold text-zinc-200 ml-2">Block Builder</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center">
          <NavLinks scrolled={scrolled} />
        </div>

        {/* Right Actions */}
        <div className={cn("flex items-center gap-2 pl-2 ml-2", !scrolled && "border-l border-[#222730]/50")}>
          <AnimatePresence>
            {!scrolled && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex items-center gap-1"
              >
                <Link href="/docs">
                  <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-[#1A1F26]">
                    <BookOpen className="w-4 h-4" />
                  </button>
                </Link>
                <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-[#1A1F26]">
                  <span className="sr-only">Download</span>
                  <Download className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Link href="/builder">
            <button className={cn(
              "flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 group",
              scrolled ? "p-2 rounded-full aspect-square" : "px-4 py-2 rounded-lg"
            )}>
              <Rocket className={cn("w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", scrolled && "w-4 h-4")} />
              {!scrolled && <span>Launch App</span>}
            </button>
          </Link>
        </div>
      </motion.nav>
    </div>
  )
}

function NavLinks({ scrolled }: { scrolled: boolean }) {
  const links = [
    { label: "Features", href: "#features", icon: Zap },
    { label: "Templates", href: "#templates", icon: Layers },
    { label: "Showcase", href: "#showcase", icon: Sparkles },
  ]

  return (
    <div className="flex items-center gap-1">
      {links.map((link) => (
        <Link key={link.label} href={link.href}>
          <button className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1F26] rounded-md transition-all",
            scrolled && "px-2"
          )}>
            <link.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-primary transition-colors" />
            <AnimatePresence>
              {!scrolled && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden ml-1"
                >
                  {link.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </Link>
      ))}
    </div>
  )
}
