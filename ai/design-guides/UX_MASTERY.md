# UX Mastery Guide

Compiled from 15+ UX experts (Norman, Nielsen, Krug, Spool, Wroblewski, Friedman, Reichenstein, Kennedy, Butterick, Verou, Soueidan) and 6 world-class dark UIs (Linear, Vercel/Geist, GitHub, Raycast, Stripe, Arc).

---

## 1. Typography System

### Font Size Scale [CONSENSUS]

| Token | Size | Line Height | Letter Spacing | Use |
|-------|------|-------------|----------------|-----|
| xs | 12px (0.75rem) | 1.4 | 0 | Labels, metadata |
| sm | 13px (0.8125rem) | 1.5 | -0.01em | Captions, secondary |
| base | 15px (0.9375rem) | 1.6 | -0.011em | Body text |
| lg | 17px (1.0625rem) | 1.6 | 0 | Large body |
| xl | 21px (1.3125rem) | 1.33 | -0.012em | H4 / subhead |
| 2xl | 24px (1.5rem) | 1.33 | -0.012em | H3 |
| 3xl | 32px (2rem) | 1.125 | -0.022em | H2 |
| 4xl | 40px (2.5rem) | 1.1 | -0.022em | H1 |
| 5xl | 48px (3rem) | 1.1 | -0.022em | Display |
| 6xl | 64px (4rem) | 1.06 | -0.022em | Hero |

Source: Linear's type scale matches across Raycast, Vercel. This is the production consensus.

**Body text minimum:** 16px on mobile (iOS zooms inputs below 16px), 15-18px on desktop [CONSENSUS: Reichenstein, Kennedy, Butterick, Nielsen].

**Limit to ~4 font sizes per page** (Kennedy). Pick from the scale above; don't use all of them at once.

### Line Height Rules [CONSENSUS]

```
Display/hero (48-72px):   1.0 - 1.1
Large headings (32-48px): 1.1 - 1.25
Small headings (20-28px): 1.25 - 1.4
Body text (14-18px):      1.5 - 1.6
Small/meta (11-13px):     1.4 - 1.5
```

Rule: line-height tightens as font size increases. Universal across all 6 sites.

Wider columns need more line-height (Reichenstein). Narrow columns (mobile) can use the lower end.

### Letter Spacing Rules

```
Display text (48px+):    -0.02em to -0.03em (tight)
Headings (24-48px):      -0.01em to -0.02em
Body text (14-18px):     -0.01em to 0
Small text (12-13px):    0 to +0.01em
ALL CAPS / labels:       +0.05em to +0.12em
```

Never adjust letterspacing on lowercase body text (Butterick). ALL CAPS text without extra spacing looks broken.

### Font Weight for Dark Mode [CONSENSUS]

Dark backgrounds make light text glow/bloom, increasing perceived weight (Reichenstein, Kennedy, NN/g).

| Light Mode | Dark Mode Equivalent |
|-----------|---------------------|
| 300 (light) | 400 (regular) |
| 400 (regular) | 500 (medium) |
| 500 (medium) | 500-510 |

Avoid weights 100-200 in dark mode entirely. Variable fonts with optical grading are the best solution.

### Line Length [CONSENSUS: all experts]

- Optimal: 45-90 characters per line
- Sweet spot: 65-75 characters (Nielsen: 66)
- CSS: `max-width: 33em` on the content container
- Lines over 90 chars = the most common web typography failure (Butterick)

---

## 2. Color & Contrast (Dark Mode)

### Background Layer System

Extracted from Linear, Vercel, GitHub, Raycast, Stripe. Nobody uses pure black.

```css
--bg-base:      #0a0a0c;   /* Page background       L: ~3%  */
--bg-surface:   #111214;   /* Cards, panels          L: ~7%  */
--bg-elevated:  #1b1c1e;   /* Modals, dropdowns      L: ~11% */
--bg-overlay:   #2a2c30;   /* Hover states, overlays  L: ~17% */
--bg-emphasis:  #3d4048;   /* Active states           L: ~25% */
```

Each layer adds ~4-6% lightness. Max 4 layers before it stops feeling like dark mode.

Reference values from specific sites:

| Site | Page BG | Surface | Elevated |
|------|---------|---------|----------|
| Linear | #08090a | #111214 | #1b1c1e |
| GitHub | #0d1117 | #151b23 | #212830 |
| Raycast | #07080a | #0c0d0f | #1b1c1e |
| Vercel | #000000 | #0a0a0a | #1a1a1a |
| Stripe | #14171D | #1B1E25 | -- |

### Text Hierarchy (5 levels)

```css
--text-primary:    #f0f0f3;   /* Headings    L: ~94%  ~16:1 vs base */
--text-body:       #b8bcc5;   /* Body copy   L: ~74%  ~9.5:1        */
--text-secondary:  #8b9099;   /* Meta, desc  L: ~57%  ~5.5:1        */
--text-muted:      #5c6370;   /* Hints       L: ~40%  ~3.2:1        */
--text-disabled:   #3d4048;   /* Disabled    L: ~25%  ~2:1          */
```

Each step drops ~15-20% lightness [CONSENSUS]. Ranges across all 6 sites: L1 #ededed-#f7f8f8, L2 #b7bdc8-#c9ced8, L3 #8a8f98-#9c9c9d, L4 #656c76-#78787c, L5 #434345-#5e6366.

### Minimum Contrast Ratios

**WCAG 2.1 (current legal standard):**

| Element | AA Minimum | AAA Target |
|---------|-----------|------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (>=18px or >=14px bold) | 3:1 | 4.5:1 |
| UI components & icons | 3:1 | -- |
| Focus indicator vs adjacent | 3:1 | -- |

**APCA Lc Values (proposed WCAG 3.0):**

| Use Case | Min Lc | Font Requirements |
|----------|--------|-------------------|
| Body text (preferred) | Lc 90 | 14px/400 or 18px/300 |
| Body text (minimum) | Lc 75 | 18px/400, 16px/500, 14px/700 |
| Non-body content | Lc 60 | 24px/400, 18px/600 |
| Headlines | Lc 45 | 36px/400, 24px/700 |
| Placeholders, disabled | Lc 30 | Absolute minimum readable |
| Perception threshold | Lc 15 | Below this, most users can't see it |

Key: light-on-dark needs ~15-20% more Lc than dark-on-light for equivalent readability (Verou). WCAG 2.1 doesn't account for this asymmetry.

### Accent Color Desaturation [CONSENSUS]

Saturated colors on dark backgrounds cause visual vibration and eye strain.

```css
/* Dark-safe accent colors (L: 55-70%, reduced chroma) */
--blue:    hsl(210, 100%, 66%);   /* Links, info */
--red:     hsl(358, 75%, 65%);    /* Errors */
--green:   hsl(135, 50%, 55%);    /* Success */
--amber:   hsl(39, 90%, 50%);     /* Warnings */
--purple:  hsl(275, 70%, 68%);    /* Tags */
```

To desaturate for dark mode: in OKLCh, reduce chroma (C) by 20-30% while keeping hue constant (Verou). Never use HSL for perceptual color math; HSL lightness is not uniform across hues.

### Colors to Avoid

- Pure #FFFFFF on pure #000000: 21:1 contrast causes halation. Target 15-18:1 max.
- Full-saturation brand colors on dark bg: visual vibration.
- Using `filter: invert(1)` instead of a proper dark palette: breaks all contrast relationships.

---

## 3. Spacing & Layout

### The 8pt Grid System [CONSENSUS: Friedman]

All spacing values based on multiples of 8, with 4pt half-steps for tight spots.

```css
--space-1:   4px;    /* 0.25rem - icon padding, tight gaps */
--space-2:   8px;    /* 0.5rem  - inline gaps */
--space-3:  12px;    /* 0.75rem - tight component padding */
--space-4:  16px;    /* 1rem    - default component padding */
--space-6:  24px;    /* 1.5rem  - between related components */
--space-8:  32px;    /* 2rem    - section padding */
--space-10: 40px;    /* 2.5rem  - between sections */
--space-12: 48px;    /* 3rem    - major breaks */
--space-16: 64px;    /* 4rem    - page-level spacing */
--space-24: 96px;    /* 6rem    - hero spacing */
```

Vercel uses 4px base (4, 8, 12, 16, 24, 32, 64, 96, 128). Linear and Raycast follow the same pattern.

### Internal Padding vs External Gap Rule [CONSENSUS: Friedman]

**Internal spacing (padding) must be <= external spacing (gap/margin).**

When padding inside a card equals the gap between cards, users can't tell where one card ends and another begins. This breaks visual grouping (Gestalt proximity principle).

### Whitespace Rules

- "Double what feels natural" (Kennedy). Almost nobody uses too much whitespace.
- Vertical space between menu items: ~2x the text height (Kennedy)
- Space between groups of elements: 25px+ (Kennedy)
- Heading emphasis: generous space above/below, not just size/bold (Butterick)
- Whitespace is not wasted space. Proper spacing improves comprehension by ~20% (research-backed, Friedman)
- Internal < external padding at every nesting level [CONSENSUS]

### Responsive Breakpoints

Content-driven breakpoints > device-specific (Friedman). But practical defaults:

```css
--bp-mobile:    480px;
--bp-tablet:    768px;
--bp-laptop:    1024px;
--bp-desktop:   1280px;
--bp-wide:      1440px;
--bp-ultrawide: 1920px;
```

Rules:
1. Mobile-first: base CSS for mobile, `min-width` queries to add complexity [CONSENSUS]
2. Max content width: 1200-1440px
3. Fluid over fixed: use `clamp()`, `min()`, `max()`, `rem`, `%`, `vw`
4. 3-5 breakpoints max
5. Use `@media (hover: hover)` and `@media (pointer: fine)` for input detection, not screen width

```css
/* Fluid type example */
font-size: clamp(1rem, 2.5vw, 2rem);

/* Fluid spacing */
padding: clamp(1rem, 3vw, 3rem);
```

---

## 4. Visual Hierarchy

### Size Ratios Between Heading Levels

Use a modular scale from a base size. Recommended scales (base = 16px):

| Ratio | Name | Good For |
|-------|------|----------|
| 1.200 | Minor Third | Mobile, tight spaces |
| **1.250** | **Major Third** | **Most web apps** [CONSENSUS] |
| 1.333 | Perfect Fourth | Editorial, content-heavy |
| 1.618 | Golden Ratio | Landing pages, hero sections |

On mobile, use a tighter ratio (1.200-1.250). On desktop, use wider (1.250-1.333). Adjacent heading levels need at least 20-25% size difference to register as distinct.

### The F-Pattern (text-heavy pages)

From NN/g eye-tracking (confirmed twice, 11 years apart):
- Users read across the top, then a shorter second line, then scan the left side vertically
- First 2-3 words of each line get the most fixation
- Use for: articles, search results, docs, blog posts, news

Design tactics:
- Front-load important words in headings and first sentences
- Use descriptive subheadings as scanning anchors
- Bold key terms. Left-align text. Never center body copy.

### The Z-Pattern (visual/minimal pages)

- Top-left: Logo. Top-right: CTA/nav.
- Center: Hero image or key message.
- Bottom-left: Supporting info. Bottom-right: Primary CTA.
- Use for: landing pages, hero sections, onboarding, product launches

### The Billboard Test [CONSENSUS: Krug]

If a user can't identify the page purpose in 3-5 seconds, you've failed. Design for scanning, not reading. Every page is a billboard at 60 mph.

### Information Density Balance

| Density Level | Content-to-Space Ratio | Use For |
|---------------|----------------------|---------|
| Low | 30-40% content | Landing pages, portfolios |
| Medium | 50-60% content | SaaS dashboards, docs |
| High | 60-75% content | Data tables, dev tools |

"Every extra unit of information competes with every other piece" (Nielsen). When everything is emphasized, nothing is.

---

## 5. Interactive Elements

### Touch Target Minimums [CONSENSUS]

| Standard | Minimum | Recommended |
|----------|---------|-------------|
| Apple iOS | 44x44pt | -- |
| Material Design 3 | 48x48dp | -- |
| WCAG 2.2 AA | 24x24px | 44x44px |
| Safe universal | **44x44px** | **48x48px** |

Spacing between adjacent targets: 8px minimum (16px recommended).
Icon buttons: icon can be 24px but tap target must be 44-48px (use padding).

### Button Sizing (Fitts's Law)

Movement time = a + b * log2(Distance/Size + 1). Bigger + closer = faster to click.

| Context | Min Height | Min Width | Recommended |
|---------|-----------|-----------|-------------|
| Desktop primary | 36px | 80px | 40-48px tall |
| Desktop secondary | 32px | 64px | 36-40px tall |
| Mobile primary | 44px | 120px | 48-56px tall |
| Mobile icon | 44x44px | -- | 48x48px |

Destructive actions: make them smaller and further from common actions. Intentional friction.

### State Feedback (Material Design 3 values)

| State | Opacity Overlay | Timing | Notes |
|-------|----------------|--------|-------|
| Enabled | 0% | -- | Default, no overlay |
| Hover | **8%** | < 150ms | `currentColor` overlay |
| Focus | **12%** | immediate | + focus ring |
| Pressed/Active | **12%** | < 100ms | Distinct from hover (scale, darken) |
| Dragged | **16%** | -- | During drag |
| Disabled (container) | **12%** | -- | Reduced |
| Disabled (content) | **38%** | -- | Text/icon opacity |

Only one state layer at a time. Implementation:

```css
.button {
  position: relative;
}
.button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: none;
}
.button:hover::before        { opacity: 0.08; }
.button:focus-visible::before { opacity: 0.12; }
.button:active::before       { opacity: 0.12; }
.button:disabled             { opacity: 0.38; }
.button:disabled::before     { opacity: 0; }
```

### Animation Timing [CONSENSUS: Nielsen + M3]

| Threshold | Perception | Use For |
|-----------|-----------|---------|
| < 100ms | Instantaneous | Button states, hover, toggles |
| 100-200ms | Fast, acknowledges input | Dropdowns, tooltips |
| 200-300ms | Smooth, perceivable | Modals, nav transitions |
| 300-500ms | Deliberate | Page transitions, accordions |
| > 500ms | Feels slow | Only dramatic reveals |
| > 1000ms | Needs progress indicator | Loading states |

Desktop: 150-200ms. Mobile: up to 300ms. Never exceed 400ms for direct manipulation.

### Easing Curves (Material Design 3)

```css
/* Standard: simple transitions (color, opacity) */
--ease-standard: cubic-bezier(0.2, 0, 0, 1);

/* Enter: elements appearing on screen */
--ease-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);

/* Exit: elements leaving screen */
--ease-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);

/* Legacy (M2 compatible) */
--ease-legacy: cubic-bezier(0.4, 0, 0.2, 1);
```

### Focus Indicators for Dark Mode

Soueidan's "Oreo" technique -- visible on ANY background:

```css
/* Light mode */
:focus-visible {
  outline: 3px solid black;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px white;
}

/* Dark mode */
:focus-visible {
  outline: 3px solid white;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px black;
}

/* Universal (works in both + Windows High Contrast Mode) */
:focus-visible {
  outline: 3px solid transparent;
  box-shadow: 0 0 0 3px #fff, 0 0 0 6px #000;
}
```

Always use `outline` (not just `box-shadow`) because Windows High Contrast Mode overrides box-shadows. Always use `:focus-visible` over `:focus` to avoid showing rings on mouse clicks.

---

## 6. Text Over Complex Backgrounds

| # | Method | CSS | Best For |
|---|--------|-----|----------|
| 1 | **Dark overlay** | `background: rgba(0,0,0,0.35)` | Static images, video (0.4-0.5) |
| 2 | **Floor fade** | `background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%)` | Cards with text at bottom |
| 3 | **Scrim** | `background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)` | Centered text over images |
| 4 | **Backdrop blur** | `backdrop-filter: blur(8px) brightness(0.7)` | Dynamic/animated backgrounds |
| 5 | **Text shadow** | `text-shadow: 0 1px 3px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)` | Particles, bloom effects |
| 6 | **Solid pill** | `background: rgba(0,0,0,0.6); padding: 4px 12px; border-radius: 4px` | Nuclear option, guarantees legibility |

### When to Use Each

| Background Type | Best Method |
|----------------|-------------|
| Static image | Floor fade or overlay |
| Dynamic/animated | Backdrop blur + darken |
| Particles/bloom | Text shadow + slight darken |
| Gradient | Solid pill or text shadow (gradient-on-gradient = muddy) |
| Video | Overlay at 40-50% |

---

## 7. Accessibility Minimums

### WCAG Contrast Requirements

| Element | AA | AAA |
|---------|-----|------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (>=18px or >=14px bold) | 3:1 | 4.5:1 |
| UI components & icons | 3:1 | -- |
| Focus indicator | 3:1 (focused vs unfocused) | 2px+ perimeter, 3:1 |

### ARIA Landmarks

Use semantic HTML before ARIA. "No ARIA is better than bad ARIA" (Soueidan).

Required structure: `<header>` (banner), `<nav aria-label="...">` (navigation), `<main>` (ONE per page), `<section aria-label="...">` (region, needs label), `<aside>` (complementary), `<footer>` (contentinfo). Multiple `<nav>` elements each need unique `aria-label`.

### Focus Management

- Never remove focus outlines without replacement
- Skip-to-content link as first focusable element
- Modal dialogs trap focus and return focus on close
- Use `aria-live="polite"` for dynamic content (toasts, validation)
- Use `aria-live="assertive"` only for critical alerts
- Live region element must exist in DOM before injecting content

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Screen Reader Checklist

- [ ] Skip-to-content link first
- [ ] Single `<main>` per page
- [ ] All content inside landmarks
- [ ] Unique `aria-label` on duplicate landmarks
- [ ] `aria-live` regions for dynamic content
- [ ] All images have `alt` (empty `alt=""` for decorative)
- [ ] Form inputs have `<label>` elements
- [ ] Errors linked via `aria-describedby`
- [ ] Custom controls have `role`, `aria-*`, and keyboard handling

---

## 8. Dark Mode Specific Rules

### The 10 Rules Every Top Dark UI Follows

1. **No pure black, no pure white.** Background: #08-#14 range. Text maxes at #ededed-#f7f8f8. [CONSENSUS: all 6 sites]

2. **4-level text hierarchy minimum.** Primary, body, secondary, muted. Each step drops ~15-20% lightness. [CONSENSUS]

3. **Body text contrast: 7:1 minimum.** All top sites exceed WCAG AA (4.5:1). Most hit AAA (7:1). [CONSENSUS]

4. **Tighter line-height as size increases.** Display = 1.0-1.1, body = 1.5-1.6. No exceptions. [CONSENSUS]

5. **Negative letter-spacing on headings.** -0.02em for display, approaching 0 for body. [CONSENSUS]

6. **Borders are white at 8-25% opacity.** Not gray hex. Automatically adapts to any dark background. [CONSENSUS]

7. **Desaturated, lightened accent colors.** L:55-70%, saturation drops 10-20% from light mode. [CONSENSUS]

8. **Shadows replaced by surface elevation.** Background lightness increases per layer. Shadows are invisible on dark. [CONSENSUS]

9. **4px or 8px spacing grid.** Every site uses one. Most use 4px with steps at 4, 8, 12, 16, 24, 32, 64. [CONSENSUS]

10. **Inter or system stack.** Sans-serif, optimized for screen. Linear + Raycast use Inter; Vercel built Geist; GitHub uses system. [CONSENSUS]

### Background Elevation Pattern

Use tonal elevation (Material Design 3) instead of shadows. Each elevation level adds a semi-transparent primary color overlay:

```css
/* Tonal elevation: lighter surface tint for higher elements */
--surface-0: #0a0a0c;                                  /* flat */
--surface-1: color-mix(in oklch, #0a0a0c, var(--primary) 5%);  /* card */
--surface-2: color-mix(in oklch, #0a0a0c, var(--primary) 8%);  /* dropdown */
--surface-3: color-mix(in oklch, #0a0a0c, var(--primary) 11%); /* modal */
```

### Border / Divider Approach

```css
--border-subtle:  rgba(255,255,255, 0.08);   /* Dividers */
--border-default: rgba(255,255,255, 0.15);   /* Input borders */
--border-strong:  rgba(255,255,255, 0.25);   /* Focus rings */
```

Linear uses minimal borders (spacing instead). Vercel uses shadow-based borders (`0 0 0 1px #ffffff25`). GitHub uses higher-contrast borders (#b7bdc8).

### Avoiding Halation

Halation = light text bleeding into dark background, creating a halo. ~47% of people have some astigmatism.

Fixes:
- Use off-white (#ededed) not pure white (#ffffff) [CONSENSUS]
- Slightly heavier font weight (bump one step) [CONSENSUS: Reichenstein, Kennedy]
- Increase letterspacing slightly for white-on-dark text
- Target 15-18:1 max contrast, not 21:1

### Font Weight Adjustment

Light text on dark backgrounds appears thinner than the same weight on light backgrounds. Compensate:

```css
@media (prefers-color-scheme: dark) {
  body {
    font-weight: 450; /* bump from 400 */
    -webkit-font-smoothing: antialiased;
  }
}
```

---

## 9. Quick Reference Card

### Font Sizes

| Token | px | rem | Line Height | Letter Spacing |
|-------|------|------|-------------|---------------|
| xs | 12 | 0.75 | 1.4 | 0 |
| sm | 13 | 0.8125 | 1.5 | -0.01em |
| base | 15 | 0.9375 | 1.6 | -0.011em |
| lg | 17 | 1.0625 | 1.6 | 0 |
| xl | 21 | 1.3125 | 1.33 | -0.012em |
| 2xl | 24 | 1.5 | 1.33 | -0.012em |
| 3xl | 32 | 2 | 1.125 | -0.022em |
| 4xl | 40 | 2.5 | 1.1 | -0.022em |
| 5xl | 48 | 3 | 1.1 | -0.022em |
| 6xl | 64 | 4 | 1.06 | -0.022em |

### Colors (Dark Mode)

| Token | Hex | Opacity Equiv | Contrast vs #0a0a0c |
|-------|-----|--------------|---------------------|
| text-primary | #f0f0f3 | ~94% white | ~16:1 (AAA) |
| text-body | #b8bcc5 | ~74% white | ~9.5:1 (AAA) |
| text-secondary | #8b9099 | ~57% white | ~5.5:1 (AA) |
| text-muted | #5c6370 | ~40% white | ~3.2:1 (large only) |
| text-disabled | #3d4048 | ~25% white | ~2:1 (decorative) |
| bg-base | #0a0a0c | -- | -- |
| bg-surface | #111214 | -- | -- |
| bg-elevated | #1b1c1e | -- | -- |
| bg-overlay | #2a2c30 | -- | -- |
| border-subtle | rgba(255,255,255,0.08) | -- | -- |
| border-default | rgba(255,255,255,0.15) | -- | -- |
| border-strong | rgba(255,255,255,0.25) | -- | -- |

### Spacing

| Token | px | rem |
|-------|------|------|
| 1 | 4 | 0.25 |
| 2 | 8 | 0.5 |
| 3 | 12 | 0.75 |
| 4 | 16 | 1 |
| 6 | 24 | 1.5 |
| 8 | 32 | 2 |
| 12 | 48 | 3 |
| 16 | 64 | 4 |
| 24 | 96 | 6 |

### Timing

| Duration | Use |
|----------|-----|
| 50ms | Ripple start, checkbox tick |
| 100ms | Color shifts, opacity changes |
| 150ms | Hover states |
| 200ms | Button press, small transitions |
| 250ms | Dropdown open |
| 300ms | Modal entry, mega-dropdown max |
| 400ms | Large layout changes (max for direct manipulation) |

### Easing

| Name | Value | Use |
|------|-------|-----|
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | Color, opacity |
| Enter | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Elements appearing |
| Exit | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Elements leaving |
| Legacy | `cubic-bezier(0.4, 0, 0.2, 1)` | M2 compat |

### State Overlays

| State | Opacity |
|-------|---------|
| Hover | 8% |
| Focus | 12% |
| Pressed | 12% |
| Dragged | 16% |
| Disabled (content) | 38% |

### Touch Targets

| Context | Minimum | Recommended |
|---------|---------|-------------|
| Mobile tap | 44px | 48px |
| Desktop click | 24px | 36px |
| Target spacing | 8px | 16px |

### Contrast

| Standard | Normal Text | Large Text |
|----------|------------|------------|
| WCAG AA | 4.5:1 | 3:1 |
| WCAG AAA | 7:1 | 4.5:1 |
| APCA body (preferred) | Lc 90 | -- |
| APCA body (minimum) | Lc 75 | -- |
| APCA headline | Lc 45 | -- |

### Key Dimensions

| Metric | Value |
|--------|-------|
| Line length | 45-90 chars (sweet spot: 66) |
| Max content width | 1200-1440px |
| Heading scale ratio | 1.250 (app), 1.333 (editorial) |
| Sizes per page | ~4 |
| Breakpoints | 3-5 |
| Max dark bg contrast | 15-18:1 (not 21:1) |

---

## 10. Anti-Patterns (Things That Make UI Look Like AI Slop)

### Typography Anti-Patterns

- **Too many font sizes.** The #1 beginner mistake (Kennedy). Pick 4, max 5.
- **Body text below 15px on desktop.** Butterick, Kennedy, Nielsen all agree.
- **Lines over 90 characters.** The most common web typography failure.
- **Same line-height everywhere.** Display text needs 1.0-1.1, body needs 1.5-1.6. One value for all = broken.
- **No letterspacing on ALL CAPS.** Caps text without +0.05em+ looks cramped.
- **Stacking bold AND italic.** Pick one (Butterick).

### Dark Mode Anti-Patterns

- **Pure #000 background with pure #FFF text.** 21:1 causes halation. ~47% of users have astigmatism.
- **Simply inverting the light theme.** Contrast is asymmetric. Dark mode needs its own derived palette (Verou).
- **Using shadows for hierarchy.** Shadows are invisible on dark backgrounds. Use tonal elevation.
- **Oversaturated accent colors.** Colors that "glow" or pulse = too saturated. Reduce chroma 20-30%.
- **Same font weight as light mode.** Dark bg makes text appear thinner. Bump one weight level.
- **Focus rings that disappear.** Default blue/black outlines vanish on dark backgrounds.
- **Low-contrast disabled states that look invisible.** Users can't tell disabled from absent.

### Layout Anti-Patterns

- **Not enough whitespace.** The #2 beginner error (Kennedy). Double what feels natural.
- **Internal padding = external gap.** Users can't parse component boundaries (Friedman).
- **Everything is high-emphasis.** If everything is bold/large/colored, nothing stands out (Kennedy, Nielsen, Butterick).
- **Inconsistent spacing tokens.** 12px here, 15px there, 18px elsewhere. Pick a scale.
- **Fixed spacing that doesn't scale.** Use fluid values (clamp, calc, rem).
- **Centering body text.** Body copy should be left-aligned for F-pattern scanning.

### Interaction Anti-Patterns

- **No hover/active feedback.** Every clickable element needs a state change (Norman).
- **Hover-only interactions.** Breaks on touch devices (Friedman).
- **Animations over 400ms for direct manipulation.** Feels sluggish.
- **No loading indicator after 1 second.** Users assume the app is broken (Nielsen).
- **Removing focus outlines with no replacement.** Accessibility destruction (Soueidan).
- **Placeholder-only form labels.** Labels vanish on input focus (Wroblewski).
- **Mystery meat navigation.** Icons without labels (Nielsen).
- **Multi-column forms.** Eye tracking shows users miss the right column (Wroblewski).

### Content Anti-Patterns

- **Happy talk intros.** "Welcome to our platform that..." Delete all of it (Krug).
- **Instructions nobody reads.** If you need instructions, the design failed (Krug).
- **Cute/branded names for standard things.** "Career Ecosystem" instead of "Jobs" (Krug).
- **Walls of text.** Use headings, bullets, bold key phrases. Format for scanning.
- **Using both paragraph indent AND spacing.** Pick one (Butterick).

---

## Sources

### Experts
- Oliver Reichenstein (iA) -- Typography, responsive type, font grading
- Erik Kennedy (Learn UI Design) -- Visual hierarchy, whitespace, text-over-image
- Matthew Butterick (Practical Typography) -- Line length, letterspacing, the Big Four
- Jakob Nielsen (NN/g) -- Usability heuristics, F-pattern, response times
- Steve Krug (Don't Make Me Think) -- Scanning, billboard test, word reduction
- Luke Wroblewski (Mobile First) -- Touch targets, form UX, thumb zones
- Jared Spool (UIE) -- Knowledge gap, progressive disclosure, cognitive load
- Don Norman (Design of Everyday Things) -- Affordances, signifiers, feedback
- Vitaly Friedman (Smashing Magazine) -- 8pt grid, component spacing, mega-dropdowns
- Lea Verou (W3C CSS WG) -- APCA, OKLCh, color science, contrast
- Sara Soueidan (Practical Accessibility) -- Focus indicators, ARIA, landmarks

### Dark UI Reference Sites
- Linear (linear.app)
- Vercel / Geist (vercel.com)
- GitHub (github.com)
- Raycast (raycast.com)
- Stripe (stripe.com)
- Arc (arc.net)

### Standards
- WCAG 2.1 / 2.2 (W3C)
- APCA (proposed WCAG 3.0)
- Material Design 3 (Google)
- Apple Human Interface Guidelines
