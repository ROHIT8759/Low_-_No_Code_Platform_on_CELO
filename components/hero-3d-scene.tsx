"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, MeshDistortMaterial, Sphere, Box } from "@react-three/drei"
import * as THREE from "three"

// Wave particle field - creates the flowing wave effect like SolCircle
function WaveParticleField({ count = 15000, mousePosition }: { count?: number; mousePosition: { x: number; y: number } }) {
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

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            const x = originalPositions[i3]
            const originalY = originalPositions[i3 + 1]

            // Create flowing wave effect
            const wave1 = Math.sin(x * 0.15 + time * 0.6) * 2.5
            const wave2 = Math.sin(x * 0.1 - time * 0.4) * 2
            const wave3 = Math.cos(x * 0.2 + time * 0.3) * 1.5

            // Mouse interaction - particles react to mouse position
            const dx = mousePosition.x * 10 - x
            const dy = mousePosition.y * 8 - originalY
            const dist = Math.sqrt(dx * dx + dy * dy)
            const mouseEffect = Math.max(0, 1 - dist / 8) * 3

            positionArray[i3 + 1] = originalY + wave1 + wave2 + wave3 + mouseEffect
        }

        mesh.current.geometry.attributes.position.needsUpdate = true
        mesh.current.rotation.y = Math.sin(time * 0.1) * 0.1
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
}

// Floating blockchain block component with hover effect
function BlockchainBlock({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + delay) * 0.3
            meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime + delay) * 0.3

            // Smooth hover scale effect
            const targetScale = hovered ? 1.4 : 1
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
        }
    })

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
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
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
}

// Glowing orb component with hover effect
function GlowingOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    useFrame((state) => {
        if (meshRef.current) {
            const baseScale = scale + Math.sin(state.clock.elapsedTime * 2) * 0.1
            const hoverMultiplier = hovered ? 1.6 : 1
            meshRef.current.scale.lerp(
                new THREE.Vector3(baseScale * hoverMultiplier, baseScale * hoverMultiplier, baseScale * hoverMultiplier),
                0.1
            )
        }
    })

    return (
        <Float speed={3} rotationIntensity={0.2} floatIntensity={2}>
            <Sphere
                ref={meshRef}
                args={[0.2, 32, 32]}
                position={position}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
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
}

// Main 3D scene
function Scene({ mousePosition }: { mousePosition: { x: number; y: number } }) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#86E8FF" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
            <pointLight position={[0, 5, 5]} intensity={0.8} color="#35D07F" />
            <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={2} color="#e879f9" />

            {/* Wave particle field - main visual effect */}
            <WaveParticleField count={10000} mousePosition={mousePosition} />

            {/* Floating blocks - Celo colors */}
            <BlockchainBlock position={[-5, 2, -3]} color="#FCFF52" delay={0} />
            <BlockchainBlock position={[5, -1, -2]} color="#35D07F" delay={1} />
            <BlockchainBlock position={[-4, -2, -4]} color="#86E8FF" delay={2} />
            <BlockchainBlock position={[4, 2.5, -3]} color="#a855f7" delay={3} />

            {/* Glowing orbs */}
            <GlowingOrb position={[-6, 1, -1]} color="#86E8FF" scale={0.8} />
            <GlowingOrb position={[6, 0, -2]} color="#e879f9" scale={1} />
            <GlowingOrb position={[0, -4, -1]} color="#35D07F" scale={0.7} />
            <GlowingOrb position={[-3, 4, -2]} color="#FCFF52" scale={0.6} />
            <GlowingOrb position={[3, -3, 0]} color="#a855f7" scale={0.9} />
        </>
    )
}

// Exported component with mouse tracking
export default function Hero3DScene() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (event: React.MouseEvent) => {
        setMousePosition({
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        })
    }

    return (
        <div
            className="absolute inset-0 z-0 cursor-pointer"
            onMouseMove={handleMouseMove}
        >
            <Canvas
                camera={{ position: [0, 0, 14], fov: 55 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <Scene mousePosition={mousePosition} />
            </Canvas>
        </div>
    )
}
