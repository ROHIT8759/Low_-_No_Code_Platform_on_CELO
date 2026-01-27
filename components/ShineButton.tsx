"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ReactNode } from "react"

interface ShineButtonProps {
    href: string
    children: ReactNode
    className?: string
}

export default function ShineButton({ href, children, className = "" }: ShineButtonProps) {
    return (
        <Link
            href={href}
            className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/50 ${className}`}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
            <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 2,
                    ease: "linear",
                    repeatDelay: 3,
                }}
                className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ width: "50%", skewX: "-20deg" }}
            />
        </Link>
    )
}
