"use client"

import { useRef, useMemo, useState, useCallback, memo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, MeshDistortMaterial, Sphere, Box } from "@react-three/drei"
import * as THREE from "three"

// Optimized wave particle field - reduced particle count for better performance
const WaveParticleField = memo(function WaveParticleField({ count = 8000, mousePosition }: { count?: number; mousePosition: { x: number; y: number } }) {
    const mesh = useRef<THREE.Points>(null)
    const { viewport } = useThree()

    const { positions, colors, originalPositions } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const originalPositions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            // Create a wide field of particles in a wave pattern
            const x = (Math.random() - 0.5) * 35
            const y = (Math.random() - 0.5) * 20
            const z = (Math.random() - 0.5) * 10 - 5

            positions[i3] = x
            positions[i3 + 1] = y
            positions[i3 + 2] = z

            originalPositions[i3] = x
            originalPositions[i3 + 1] = y
            originalPositions[i3 + 2] = z

            // Purple/cyan/green color gradient based on position
            const t = Math.random()
            if (t < 0.35) {
                // Cyan
                colors[i3] = 0.53
                colors[i3 + 1] = 0.91
                colors[i3 + 2] = 1.0
            } else if (t < 0.65) {
                // Purple/Fuchsia
                colors[i3] = 0.66
                colors[i3 + 1] = 0.33
                colors[i3 + 2] = 0.97
            } else {
                // Green (Celo)
                colors[i3] = 0.21
                colors[i3 + 1] = 0.82
                colors[i3 + 2] = 0.5
            }
        }

        return { positions, colors, originalPositions }
    }, [count])

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        return geo
    }, [positions, colors])

    useFrame((state) => {
        if (!mesh.current) return

        const time = state.clock.elapsedTime
        const positionArray = mesh.current.geometry.attributes.position.array as Float32Array

        // Optimize: update every 2nd frame for better performance
        if (Math.floor(time * 60) % 2 !== 0) return

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const x = originalPositions[i3]
            const originalY = originalPositions[i3 + 1]

            // Simplified wave calculation for better performance
            const wave = Math.sin(x * 0.12 + time * 0.5) * 2.5 +
                Math.cos(x * 0.15 + time * 0.3) * 1.8

            // Optimized mouse interaction
            const dx = mousePosition.x * 10 - x
            const dy = mousePosition.y * 8 - originalY
            const distSq = dx * dx + dy * dy
            const mouseEffect = distSq < 64 ? (1 - distSq / 64) * 3 : 0

            positionArray[i3 + 1] = originalY + wave + mouseEffect
        }

        mesh.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={mesh} geometry={geometry}>
            <pointsMaterial
                size={0.04}
                vertexColors
                transparent
                opacity={0.85}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
})

// Optimized floating blockchain block component with hover effect
const BlockchainBlock = memo(function BlockchainBlock({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)
    const targetScale = useRef(new THREE.Vector3(1, 1, 1))

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + delay) * 0.3
            meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime + delay) * 0.3

            // Smooth hover scale effect
            const scale = hovered ? 1.4 : 1
            targetScale.current.set(scale, scale, scale)
            meshRef.current.scale.lerp(targetScale.current, 0.1)
        }
    })

    const handlePointerOver = useCallback(() => setHovered(true), [])
    const handlePointerOut = useCallback(() => setHovered(false), [])

    return (
        <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={1}
            floatingRange={[-0.2, 0.2]}
        >
            <Box
                ref={meshRef}
                args={[0.7, 0.7, 0.7]}
                position={position}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <meshStandardMaterial
                    color={color}
                    metalness={0.9}
                    roughness={0.1}
                    emissive={color}
                    emissiveIntensity={hovered ? 1 : 0.3}
                />
            </Box>
        </Float>
    )
})

// Optimized glowing orb component with hover effect
const GlowingOrb = memo(function GlowingOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)
    const targetScale = useRef(new THREE.Vector3(scale, scale, scale))

    useFrame((state) => {
        if (meshRef.current) {
            const baseScale = scale + Math.sin(state.clock.elapsedTime * 2) * 0.1
            const hoverMultiplier = hovered ? 1.6 : 1
            const finalScale = baseScale * hoverMultiplier
            targetScale.current.set(finalScale, finalScale, finalScale)
            meshRef.current.scale.lerp(targetScale.current, 0.1)
        }
    })

    const handlePointerOver = useCallback(() => setHovered(true), [])
    const handlePointerOut = useCallback(() => setHovered(false), [])

    return (
        <Float speed={3} rotationIntensity={0.2} floatIntensity={2}>
            <Sphere
                ref={meshRef}
                args={[0.2, 16, 16]}
                position={position}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <MeshDistortMaterial
                    color={color}
                    attach="material"
                    distort={hovered ? 0.6 : 0.4}
                    speed={hovered ? 4 : 2}
                    roughness={0}
                    metalness={1}
                    emissive={color}
                    emissiveIntensity={hovered ? 1.2 : 0.5}
                />
            </Sphere>
        </Float>
    )
})

// Memoized main 3D scene
const Scene = memo(function Scene({ mousePosition }: { mousePosition: { x: number; y: number } }) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#86E8FF" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
            <pointLight position={[0, 5, 5]} intensity={0.8} color="#35D07F" />
            <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={2} color="#e879f9" />

            {/* Wave particle field - main visual effect (optimized count) */}
            <WaveParticleField count={6000} mousePosition={mousePosition} />

            {/* Floating blocks - Celo colors */}
            <BlockchainBlock position={[-5, 2, -3]} color="#FCFF52" delay={0} />
            <BlockchainBlock position={[5, -1, -2]} color="#35D07F" delay={1} />
            <BlockchainBlock position={[-4, -2, -4]} color="#86E8FF" delay={2} />

            {/* Glowing orbs - reduced count for performance */}
            <GlowingOrb position={[-6, 1, -1]} color="#86E8FF" scale={0.8} />
            <GlowingOrb position={[6, 0, -2]} color="#e879f9" scale={1} />
            <GlowingOrb position={[0, -4, -1]} color="#35D07F" scale={0.7} />
        </>
    )
})

// Exported component with mouse tracking - optimized with useCallback
export default function Hero3DScene() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = useCallback((event: React.MouseEvent) => {
        setMousePosition({
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        })
    }, [])

    return (
        <div
            className="absolute inset-0 z-0 cursor-pointer"
            onMouseMove={handleMouseMove}
        >
            <Canvas
                camera={{ position: [0, 0, 14], fov: 55 }}
                gl={{
                    antialias: false, // Disable for performance
                    alpha: true,
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: true
                }}
                dpr={[1, 1.5]} // Limit pixel ratio for performance
                style={{ background: 'transparent' }}
            >
                <Scene mousePosition={mousePosition} />
            </Canvas>
        </div>
    )
}
