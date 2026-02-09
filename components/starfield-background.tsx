"use client"

import { useEffect, useRef } from "react"

interface Star {
    x: number
    y: number
    z: number
    opacity: number
    size: number
    speed: number
    angle: number
    distance: number
}

export default function StarfieldBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationFrameId: number
        let stars: Star[] = []

        // Configuration
        const STAR_COUNT = 150
        const MIN_START_RADIUS = 0
        const MAX_START_RADIUS = 100 // Approx 2-4cm visual radius
        const SPEED_MULTIPLIER = 1.005 // Acceleration factor
        const BASE_SPEED = 0.2

        const initStars = () => {
            stars = []
            const { width, height } = canvas
            // Pre-populate stars at various distances so it doesn't start empty
            for (let i = 0; i < STAR_COUNT; i++) {
                // Randomize initial distance to fill screen
                const angle = Math.random() * Math.PI * 2
                // Distribute distance to fill screen initially
                const maxDist = Math.max(width, height) / 1.5
                const distance = Math.random() * maxDist

                createStar(angle, distance)
            }
        }

        const createStar = (angle?: number, distance?: number) => {
            if (!ctx) return

            const newAngle = angle ?? Math.random() * Math.PI * 2
            // If respawning, start near center
            const newDistance = distance ?? (Math.random() * (MAX_START_RADIUS - MIN_START_RADIUS) + MIN_START_RADIUS)

            stars.push({
                x: 0,
                y: 0,
                z: 0, // Not strictly used in 2D radial logic but kept for interface
                opacity: Math.random(),
                size: Math.random() * 1.5 + 0.5,
                speed: Math.random() * BASE_SPEED + 0.5,
                angle: newAngle,
                distance: newDistance
            })
        }

        const resizeCanvas = () => {
            if (!canvas) return
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initStars()
        }

        const animate = () => {
            if (!canvas || !ctx) return

            ctx.fillStyle = "black"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY) + 50

            // Update and draw stars
            for (let i = 0; i < stars.length; i++) {
                const star = stars[i]

                // Move star
                star.distance += star.speed
                star.speed *= SPEED_MULTIPLIER // Accelerate

                // Calculate position
                const x = centerX + Math.cos(star.angle) * star.distance
                const y = centerY + Math.sin(star.angle) * star.distance

                star.x = x
                star.y = y

                // Opacity and Size based on distance/speed
                // Fade in near center, fade out near edge is common, but prompt says "disappear once they reach screen edges"
                // Let's keep opacity simple or scale it
                const distRatio = star.distance / maxDistance
                const currentSize = star.size * (1 + distRatio * 2)
                const currentOpacity = Math.min(1, star.distance / 100) // Fade in from center

                ctx.beginPath()
                ctx.arc(x, y, currentSize, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`
                ctx.fill()

                // Reset if out of bounds
                if (star.distance > maxDistance) {
                    stars.splice(i, 1)
                    i--
                    createStar() // Respawn new star at center
                }
            }

            // Maintain star count
            while (stars.length < STAR_COUNT) {
                createStar()
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        window.addEventListener("resize", resizeCanvas)
        resizeCanvas()
        animate()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 h-full w-full bg-black pointer-events-none"
        />
    )
}
