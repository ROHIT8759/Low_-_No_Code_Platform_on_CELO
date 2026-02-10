"use client"

import React from "react"

export default function AmbientLight() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Torch Spotlight - Cone Shape from Above Navbar */}
            <div
                className="absolute -top-[80px] left-1/2 -translate-x-1/2 w-[200px] h-[120vh]"
                style={{
                    background: "radial-gradient(ellipse 200px 100vh at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 15%, rgba(255, 255, 255, 0.04) 35%, rgba(255, 255, 255, 0.02) 55%, transparent 75%)",
                    filter: "blur(40px)",
                    animation: "torchPulse 4s ease-in-out infinite"
                }}
            />

            {/* Wider Cone Spread */}
            <div
                className="absolute -top-[80px] left-1/2 -translate-x-1/2 w-[400px] h-[120vh]"
                style={{
                    background: "radial-gradient(ellipse 400px 100vh at 50% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.01) 50%, transparent 70%)",
                    filter: "blur(60px)",
                    opacity: 0.8,
                    animation: "torchPulse 4s ease-in-out infinite 0.5s"
                }}
            />

            {/* Outermost Soft Glow */}
            <div
                className="absolute -top-[80px] left-1/2 -translate-x-1/2 w-[600px] h-[120vh]"
                style={{
                    background: "radial-gradient(ellipse 600px 100vh at 50% 0%, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.015) 30%, transparent 60%)",
                    filter: "blur(80px)",
                    opacity: 0.6
                }}
            />

            {/* CSS Animation for Gentle Pulse */}
            <style jsx>{`
        @keyframes torchPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }
      `}</style>
        </div>
    )
}
