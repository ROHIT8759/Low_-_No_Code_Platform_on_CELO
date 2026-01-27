"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function CustomCursor() {
    const [isPointer, setIsPointer] = useState(false)
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 700 }
    const cursorXSpring = useSpring(cursorX, springConfig)
    const cursorYSpring = useSpring(cursorY, springConfig)

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
        }

        const updatePointerType = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target instanceof HTMLElement) {
                const computedStyle = window.getComputedStyle(target);
                setIsPointer(
                    computedStyle.cursor === "pointer" ||
                    target.tagName === "A" ||
                    target.tagName === "BUTTON" ||
                    target.closest('a') !== null ||
                    target.closest('button') !== null
                )
            }
        }

        window.addEventListener("mousemove", moveCursor)
        window.addEventListener("mouseover", updatePointerType)

        return () => {
            window.removeEventListener("mousemove", moveCursor)
            window.removeEventListener("mouseover", updatePointerType)
        }
    }, [])

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 border border-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: -16,
                    y: -16,
                    scale: isPointer ? 1.5 : 1,
                }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-fuchsia-400 rounded-full pointer-events-none z-[9999]"
                style={{
                    translateX: cursorX,
                    translateY: cursorY,
                    x: -4,
                    y: -4,
                }}
            />
        </>
    )
}
