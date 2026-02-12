# Implementation Plan: Infrastructure-Grade Frontend Overhaul

## Overview

This implementation plan transforms the Block Builder frontend from an AI-template aesthetic to an infrastructure-grade platform interface. The work is organized into discrete phases: design system foundation, component upgrades, motion system refinement, content updates, and performance optimization.

Each task builds incrementally, with early validation through property-based tests and unit tests. The implementation uses TypeScript, React, Next.js, and Tailwind CSS.

## Tasks

- [ ] 1. Establish design system foundation
  - [x] 1.1 Create design token system in globals.css
    - Define color tokens for 4-level surface hierarchy (#0B0F14, #11151A, #1A1F26, #222730)
    - Define border system tokens (outer 6-8%, inner 4%, accent 2px)
    - Define typography tokens (hero, h2, h3, body, label, micro scales)
    - Define spacing tokens optimized for density
    - Define motion tokens (140-200ms duration, cubic-bezier easing)
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 12.1, 12.2_

  - [ ]* 1.2 Write property test for surface hierarchy consistency
    - **Property 1: Surface Hierarchy Consistency**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

  - [ ]* 1.3 Write property test for border system uniformity
    - **Property 2: Border System Uniformity**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.6**

  - [ ]* 1.4 Write property test for typography scale adherence
    - **Property 3: Typography Scale Adherence**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.7**

- [ ] 2. Upgrade background system
  - [x] 2.1 Refactor background system component
    - Update Silk component configuration for 1-2% noise opacity
    - Add radial vignette overlay
    - Implement conditional grid rendering (hero/bento zones only)
    - Set grid opacity to 2-3%
    - Remove decorative grid wallpaper from other sections
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.2 Write unit tests for background system
    - Test noise opacity configuration
    - Test grid conditional rendering
    - Test vignette application
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Transform Navbar component
  - [x] 3.1 Refactor Navbar styling and behavior
    - Reduce border radius to 12px maximum
    - Remove glow edges and shadow effects
    - Replace gradient CTA with solid blue background (#0055eb)
    - Implement scroll-aware height shrinking
    - Add subtle bottom divider on scroll (1px, rgba white 6%)
    - Update border to use design system tokens
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 3.2 Write unit tests for Navbar scroll behavior
    - Test height shrinking on scroll
    - Test divider appearance on scroll
    - Test CTA button styling
    - _Requirements: 6.4, 6.5_

  - [ ]* 3.3 Write property test for border radius constraint
    - **Property 5: Border Radius Constraint**
    - **Validates: Requirements 6.1, 8.2, 13.6**

- [ ] 4. Upgrade Hero section
  - [x] 4.1 Refactor Hero section layout and content
    - Add telemetry microbar component to preview area
    - Reduce floating effects (remove excessive translateY)
    - Add structural alignment grid for visual organization
    - Tighten copy to engineering-focused language
    - Add credibility microline under CTAs ("MAINNET READY · WASM NATIVE · FORMAL PIPELINE")
    - Update CTA buttons to solid backgrounds (no gradients)
    - Reduce padding and increase density
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 4.2 Write unit tests for Hero section
    - Test telemetry microbar rendering
    - Test credibility microline content
    - Test CTA button styling
    - _Requirements: 7.1, 7.5_

  - [ ]* 4.3 Write property test for gradient CTA absence
    - **Property 8: Gradient CTA Absence**
    - **Validates: Requirements 1.1, 6.3, 13.4**

- [ ] 5. Refine BentoGrid component
  - [x] 5.1 Update BentoGrid styling and structure
    - Reduce border radius to 12-14px
    - Add subtle top accent strip (2px, colored by feature)
    - Increase information density (reduce padding)
    - Add micro metadata lines to each card
    - Remove glow edges and floating effects
    - Update hover state to background shift only (no translateY)
    - Apply design system border tokens
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 5.2 Write unit tests for BentoGrid cards
    - Test accent strip rendering
    - Test metadata line display
    - Test hover state styling
    - _Requirements: 8.3, 8.4, 8.7_

  - [ ]* 5.3 Write property test for glow effect absence
    - **Property 7: Glow Effect Absence**
    - **Validates: Requirements 1.1, 4.4, 6.2, 8.6, 13.1, 13.2**

- [ ] 6. Transform Build Pipeline section
  - [x] 6.1 Rebuild Build Pipeline as structured modules
    - Create PipelineStage component with ID badge, icon, title, description
    - Add colored top accent strip per stage (blue, purple, emerald, indigo)
    - Add micro telemetry metrics (CTX: 84ms, GEN: 12ms, OPT: Level 3, SIZE: 14kb)
    - Create PipelineConnector component (horizontal line with dot)
    - Implement hover state showing metrics with translateY(-4px)
    - Remove decorative flow visualizations
    - Apply design system styling
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 6.2 Write unit tests for Build Pipeline
    - Test stage rendering with correct metrics
    - Test connector rendering
    - Test hover state behavior
    - _Requirements: 9.2, 9.4, 9.7_

  - [ ]* 6.3 Write property test for telemetry visibility
    - **Property 13: Telemetry Visibility on Desktop**
    - **Validates: Requirements 7.1, 9.2, 20.1, 20.4**

- [ ] 7. Restructure Security section
  - [x] 7.1 Rebuild Security section with layered structure
    - Create two-column layout (copy left, visual right)
    - Add "Active Protection" badge with pulse indicator
    - Update heading to "Defense in Depth Architecture"
    - Create SecurityFeature component with icon, title, description
    - Create layered card visualization (3 layers with decreasing opacity/scale)
    - Build security report card as primary visual
    - Add security metrics (Re-entrancy Check: SAFE, Overflow Protection: SAFE, etc.)
    - Remove symmetrical card layout
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 7.2 Write unit tests for Security section
    - Test layered card rendering
    - Test security metrics display
    - Test badge and pulse indicator
    - _Requirements: 10.2, 10.3_

- [x] 8. Checkpoint - Ensure all landing page tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Transform Builder page into Contract Workstation
  - [x] 9.1 Refactor Builder page layout structure
    - Define three-column layout (sidebar 280px, canvas flex-1, code viewer 400px)
    - Apply surface zoning with distinct backgrounds
    - Update sidebar background to #090C10
    - Update canvas background to #0B0F14
    - Update code viewer background to #11151A
    - Add clear borders between zones
    - _Requirements: 11.1, 11.6, 11.7_

  - [x] 9.2 Create WorkstationHeader component
    - Build pipeline view showing stages (Design, Generate, Compile, Deploy)
    - Add current stage indicator
    - Create contract overview panel (name, network, status)
    - Create compile metadata panel (size, gas estimate, last compiled)
    - Apply design system styling
    - _Requirements: 11.2_

  - [x] 9.3 Enhance BlockSidebar with guided base selection
    - Add section headers with proper typography
    - Implement guided base selection interface
    - Add visual indicators for selected bases
    - Apply design system styling
    - _Requirements: 11.3_

  - [ ] 9.4 Update CodeViewer with metadata tabs
    - Add tab navigation (Code, ABI, Metadata)
    - Style tabs with design system tokens
    - Ensure monospace font for code display
    - _Requirements: 11.5_

  - [ ]* 9.5 Write unit tests for Contract Workstation
    - Test three-column layout rendering
    - Test WorkstationHeader component
    - Test tab navigation in CodeViewer
    - _Requirements: 11.1, 11.2, 11.5_

- [ ] 10. Implement motion system
  - [ ] 10.1 Create motion utility functions and constants
    - Define motion duration constants (fast: 140ms, normal: 180ms, slow: 200ms)
    - Define easing function constant (cubic-bezier(0.16, 1, 0.3, 1))
    - Create motion variants for common animations (slideUp, fadeIn, subtle)
    - Implement prefers-reduced-motion detection
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ] 10.2 Apply motion system to all components
    - Update Navbar animations
    - Update Hero section reveal animations
    - Update BentoGrid card animations
    - Update Build Pipeline stage animations
    - Update Security section animations
    - Remove bounce, zoom, and blur fade effects
    - _Requirements: 12.3, 12.4, 12.5_

  - [ ]* 10.3 Write property test for motion duration consistency
    - **Property 4: Motion Duration Consistency**
    - **Validates: Requirements 12.1, 12.2, 12.6**

  - [ ]* 10.4 Write property test for motion reduction on mobile
    - **Property 12: Motion Reduction on Mobile**
    - **Validates: Requirements 16.7**

- [ ] 11. Remove all Celo references
  - [ ] 11.1 Update all UI text content
    - Search and replace "Celo" references in all component files
    - Update to blockchain-agnostic or Soroban-focused language
    - _Requirements: 14.1_

  - [ ] 11.2 Update metadata and configuration
    - Update page titles in layout.tsx files
    - Update meta descriptions
    - Update OpenGraph metadata
    - Update any configuration files with Celo references
    - _Requirements: 14.2, 14.3_

  - [ ]* 11.3 Write property test for Celo reference absence
    - **Property 6: Celo Reference Absence**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4**

- [ ] 12. Implement responsive device intelligence
  - [ ] 12.1 Create responsive breakpoint utilities
    - Define breakpoint constants (mobile: 640px, tablet: 1024px, laptop: 1440px)
    - Create useBreakpoint hook
    - Create responsive utility functions
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ] 12.2 Apply responsive adaptations to landing page
    - Implement multi-column grids for desktop
    - Implement 2-column layouts for tablet
    - Implement stacked layouts for mobile
    - Hide secondary telemetry on mobile
    - Collapse long descriptions on mobile
    - Reduce spacing on laptop
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [ ] 12.3 Apply responsive adaptations to Builder page
    - Implement collapsible sidebar for tablet
    - Stack zones vertically on mobile
    - Adjust spacing for different breakpoints
    - _Requirements: 16.3, 16.4_

  - [ ]* 12.4 Write property test for responsive layout adaptation
    - **Property 11: Responsive Layout Adaptation**
    - **Validates: Requirements 16.1, 16.2, 16.3, 16.4**

- [ ] 13. Implement accessibility features
  - [ ] 13.1 Add ARIA labels and semantic HTML
    - Add appropriate ARIA labels to all interactive elements
    - Ensure semantic HTML structure (nav, main, section, article)
    - Add alt text to images and icons
    - _Requirements: 18.3, 18.6_

  - [ ] 13.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - Implement logical tab order
    - _Requirements: 18.2, 18.4_

  - [ ] 13.3 Verify contrast ratios
    - Audit all text/background combinations
    - Adjust colors to meet WCAG 2.1 AA standards (4.5:1 for normal text)
    - Update design tokens if needed
    - _Requirements: 18.1_

  - [ ]* 13.4 Write property test for contrast ratio compliance
    - **Property 9: Contrast Ratio Compliance**
    - **Validates: Requirements 18.1**

  - [ ]* 13.5 Write property test for keyboard navigation completeness
    - **Property 10: Keyboard Navigation Completeness**
    - **Validates: Requirements 18.2, 18.4**

- [ ] 14. Optimize performance
  - [ ] 14.1 Implement lazy loading for heavy components
    - Lazy load ProductWindow component
    - Lazy load BentoVisuals components
    - Lazy load Canvas component in Builder page
    - Add loading skeletons
    - _Requirements: 15.3_

  - [ ] 14.2 Optimize bundle and assets
    - Analyze bundle size with Next.js analyzer
    - Code-split large components
    - Optimize images (use Next.js Image component)
    - Minimize CSS and JavaScript
    - _Requirements: 15.1, 15.5_

  - [ ] 14.3 Prevent layout shift
    - Add explicit dimensions to images
    - Reserve space for dynamically loaded content
    - Use CSS containment where appropriate
    - _Requirements: 15.2_

  - [ ] 14.4 Optimize animations for GPU
    - Use transform and opacity for animations (avoid layout properties)
    - Add will-change hints sparingly
    - Minimize DOM depth in animated components
    - _Requirements: 15.4, 15.5_

  - [ ]* 14.5 Write property test for lazy loading
    - **Property 15: Lazy Loading for Heavy Components**
    - **Validates: Requirements 15.3**

  - [ ]* 14.6 Write property test for layout shift prevention
    - **Property 16: Layout Shift Prevention**
    - **Validates: Requirements 15.2**

- [ ] 15. Checkpoint - Ensure all tests pass and verify performance
  - Run all unit tests and property tests
  - Run Lighthouse audit (target: 90+ score)
  - Verify Core Web Vitals meet "Good" thresholds
  - Test on multiple devices and browsers
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Final polish and consistency checks
  - [ ] 16.1 Audit component consistency
    - Verify all components use design system tokens
    - Check spacing consistency across layouts
    - Verify border treatments are uniform
    - Check typography scales are applied correctly
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [ ] 16.2 Audit visual density
    - Review padding and margins across all components
    - Ensure information density is optimized
    - Verify readability is maintained
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

  - [ ] 16.3 Audit infrastructure visual language
    - Verify telemetry indicators are present
    - Check technical metadata display
    - Ensure monospace fonts for technical content
    - Verify technical language usage
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

  - [ ]* 16.4 Write property test for spacing consistency
    - **Property 14: Spacing Consistency**
    - **Validates: Requirements 17.2**

  - [ ]* 16.5 Write property test for monospace font usage
    - **Property 17: Monospace Font for Technical Content**
    - **Validates: Requirements 5.4, 20.3**

  - [ ]* 16.6 Write property test for accent strip activation
    - **Property 18: Accent Strip Activation**
    - **Validates: Requirements 4.3, 4.5, 8.3**

  - [ ]* 16.7 Write property test for information density
    - **Property 19: Information Density Increase**
    - **Validates: Requirements 8.4, 19.1, 19.2, 19.3, 19.4**

  - [ ]* 16.8 Write property test for technical language usage
    - **Property 20: Technical Language Usage**
    - **Validates: Requirements 20.7**

- [ ] 17. Final checkpoint - Complete verification
  - Run full test suite (unit + property tests)
  - Verify Lighthouse score is 90+
  - Test on desktop, laptop, tablet, and mobile devices
  - Verify accessibility with screen reader
  - Test keyboard navigation throughout
  - Verify no Celo references remain
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: foundation → components → integration → optimization
- Fast-check library is already installed for property-based testing
- All animations use GPU-friendly properties (transform, opacity)
- Design system tokens are centralized in globals.css for consistency
