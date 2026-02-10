"use client"

import { useEffect, useRef } from "react"

interface Point {
    x: number
    y: number
    vx: number
    vy: number
}

export default function NetworkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let points: Point[] = []
        let width = 0
        let height = 0
        let animationFrameId: number

        // Configuration
        const POINT_COUNT = 60
        const CONNECTION_DISTANCE = 150
        const MOUSE_DISTANCE = 200
        const POINT_COLOR = "rgba(6, 182, 212, 0.5)" // Cyan
        const LINE_COLOR = "rgba(6, 182, 212, 0.15)"

        let mouse = { x: -1000, y: -1000 }

        const init = () => {
            width = canvas.width = window.innerWidth
            height = canvas.height = window.innerHeight

            points = []
            for (let i = 0; i < POINT_COUNT; i++) {
                points.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                })
            }
        }

        const handleResize = () => {
            init()
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX
            mouse.y = e.clientY
        }

        const animate = () => {
            if (!ctx) return

            ctx.clearRect(0, 0, width, height)

            // Update and draw points
            points.forEach((point, i) => {
                // Move
                point.x += point.vx
                point.y += point.vy

                // Bounce off edges
                if (point.x < 0 || point.x > width) point.vx *= -1
                if (point.y < 0 || point.y > height) point.vy *= -1

                // Mouse interaction
                const dx = mouse.x - point.x
                const dy = mouse.y - point.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < MOUSE_DISTANCE) {
                    const forceDirectionX = dx / distance
                    const forceDirectionY = dy / distance
                    const force = (MOUSE_DISTANCE - distance) / MOUSE_DISTANCE
                    const directionX = forceDirectionX * force * 0.5
                    const directionY = forceDirectionY * force * 0.5

                    point.x -= directionX
                    point.y -= directionY
                }

                // Draw point
                ctx.beginPath()
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2)
                ctx.fillStyle = POINT_COLOR
                ctx.fill()

                // Connect to other points
                for (let j = i + 1; j < points.length; j++) {
                    const other = points[j]
                    const dx = point.x - other.x
                    const dy = point.y - other.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < CONNECTION_DISTANCE) {
                        ctx.beginPath()
                        ctx.moveTo(point.x, point.y)
                        ctx.lineTo(other.x, other.y)
                        ctx.lineWidth = 1 - dist / CONNECTION_DISTANCE
                        ctx.strokeStyle = LINE_COLOR
                        ctx.stroke()
                    }
                }

                // Connect to mouse
                const mouseDx = point.x - mouse.x
                const mouseDy = point.y - mouse.y
                const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy)

                if (mouseDist < MOUSE_DISTANCE) {
                    ctx.beginPath()
                    ctx.moveTo(point.x, point.y)
                    ctx.lineTo(mouse.x, mouse.y)
                    ctx.lineWidth = (1 - mouseDist / MOUSE_DISTANCE) * 1.5
                    ctx.strokeStyle = "rgba(59, 130, 246, 0.2)" // Blue for mouse connection
                    ctx.stroke()
                }
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        window.addEventListener("resize", handleResize)
        window.addEventListener("mousemove", handleMouseMove)

        init()
        animate()

        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("mousemove", handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: "#020617" }} // Slate-950 base
        />
    )
}
