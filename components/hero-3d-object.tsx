"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei"
import * as THREE from "three"

function AnimatedSphere() {
    const meshRef = useRef<THREE.Mesh>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
        }
    })

    // Mouse interaction logic could go here, but simple float/distort is often cleaner

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[1, 64, 64]} scale={2.4} ref={meshRef}>
                <MeshDistortMaterial
                    color="#06b6d4" // Cyan-500
                    attach="material"
                    distort={0.4} // Strength, 0 disables distortion (default=1)
                    speed={2} // Speed, default=1
                    roughness={0.2}
                    metalness={0.8}
                    wireframe={false}
                />
            </Sphere>
            {/* Secondary Wireframe Sphere for "Tech" feel */}
            <Sphere args={[1.2, 32, 32]} scale={2.5}>
                <meshStandardMaterial
                    color="#67e8f9"
                    wireframe
                    transparent
                    opacity={0.1}
                />
            </Sphere>
        </Float>
    )
}

export default function Hero3DObject() {
    return (
        <div className="w-full h-full absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color="purple" intensity={0.5} />
                <AnimatedSphere />
            </Canvas>
        </div>
    )
}
