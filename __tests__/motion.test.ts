/**
 * Motion System Unit Tests
 * 
 * Tests for motion utility functions and constants
 */

import {
  MOTION_DURATION,
  MOTION_EASING,
  MOTION_TRANSFORMS,
  prefersReducedMotion,
  getMotionDuration,
  getMotionEasing,
  motionVariants,
  getMotionVariant,
  buildTransition,
  createTransitionStyle,
} from '../lib/motion';

describe('Motion Constants', () => {
  it('should define correct duration constants', () => {
    expect(MOTION_DURATION.fast).toBe(140);
    expect(MOTION_DURATION.normal).toBe(180);
    expect(MOTION_DURATION.slow).toBe(200);
  });

  it('should define correct easing function', () => {
    expect(MOTION_EASING).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
  });

  it('should define correct transform constants', () => {
    expect(MOTION_TRANSFORMS.slideUp).toBe(12);
    expect(MOTION_TRANSFORMS.subtle).toBe(2);
  });
});

describe('prefersReducedMotion', () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  it('should return false when reduced motion is not preferred', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
    });

    expect(prefersReducedMotion()).toBe(false);
  });

  it('should return true when reduced motion is preferred', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
    });

    expect(prefersReducedMotion()).toBe(true);
  });

  it('should return false in server-side environment', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(prefersReducedMotion()).toBe(false);

    global.window = originalWindow;
  });
});

describe('getMotionDuration', () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  it('should return correct duration when motion is enabled', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    expect(getMotionDuration('fast')).toBe(140);
    expect(getMotionDuration('normal')).toBe(180);
    expect(getMotionDuration('slow')).toBe(200);
  });

  it('should return 0 when reduced motion is preferred', () => {
    matchMediaMock.mockReturnValue({ matches: true });

    expect(getMotionDuration('fast')).toBe(0);
    expect(getMotionDuration('normal')).toBe(0);
    expect(getMotionDuration('slow')).toBe(0);
  });

  it('should default to normal duration', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    expect(getMotionDuration()).toBe(180);
  });
});

describe('getMotionEasing', () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  it('should return standard easing when motion is enabled', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    expect(getMotionEasing()).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
  });

  it('should return linear easing when reduced motion is preferred', () => {
    matchMediaMock.mockReturnValue({ matches: true });

    expect(getMotionEasing()).toBe('linear');
  });
});

describe('motionVariants', () => {
  describe('slideUp variant', () => {
    it('should have correct initial state', () => {
      expect(motionVariants.slideUp.initial).toEqual({
        opacity: 0,
        y: 12,
      });
    });

    it('should have correct animate state', () => {
      expect(motionVariants.slideUp.animate).toEqual({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.18,
          ease: [0.16, 1, 0.3, 1],
        },
      });
    });

    it('should have correct exit state', () => {
      expect(motionVariants.slideUp.exit).toEqual({
        opacity: 0,
        y: 12,
        transition: {
          duration: 0.14,
          ease: [0.16, 1, 0.3, 1],
        },
      });
    });
  });

  describe('fadeIn variant', () => {
    it('should have correct initial state', () => {
      expect(motionVariants.fadeIn.initial).toEqual({
        opacity: 0,
      });
    });

    it('should have correct animate state', () => {
      expect(motionVariants.fadeIn.animate).toEqual({
        opacity: 1,
        transition: {
          duration: 0.18,
          ease: [0.16, 1, 0.3, 1],
        },
      });
    });

    it('should not include transform in any state', () => {
      expect(motionVariants.fadeIn.initial).not.toHaveProperty('y');
      expect(motionVariants.fadeIn.animate).not.toHaveProperty('y');
      expect(motionVariants.fadeIn.exit).not.toHaveProperty('y');
    });
  });

  describe('subtle variant', () => {
    it('should have correct initial state', () => {
      expect(motionVariants.subtle.initial).toEqual({
        opacity: 0,
        y: 2,
      });
    });

    it('should have correct animate state', () => {
      expect(motionVariants.subtle.animate).toEqual({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.14,
          ease: [0.16, 1, 0.3, 1],
        },
      });
    });

    it('should use fast duration', () => {
      expect(motionVariants.subtle.animate.transition.duration).toBe(0.14);
      expect(motionVariants.subtle.exit.transition.duration).toBe(0.14);
    });
  });
});

describe('getMotionVariant', () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  it('should return full variant when motion is enabled', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    const variant = getMotionVariant('slideUp');
    expect(variant).toEqual(motionVariants.slideUp);
  });

  it('should return instant transition when reduced motion is preferred', () => {
    matchMediaMock.mockReturnValue({ matches: true });

    const variant = getMotionVariant('slideUp');
    expect(variant).toEqual({
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    });
  });

  it('should work for all variant types', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    expect(getMotionVariant('slideUp')).toEqual(motionVariants.slideUp);
    expect(getMotionVariant('fadeIn')).toEqual(motionVariants.fadeIn);
    expect(getMotionVariant('subtle')).toEqual(motionVariants.subtle);
  });
});

describe('buildTransition', () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  it('should build transition string for single property', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    const transition = buildTransition(['opacity']);
    expect(transition).toBe('opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)');
  });

  it('should build transition string for multiple properties', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    const transition = buildTransition(['opacity', 'transform']);
    expect(transition).toBe(
      'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
    );
  });

  it('should use specified duration', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    expect(buildTransition(['opacity'], 'fast')).toContain('140ms');
    expect(buildTransition(['opacity'], 'normal')).toContain('180ms');
    expect(buildTransition(['opacity'], 'slow')).toContain('200ms');
  });

  it('should return "none" when reduced motion is preferred', () => {
    matchMediaMock.mockReturnValue({ matches: true });

    const transition = buildTransition(['opacity', 'transform']);
    expect(transition).toBe('none');
  });
});

describe('createTransitionStyle', () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  it('should create style object with transition', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    const style = createTransitionStyle(['opacity']);
    expect(style).toEqual({
      transition: 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)',
    });
  });

  it('should handle multiple properties', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    const style = createTransitionStyle(['opacity', 'transform', 'background']);
    expect(style.transition).toContain('opacity');
    expect(style.transition).toContain('transform');
    expect(style.transition).toContain('background');
  });

  it('should respect reduced motion preference', () => {
    matchMediaMock.mockReturnValue({ matches: true });

    const style = createTransitionStyle(['opacity']);
    expect(style).toEqual({
      transition: 'none',
    });
  });
});

describe('Edge Cases', () => {
  it('should handle empty properties array', () => {
    const transition = buildTransition([]);
    expect(transition).toBe('');
  });

  it('should handle properties with hyphens', () => {
    const transition = buildTransition(['background-color', 'border-radius']);
    expect(transition).toContain('background-color');
    expect(transition).toContain('border-radius');
  });
});
