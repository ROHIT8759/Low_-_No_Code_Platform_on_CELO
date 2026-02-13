"use client"

import { useState, useEffect } from 'react'

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  laptop: 1440,
  desktop: 1920,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth

      if (width < BREAKPOINTS.mobile) {
        setBreakpoint('mobile')
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('tablet')
      } else if (width < BREAKPOINTS.laptop) {
        setBreakpoint('laptop')
      } else {
        setBreakpoint('desktop')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.mobile - 1}px)`)
}

export function useIsTablet(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`)
}

export function useIsLaptop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.laptop - 1}px)`)
}

export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.laptop}px)`)
}
