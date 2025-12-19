"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, Torus, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

// Floating blockchain block component
function BlockchainBlock({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + delay) * 0.3
            meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime + delay) * 0.3
        }
    })

    return (
        <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={1}
            floatingRange={[-0.2, 0.2]}
        >
            <Box ref={meshRef} args={[1, 1, 1]} position={position}>
                <meshStandardMaterial
                    color={color}
                    metalness={0.8}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </Box>
        </Float>
    )
}

// Glowing orb component representing transactions
function GlowingOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2) * 0.1)
        }
    })

    return (
        <Float speed={3} rotationIntensity={0.2} floatIntensity={2}>
            <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
                <MeshDistortMaterial
                    color={color}
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0}
                    metalness={1}
                    emissive={color}
                    emissiveIntensity={0.5}
                />
            </Sphere>
        </Float>
    )
}

// Central spinning torus
function CentralTorus() {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
    })

    return (
        <Torus ref={meshRef} args={[2, 0.4, 16, 100]} position={[0, 0, 0]}>
            <MeshWobbleMaterial
                attach="material"
                color="#86E8FF"
                factor={0.2}
                speed={2}
                metalness={0.9}
                roughness={0.1}
            />
        </Torus>
    )
}

// Particle system for floating dots
function Particles({ count = 100 }: { count?: number }) {
    const mesh = useRef<THREE.Points>(null)

    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20
            const y = (Math.random() - 0.5) * 20
            const z = (Math.random() - 0.5) * 20
            temp.push(x, y, z)
        }
        return new Float32Array(temp)
    }, [count])

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(particles, 3))
        return geo
    }, [particles])

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.02
            mesh.current.rotation.x = state.clock.elapsedTime * 0.01
        }
    })

    return (
        <points ref={mesh} geometry={geometry}>
            <pointsMaterial
                size={0.05}
                color="#86E8FF"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    )
}

// Connection lines between blocks
function ConnectionLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
    const points = useMemo(() => {
        return [
            new THREE.Vector3(...start),
            new THREE.Vector3(...end)
        ]
    }, [start, end])

    const lineGeometry = useMemo(() => {
        const geo = new THREE.BufferGeometry().setFromPoints(points)
        return geo
    }, [points])

    const lineMaterial = useMemo(() => {
        return new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5
        })
    }, [color])

    return (
        <primitive object={new THREE.Line(lineGeometry, lineMaterial)} />
    )
}

// Main 3D scene
function Scene() {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#86E8FF" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#e879f9" />
            <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={1} color="#5cd5ff" />

            {/* Central element */}
            <CentralTorus />

            {/* Blockchain blocks - Celo colors */}
            <BlockchainBlock position={[-3, 2, 0]} color="#FCFF52" delay={0} />
            <BlockchainBlock position={[3, -1, 1]} color="#35D07F" delay={1} />
            <BlockchainBlock position={[-2, -2, -1]} color="#5EA33B" delay={2} />
            <BlockchainBlock position={[2, 2, -2]} color="#86E8FF" delay={3} />
            <BlockchainBlock position={[0, 3, 2]} color="#e879f9" delay={4} />

            {/* Glowing orbs */}
            <GlowingOrb position={[-4, 0, 2]} color="#86E8FF" scale={0.8} />
            <GlowingOrb position={[4, 1, -1]} color="#e879f9" scale={1} />
            <GlowingOrb position={[0, -3, 1]} color="#35D07F" scale={0.6} />

            {/* Connection lines */}
            <ConnectionLine start={[-3, 2, 0]} end={[3, -1, 1]} color="#86E8FF" />
            <ConnectionLine start={[3, -1, 1]} end={[-2, -2, -1]} color="#35D07F" />
            <ConnectionLine start={[-2, -2, -1]} end={[2, 2, -2]} color="#e879f9" />
            <ConnectionLine start={[2, 2, -2]} end={[0, 3, 2]} color="#FCFF52" />

            {/* Particle system */}
            <Particles count={200} />

            {/* Allow subtle camera movement on hover */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 3}
            />
        </>
    )
}

// Exported component
export default function Hero3DScene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <Scene />
            </Canvas>
        </div>
    )
}
