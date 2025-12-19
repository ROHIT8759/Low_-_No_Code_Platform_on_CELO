"use client"

import { useEffect, useRef, useState } from "react"

type AnimationVariant = 
  | "fade-up" 
  | "fade-left" 
  | "fade-right" 
  | "scale" 
  | "rotate" 
  | "blur" 
  | "flip" 
  | "bounce"
  | "3d-card"
  | "glow-line"

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  variant?: AnimationVariant
  className?: string
  threshold?: number
  once?: boolean
}

const variantClasses: Record<AnimationVariant, { hidden: string; visible: string }> = {
  "fade-up": {
    hidden: "opacity-0 translate-y-10",
    visible: "opacity-100 translate-y-0"
  },
  "fade-left": {
    hidden: "opacity-0 -translate-x-16",
    visible: "opacity-100 translate-x-0"
  },
  "fade-right": {
    hidden: "opacity-0 translate-x-16",
    visible: "opacity-100 translate-x-0"
  },
  "scale": {
    hidden: "opacity-0 scale-75",
    visible: "opacity-100 scale-100"
  },
  "rotate": {
    hidden: "opacity-0 -rotate-12 scale-90",
    visible: "opacity-100 rotate-0 scale-100"
  },
  "blur": {
    hidden: "opacity-0 blur-sm translate-y-5",
    visible: "opacity-100 blur-0 translate-y-0"
  },
  "flip": {
    hidden: "opacity-0 [transform:perspective(1000px)_rotateX(-30deg)]",
    visible: "opacity-100 [transform:perspective(1000px)_rotateX(0deg)]"
  },
  "bounce": {
    hidden: "opacity-0 translate-y-16",
    visible: "opacity-100 translate-y-0"
  },
  "3d-card": {
    hidden: "opacity-0 [transform:perspective(1000px)_rotateY(-15deg)_rotateX(10deg)_translateZ(-50px)]",
    visible: "opacity-100 [transform:perspective(1000px)_rotateY(0)_rotateX(0)_translateZ(0)]"
  },
  "glow-line": {
    hidden: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0"
  }
}

export function ScrollReveal({ 
  children, 
  delay = 0, 
  variant = "fade-up",
  className = "",
  threshold = 0.1,
  once = true
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay, threshold, once])

  const { hidden, visible } = variantClasses[variant]

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? visible : hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Scroll Progress Bar Component
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setProgress(scrollPercent)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div 
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 z-[9999] transition-all duration-100"
      style={{ width: `${progress}%` }}
    />
  )
}

// Parallax Scroll Component
interface ParallaxProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function ParallaxScroll({ children, speed = 0.5, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
        setOffset(scrollProgress * 100 * speed)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed])

  return (
    <div 
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  )
}

// Stagger Children Animation
interface StaggerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggerReveal({ children, staggerDelay = 100, className = "" }: StaggerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`${className} ${isVisible ? 'scroll-stagger visible' : 'scroll-stagger'}`}>
      {children}
    </div>
  )
}
