# Design Document: Infrastructure-Grade Frontend Overhaul

## Overview

This design document outlines the comprehensive frontend transformation of Block Builder from an AI-template aesthetic to an infrastructure-grade platform interface. The transformation encompasses a complete design system overhaul, component upgrades, motion system refinement, and performance optimization.

The design follows a philosophy of structured surface layering, border-based hierarchy, engineering typography, and deterministic motion. The goal is to create an interface that conveys protocol-grade authority and feels like a $50M devtools startup.

### Design Principles

1. **Deterministic over Decorative**: Every visual element serves a functional purpose
2. **Structured over Floating**: Clear surface layering and spatial relationships
3. **Dense over Spacious**: Information-rich layouts that respect user attention
4. **Engineering over Marketing**: Technical precision in language and presentation
5. **Subtle over Dramatic**: Refined depth through layering rather than effects

## Architecture

### System Architecture

The frontend architecture consists of several key layers:

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (Pages: Landing, Builder, Docs)        │
├─────────────────────────────────────────┤
│         Component Layer                 │
│  (Navbar, Hero, BentoGrid, etc.)        │
├─────────────────────────────────────────┤
│         Design System Layer             │
│  (Tokens, Typography, Motion)           │
├─────────────────────────────────────────┤
│         Foundation Layer                │
│  (CSS Variables, Base Styles)           │
└─────────────────────────────────────────┘
```

### Design System Architecture

The design system is organized into interconnected subsystems:

1. **Color System**: Surface layers, borders, accents
2. **Typography System**: Scales, weights, tracking
3. **Spacing System**: Density-optimized spacing units
4. **Motion System**: Transitions and animations
5. **Component System**: Reusable UI patterns

## Components and Interfaces

### 1. Design System Tokens

#### Color Tokens

```typescript
interface ColorSystem {
  // Background layers
  background: {
    base: '#0B0F14',        // Surface 0
    surface1: '#11151A',    // Surface 1
    surface2: '#1A1F26',    // Surface 2
    surface3: '#222730',    // Surface 3
  },
  
  // Border system
  border: {
    outer: 'rgba(255, 255, 255, 0.06)',    // 6% white
    outerStrong: 'rgba(255, 255, 255, 0.08)', // 8% white
    inner: 'rgba(255, 255, 255, 0.04)',    // 4% white
    accent: 'rgba(59, 130, 246, 0.5)',     // Blue accent
  },
  
  // Text colors
  text: {
    primary: 'rgba(255, 255, 255, 0.95)',  // 95% white
    secondary: 'rgba(255, 255, 255, 0.85)', // 85% white
    tertiary: 'rgba(255, 255, 255, 0.60)',  // 60% white
    muted: 'rgba(255, 255, 255, 0.40)',     // 40% white
  },
  
  // Accent colors
  accent: {
    blue: '#3B82F6',
    emerald: '#10B981',
    purple: '#8B5CF6',
    zinc: '#71717A',
  }
}
```

#### Typography Tokens

```typescript
interface TypographySystem {
  // Hero level
  hero: {
    fontSize: '3rem',      // 48px
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  },
  
  // Section headers
  h2: {
    fontSize: '2rem',      // 32px
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  
  h3: {
    fontSize: '1.5rem',    // 24px
    fontWeight: 500,
    letterSpacing: '0',
    lineHeight: 1.3,
  },
  
  // Body text
  body: {
    fontSize: '1rem',      // 16px
    fontWeight: 400,
    letterSpacing: '0',
    lineHeight: 1.6,
    opacity: 0.85,
  },
  
  // Technical labels
  label: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 500,
    letterSpacing: '0',
    lineHeight: 1.4,
  },
  
  // Micro labels
  micro: {
    fontSize: '0.625rem',  // 10px
    fontWeight: 500,
    letterSpacing: '0.05em',
    lineHeight: 1.2,
    textTransform: 'uppercase',
  }
}
```

#### Spacing Tokens

```typescript
interface SpacingSystem {
  // Density-optimized spacing
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
}
```

#### Motion Tokens

```typescript
interface MotionSystem {
  duration: {
    fast: '140ms',
    normal: '180ms',
    slow: '200ms',
  },
  
  easing: {
    standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  
  transforms: {
    slideUp: 'translateY(12px)',
    subtle: 'translateY(2px)',
  }
}
```

### 2. Background System Component

The background system creates layered depth without distraction:

```typescript
interface BackgroundSystem {
  // Base layer
  baseColor: '#0B0F14',
  
  // Noise texture
  noise: {
    opacity: 0.015,        // 1.5%
    scale: 1,
  },
  
  // Radial vignette
  vignette: {
    gradient: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.3) 100%)',
  },
  
  // Structural grid (conditional)
  grid: {
    opacity: 0.025,        // 2.5%
    size: '40px',
    color: 'rgba(255, 255, 255, 0.025)',
    display: 'conditional', // Only in hero/bento zones
  }
}
```

Implementation approach:
- Use Silk component for noise texture
- Apply CSS gradient for vignette
- Use conditional grid rendering based on section
- Ensure grid fades out in lower sections

### 3. Navbar Component

The navbar provides persistent navigation with scroll-aware behavior:

```typescript
interface NavbarProps {
  scrolled: boolean;
}

interface NavbarState {
  width: string;           // Shrinks on scroll
  height: string;          // Reduces on scroll
  borderRadius: '12px';    // Maximum 12px
  background: 'rgba(15, 20, 27, 0.8)',
  backdropBlur: '12px',
  border: 'rgba(255, 255, 255, 0.05)',
  showDivider: boolean;    // Shows on scroll
}
```

Key features:
- Scroll-aware shrinking (width and height)
- Solid surface CTA button (no gradients)
- Subtle bottom divider on scroll
- Border-based visual hierarchy
- Icon-based utility actions

### 4. Hero Section Component

The hero section establishes immediate technical authority:

```typescript
interface HeroSection {
  layout: 'two-column',    // Content left, preview right
  
  content: {
    heading: {
      primary: string,     // "Deterministic"
      secondary: string,   // "Contract Infrastructure"
    },
    subheading: string,    // "For Soroban Deployments"
    techLabel: string,     // "Production-grade WASM"
    credibilityLine: string[], // Micro-labels under CTAs
  },
  
  preview: {
    component: 'ProductWindow',
    telemetryBar: TelemetryMicrobar,
    borderBeam: boolean,
  },
  
  cta: {
    primary: {
      text: 'Initialize Workbench',
      style: 'solid-blue',  // No gradient
    },
    secondary: {
      text: 'Read Documentation',
      style: 'border-only',
    }
  }
}
```

Design details:
- Structural alignment grid for visual organization
- Telemetry microbar showing system status
- Tightened copy with engineering focus
- Credibility microline: "MAINNET READY · WASM NATIVE · FORMAL PIPELINE"
- Reduced floating effects

### 5. BentoGrid Component

The BentoGrid presents features in a dense, scannable layout:

```typescript
interface BentoGridProps {
  items: BentoGridItem[];
}

interface BentoGridItem {
  title: string,
  description: string | ReactNode,
  header: ReactNode,       // Visual component
  icon: ReactNode,
  className: string,       // Grid span control
  
  // New additions
  accentStrip: {
    color: string,
    width: '2px',
    position: 'top',
  },
  
  metadata: {
    label: string,         // e.g., "REL: OPTIMIZED"
    value: string,         // e.g., "14kb runtime"
  }[],
  
  style: {
    borderRadius: '12px',  // Reduced from current
    border: 'rgba(255, 255, 255, 0.06)',
    background: '#11151A',
    hoverBackground: '#161B22',
  }
}
```

Enhancements:
- 12-14px border radius (reduced)
- Subtle top accent strip per card
- Increased information density
- Micro metadata lines
- No glow edges
- Subtle background shift on hover only

### 6. Build Pipeline Section

The build pipeline visualizes the compilation process as structured modules:

```typescript
interface BuildPipelineSection {
  stages: PipelineStage[];
}

interface PipelineStage {
  id: string,              // "01", "02", etc.
  title: string,           // "Visual Engine"
  description: string,
  icon: ReactNode,
  
  // Visual styling
  accentColor: string,     // Top strip color
  background: '#0F141B',
  border: 'rgba(255, 255, 255, 0.06)',
  borderRadius: '12px',
  
  // Telemetry
  metrics: {
    label: string,         // "CTX", "GEN", "OPT", "SIZE"
    value: string,         // "84ms", "12ms", "Level 3", "14kb"
  }[],
  
  // Hover state
  hoverState: {
    translateY: '-4px',
    showMetrics: true,
  }
}

interface PipelineConnector {
  type: 'horizontal-line',
  style: {
    width: '48px',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.06)',
  },
  dot: {
    size: '8px',
    background: 'rgba(255, 255, 255, 0.06)',
  }
}
```

Design approach:
- Replace decorative flow with process modules
- Each stage is a structured card with ID badge
- Directional connectors between stages
- Micro telemetry revealed on hover
- Realistic timing and size metrics

### 7. Security Section

The security section presents defense-in-depth architecture:

```typescript
interface SecuritySection {
  layout: 'two-column',    // Copy left, visual right
  
  copyColumn: {
    badge: {
      text: 'Active Protection',
      indicator: 'pulse-dot',
    },
    heading: {
      primary: 'Defense in Depth',
      secondary: 'Architecture',
    },
    description: string,
    features: SecurityFeature[],
  },
  
  visualColumn: {
    type: 'layered-cards',
    layers: SecurityLayer[],
  }
}

interface SecurityFeature {
  icon: ReactNode,
  title: string,
  description: string,
}

interface SecurityLayer {
  zIndex: number,
  opacity: number,         // Decreases for background layers
  scale: number,           // Decreases for background layers
  content: {
    label: string,
    metrics: SecurityMetric[],
  }
}

interface SecurityMetric {
  check: string,           // "Re-entrancy Check"
  status: 'SAFE' | 'VERIFIED' | number,
  color: 'emerald' | 'blue',
}
```

Design approach:
- Layered structure showing depth
- Minimal pipeline diagram
- Security report card as primary visual
- Technical capability presentation
- No decorative or marketing layouts

### 8. Contract Workstation (Builder Page)

The builder page transforms into a professional workstation:

```typescript
interface ContractWorkstation {
  layout: 'three-column',  // Sidebar, Canvas, Code Viewer
  
  zones: {
    sidebar: {
      width: '280px',
      background: '#090C10',
      sections: [
        'BlockPalette',
        'ProjectManager',
        'NetworkSwitcher',
      ]
    },
    
    canvas: {
      flex: 1,
      background: '#0B0F14',
      header: WorkstationHeader,
      content: 'DragDropCanvas',
    },
    
    codeViewer: {
      width: '400px',
      background: '#11151A',
      tabs: ['Code', 'ABI', 'Metadata'],
    }
  }
}

interface WorkstationHeader {
  pipelineView: {
    stages: ['Design', 'Generate', 'Compile', 'Deploy'],
    currentStage: string,
    visualization: 'progress-bar',
  },
  
  contractOverview: {
    name: string,
    network: string,
    status: string,
  },
  
  compileMetadata: {
    size: string,
    gasEstimate: string,
    lastCompiled: string,
  }
}
```

Key features:
- Clear surface zoning for functional areas
- Structured pipeline view in header
- Guided base selection in sidebar
- Contract overview panel
- Compile metadata panel
- Spatial consistency throughout

## Data Models

### Design Token Model

```typescript
interface DesignTokens {
  colors: ColorSystem;
  typography: TypographySystem;
  spacing: SpacingSystem;
  motion: MotionSystem;
  borders: BorderSystem;
}

interface BorderSystem {
  width: {
    thin: '1px',
    accent: '2px',
  },
  opacity: {
    outer: 0.06,
    outerStrong: 0.08,
    inner: 0.04,
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '14px',
  }
}
```

### Component State Model

```typescript
interface ComponentState {
  // Hover state
  hover: {
    background: string,
    translateY: string,
    borderColor: string,
  },
  
  // Active state
  active: {
    accentStrip: boolean,
    borderColor: string,
  },
  
  // Focus state
  focus: {
    outline: string,
    outlineOffset: string,
  }
}
```

### Responsive Breakpoint Model

```typescript
interface ResponsiveBreakpoints {
  mobile: {
    maxWidth: '640px',
    columns: 1,
    spacing: 'reduced',
    motion: 'minimal',
    telemetry: 'hidden',
  },
  
  tablet: {
    minWidth: '641px',
    maxWidth: '1024px',
    columns: 2,
    spacing: 'normal',
    motion: 'reduced',
    sidebar: 'collapsible',
  },
  
  laptop: {
    minWidth: '1025px',
    maxWidth: '1440px',
    columns: 3,
    spacing: 'reduced',
    motion: 'normal',
  },
  
  desktop: {
    minWidth: '1441px',
    columns: 4,
    spacing: 'full',
    motion: 'full',
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Surface Hierarchy Consistency

*For any* component using surface layers, the contrast between adjacent surface levels should be perceivable and consistent across the application.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

### Property 2: Border System Uniformity

*For any* container element, the border opacity and width should match the defined border system tokens based on the element's hierarchy level.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6**

### Property 3: Typography Scale Adherence

*For any* text element, the font weight, size, and letter-spacing should match one of the defined typography system scales.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.7**

### Property 4: Motion Duration Consistency

*For any* animated transition, the duration should be between 140ms and 200ms using the standard easing function.

**Validates: Requirements 12.1, 12.2, 12.6**

### Property 5: Border Radius Constraint

*For any* component with rounded corners, the border radius should not exceed 14px.

**Validates: Requirements 6.1, 8.2, 13.6**

### Property 6: Celo Reference Absence

*For any* text content in the UI, page metadata, or titles, there should be no mentions of "Celo".

**Validates: Requirements 14.1, 14.2, 14.3, 14.4**

### Property 7: Glow Effect Absence

*For any* visual element, there should be no glow, neon, or blur-based shadow effects applied.

**Validates: Requirements 1.1, 4.4, 6.2, 8.6, 13.1, 13.2**

### Property 8: Gradient CTA Absence

*For any* call-to-action button, the background should be a solid color rather than a gradient.

**Validates: Requirements 1.1, 6.3, 13.4**

### Property 9: Contrast Ratio Compliance

*For any* text element, the contrast ratio between text and background should meet WCAG 2.1 AA standards (minimum 4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 18.1**

### Property 10: Keyboard Navigation Completeness

*For any* interactive element, it should be reachable and operable via keyboard navigation.

**Validates: Requirements 18.2, 18.4**

### Property 11: Responsive Layout Adaptation

*For any* viewport width, the layout should adapt according to the defined breakpoint rules without horizontal scrolling.

**Validates: Requirements 16.1, 16.2, 16.3, 16.4**

### Property 12: Motion Reduction on Mobile

*For any* animation on mobile devices, the complexity should be reduced compared to desktop animations.

**Validates: Requirements 16.7**

### Property 13: Telemetry Visibility on Desktop

*For any* component with telemetry indicators on desktop, those indicators should be visible and properly formatted.

**Validates: Requirements 7.1, 9.2, 20.1, 20.4**

### Property 14: Spacing Consistency

*For any* layout using spacing tokens, the spacing values should match the defined spacing system.

**Validates: Requirements 17.2**

### Property 15: Lazy Loading for Heavy Components

*For any* heavy preview component, it should be lazy loaded to improve initial page load performance.

**Validates: Requirements 15.3**

### Property 16: Layout Shift Prevention

*For any* page load, there should be no cumulative layout shift (CLS should be < 0.1).

**Validates: Requirements 15.2**

### Property 17: Monospace Font for Technical Content

*For any* technical identifier, code snippet, or system metric, the font family should be monospace.

**Validates: Requirements 5.4, 20.3**

### Property 18: Accent Strip Activation

*For any* active or highlighted module, a subtle accent strip of maximum 2px width should be displayed.

**Validates: Requirements 4.3, 4.5, 8.3**

### Property 19: Information Density Increase

*For any* card component, the information density should be higher than the current implementation while maintaining readability.

**Validates: Requirements 8.4, 19.1, 19.2, 19.3, 19.4**

### Property 20: Technical Language Usage

*For any* system information display, the language should be technical rather than marketing-focused.

**Validates: Requirements 20.7**

## Error Handling

### Design Token Fallbacks

When design tokens are unavailable or invalid:
- Fall back to nearest valid token value
- Log warning in development mode
- Maintain visual consistency with default values

```typescript
function getColorToken(path: string): string {
  try {
    return resolveToken(path);
  } catch (error) {
    console.warn(`Token ${path} not found, using fallback`);
    return FALLBACK_COLORS[path] || '#FFFFFF';
  }
}
```

### Responsive Breakpoint Handling

When viewport size is between breakpoints:
- Use mobile-first approach
- Apply progressive enhancement
- Ensure no broken layouts

```typescript
function getBreakpoint(width: number): Breakpoint {
  if (width < 641) return 'mobile';
  if (width < 1025) return 'tablet';
  if (width < 1441) return 'laptop';
  return 'desktop';
}
```

### Component Loading Errors

When components fail to load:
- Display minimal fallback UI
- Log error for debugging
- Maintain page structure

```typescript
function ComponentErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary
      fallback={<MinimalFallback />}
      onError={(error) => logError(error)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Motion System Degradation

When user prefers reduced motion:
- Respect `prefers-reduced-motion` media query
- Disable non-essential animations
- Maintain instant state changes

```typescript
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const transition = shouldAnimate 
  ? { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
  : { duration: 0 };
```

### Performance Degradation

When performance metrics fall below thresholds:
- Reduce animation complexity
- Disable non-critical visual effects
- Prioritize content rendering

```typescript
function adaptToPerformance(fps: number) {
  if (fps < 30) {
    disableParallax();
    reduceAnimations();
  }
  if (fps < 20) {
    disableAllAnimations();
  }
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across many inputs.

### Unit Testing Focus

Unit tests should focus on:
- Specific component rendering examples
- Integration points between components
- Edge cases (empty states, maximum values, etc.)
- Error conditions and fallback behavior
- Accessibility features (ARIA labels, keyboard navigation)

Avoid writing too many unit tests for scenarios that property tests can cover through randomization.

### Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for TypeScript/JavaScript property-based testing.

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: infrastructure-grade-frontend-overhaul, Property {number}: {property_text}`

**Property Test Implementation**:
- Each correctness property must be implemented by a SINGLE property-based test
- Generate random component props and verify properties hold
- Test across different viewport sizes for responsive properties
- Test with various theme configurations

### Testing Examples

#### Unit Test Example: Navbar Scroll Behavior

```typescript
describe('Navbar', () => {
  it('should shrink when scrolled past threshold', () => {
    render(<Navbar />);
    
    // Simulate scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } });
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveStyle({ paddingTop: '0.5rem' });
  });
  
  it('should show divider when scrolled', () => {
    render(<Navbar />);
    
    fireEvent.scroll(window, { target: { scrollY: 100 } });
    
    const divider = screen.getByTestId('navbar-divider');
    expect(divider).toBeVisible();
  });
});
```

#### Property Test Example: Surface Hierarchy Consistency

```typescript
import fc from 'fast-check';

// Feature: infrastructure-grade-frontend-overhaul, Property 1: Surface Hierarchy Consistency
describe('Surface Hierarchy', () => {
  it('should maintain perceivable contrast between adjacent levels', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2 }), // Adjacent surface levels
        (level) => {
          const surface1 = getSurfaceColor(level);
          const surface2 = getSurfaceColor(level + 1);
          
          const contrast = calculateContrast(surface1, surface2);
          
          // Contrast should be perceivable (at least 1.1:1)
          expect(contrast).toBeGreaterThanOrEqual(1.1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property Test Example: Border System Uniformity

```typescript
// Feature: infrastructure-grade-frontend-overhaul, Property 2: Border System Uniformity
describe('Border System', () => {
  it('should apply correct border opacity based on hierarchy', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('outer', 'outerStrong', 'inner'),
        fc.constantFrom('card', 'container', 'panel'),
        (borderType, elementType) => {
          const element = createTestElement(elementType);
          const computedStyle = getComputedStyle(element);
          const borderColor = computedStyle.borderColor;
          
          const expectedOpacity = BORDER_OPACITY[borderType];
          const actualOpacity = extractOpacity(borderColor);
          
          expect(actualOpacity).toBeCloseTo(expectedOpacity, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property Test Example: Typography Scale Adherence

```typescript
// Feature: infrastructure-grade-frontend-overhaul, Property 3: Typography Scale Adherence
describe('Typography System', () => {
  it('should use defined typography scales for all text', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('hero', 'h2', 'h3', 'body', 'label', 'micro'),
        (scale) => {
          const element = createTextElement(scale);
          const computedStyle = getComputedStyle(element);
          
          const expectedScale = TYPOGRAPHY_SYSTEM[scale];
          
          expect(computedStyle.fontSize).toBe(expectedScale.fontSize);
          expect(computedStyle.fontWeight).toBe(String(expectedScale.fontWeight));
          expect(computedStyle.letterSpacing).toBe(expectedScale.letterSpacing);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property Test Example: Motion Duration Consistency

```typescript
// Feature: infrastructure-grade-frontend-overhaul, Property 4: Motion Duration Consistency
describe('Motion System', () => {
  it('should use consistent duration and easing for all transitions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('hover', 'reveal', 'slide'),
        (transitionType) => {
          const element = createAnimatedElement(transitionType);
          const computedStyle = getComputedStyle(element);
          const duration = parseDuration(computedStyle.transitionDuration);
          const easing = computedStyle.transitionTimingFunction;
          
          expect(duration).toBeGreaterThanOrEqual(140);
          expect(duration).toBeLessThanOrEqual(200);
          expect(easing).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Property Test Example: Responsive Layout Adaptation

```typescript
// Feature: infrastructure-grade-frontend-overhaul, Property 11: Responsive Layout Adaptation
describe('Responsive Layouts', () => {
  it('should adapt without horizontal scrolling at any viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // Viewport widths
        (width) => {
          setViewportWidth(width);
          render(<App />);
          
          const body = document.body;
          const hasHorizontalScroll = body.scrollWidth > body.clientWidth;
          
          expect(hasHorizontalScroll).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Visual Regression Testing

Use visual regression testing for:
- Component appearance consistency
- Layout stability across viewports
- Theme application correctness

Tools: Percy, Chromatic, or Playwright visual comparisons

### Performance Testing

Monitor and test:
- Lighthouse scores (target: 90+)
- Core Web Vitals (LCP, FID, CLS)
- Bundle size
- Time to Interactive

### Accessibility Testing

Automated testing with:
- axe-core for WCAG compliance
- jest-axe for component-level checks
- Manual testing with screen readers
- Keyboard navigation testing

### Integration Testing

Test component interactions:
- Navbar scroll behavior with page content
- Builder workstation zone interactions
- Modal and overlay behavior
- Form submissions and validations

### End-to-End Testing

Use Playwright or Cypress for:
- Complete user flows
- Cross-browser compatibility
- Mobile device testing
- Performance under realistic conditions
