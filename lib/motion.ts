/**
 * Motion System Utilities
 * 
 * Infrastructure-grade motion system with deterministic animations.
 * Validates Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 */

// Motion duration constants (in milliseconds)
export const MOTION_DURATION = {
  fast: 140,
  normal: 180,
  slow: 200,
} as const;

// Easing function constant
export const MOTION_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)' as const;

// Transform constants
export const MOTION_TRANSFORMS = {
  slideUp: 12, // translateY in pixels
  subtle: 2,   // translateY in pixels
} as const;

/**
 * Detects if user prefers reduced motion
 * @returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Gets motion duration based on user preferences
 * @param duration - The desired duration ('fast', 'normal', or 'slow')
 * @returns Duration in milliseconds (0 if reduced motion is preferred)
 */
export function getMotionDuration(duration: keyof typeof MOTION_DURATION = 'normal'): number {
  return prefersReducedMotion() ? 0 : MOTION_DURATION[duration];
}

/**
 * Gets motion easing function based on user preferences
 * @returns Easing function string or 'linear' if reduced motion is preferred
 */
export function getMotionEasing(): string {
  return prefersReducedMotion() ? 'linear' : MOTION_EASING;
}

// Framer Motion variants for common animations
export const motionVariants = {
  /**
   * Slide up animation with opacity fade
   * Used for revealing sections
   */
  slideUp: {
    initial: {
      opacity: 0,
      y: MOTION_TRANSFORMS.slideUp,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATION.normal / 1000, // Convert to seconds
        ease: [0.16, 1, 0.3, 1], // cubic-bezier values as array
      },
    },
    exit: {
      opacity: 0,
      y: MOTION_TRANSFORMS.slideUp,
      transition: {
        duration: MOTION_DURATION.fast / 1000,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },

  /**
   * Fade in animation without transform
   * Used for subtle content reveals
   */
  fadeIn: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: MOTION_DURATION.normal / 1000,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: MOTION_DURATION.fast / 1000,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },

  /**
   * Subtle animation with minimal transform
   * Used for hover states and micro-interactions
   */
  subtle: {
    initial: {
      opacity: 0,
      y: MOTION_TRANSFORMS.subtle,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATION.fast / 1000,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: MOTION_TRANSFORMS.subtle,
      transition: {
        duration: MOTION_DURATION.fast / 1000,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
} as const;

/**
 * Gets motion variants with reduced motion support
 * @param variantName - The variant to use ('slideUp', 'fadeIn', or 'subtle')
 * @returns Motion variant object with reduced motion handling
 */
export function getMotionVariant(variantName: keyof typeof motionVariants) {
  const variant = motionVariants[variantName];
  
  if (prefersReducedMotion()) {
    // Return instant transitions for reduced motion
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    };
  }
  
  return variant;
}

/**
 * CSS transition string builder
 * @param properties - CSS properties to transition
 * @param duration - Duration key ('fast', 'normal', or 'slow')
 * @returns CSS transition string
 */
export function buildTransition(
  properties: string[],
  duration: keyof typeof MOTION_DURATION = 'normal'
): string {
  const durationMs = getMotionDuration(duration);
  const easing = getMotionEasing();
  
  if (durationMs === 0) {
    return 'none';
  }
  
  return properties
    .map(prop => `${prop} ${durationMs}ms ${easing}`)
    .join(', ');
}

/**
 * Creates a CSS transition style object
 * @param properties - CSS properties to transition
 * @param duration - Duration key ('fast', 'normal', or 'slow')
 * @returns Style object with transition property
 */
export function createTransitionStyle(
  properties: string[],
  duration: keyof typeof MOTION_DURATION = 'normal'
): { transition: string } {
  return {
    transition: buildTransition(properties, duration),
  };
}
