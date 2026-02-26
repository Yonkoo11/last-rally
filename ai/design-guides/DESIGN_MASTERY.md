# Design Mastery Reference

The definitive reference for building world-class UI. Every line contains a specific value, technique, or insight. Organized by topic, sourced from the best practitioners working today.

**Contributors cited:** Emil Kowalski (Linear), Rauno Freiberg (Vercel), Steve Schoger (Refactoring UI), Paco Coursey (Linear), Shu Ding (Vercel), Erik Kennedy (Learn UI Design), Josh Comeau, Tobias van Schneider (ex-Spotify), Cassie Evans (GreenSock), plus design systems from Linear, Stripe, Apple, Vercel, Material Design, Uniswap, Paradigm, Abstract, and Rainbow.

---

## 1. Typography

### Font Size Scale

Start body text at **17px** (Erik Kennedy). This is the single best starting point for web UI.

| Element | Desktop | Mobile |
|---------|---------|--------|
| Hero headline | 48-96px | 32-48px |
| Section headline | 36-48px | 24-36px |
| Subheading | 24-32px | 18-24px |
| Body | 16-18px | 16-17px |
| Secondary/muted | 14-15px | 14-15px |
| Captions/labels | 12-13px | 12-13px |

**Use at most 4 font sizes per page** (Kennedy). Even interaction-heavy pages rarely need more. Too many sizes is the #1 beginner typography mistake.

**Nonlinear type scale** (Schoger): Tighter increments at small sizes, larger jumps at big sizes. Example: 12, 14, 16, 18, 21, 24, 36, 48, 60, 72px.

Desktop pixels are ~33% smaller than mobile pixels. Scale desktop text up accordingly for reading-heavy pages.

### Weight Pairing

**The "up-pop / down-pop" rule** (Kennedy): Pair competing properties. A headline that is large but light (300 weight) or small but bold (700 weight) creates interesting tension.

| Pattern | Example |
|---------|---------|
| Large + Light | 48px / weight 300 |
| Small + Bold + Uppercase + Tracked | 12px / weight 700 / uppercase / 0.1em tracking |
| Medium + Medium (boring, avoid) | 24px / weight 400 |

**Never use font weights under 400 for UI work** (Schoger). Light/thin weights (100-300) can work for large headings but are unreadable at body sizes. To de-emphasize text, use lighter color or smaller size instead.

**If text of different sizes should feel the same weight, make larger text thinner and smaller text bolder** (Schoger). Optical weight changes with size.

**Consensus across all sources:** Use weight, color, AND size to create hierarchy, never just font-size alone. Schoger, Kennedy, and Rauno all emphasize this independently.

### Line Height

| Text size | Line height |
|-----------|-------------|
| Body (16-18px) | 1.5-1.65 |
| Subheading (24-32px) | 1.3-1.4 |
| Headline (36-72px) | 1.1-1.2 |
| Display (72px+) | 1.0-1.1 |

As text gets bigger, line height gets tighter. A 96px headline at 1.5 line-height looks like double-spaced homework.

**Paragraph width: 45-75 characters per line** (Schoger). Use `em` units (20-35em) to control this regardless of font size.

### Letter Spacing

| Context | Letter spacing |
|---------|---------------|
| Body text | 0 (default) |
| Headlines 48px+ | -0.01em to -0.03em (tighten) |
| ALL CAPS labels | +0.05em to +0.15em (loosen) |
| Monospace/code | 0 (default) |

**Widen letter-spacing on ALL-CAPS text** (Schoger). Uppercase letters are designed to work next to lowercase; they look cramped when all-caps without extra tracking.

### Font Selection

**Sans-serif for UI/body:** Inter, Geist Sans, SF Pro, system-ui. Neutral, geometric, legible at small sizes.

**Monospace for code:** Geist Mono, JetBrains Mono, SF Mono, Fira Code.

**Display for personality:** One custom or distinctive font for headlines only. This is where you differentiate.
- Linear: Inter everywhere (neutral brand)
- Stripe: Sohne at weight 500 (geometric, premium)
- Paradigm: Monospace labels + serif body (intellectual, research-lab feel)
- Uniswap: Serif headlines + sans-serif body (authority + clarity)

**The Rams principle:** Use one typeface family. Vary weight and size, not font family. Every additional font family adds cognitive load.

**Prefer sans-serif for UI** (Schoger). Look for fonts with 8+ weights. Inter is the strongest free option. Most Google Fonts lack sufficient style variety.

### Rendering

```css
body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

Subset fonts based on content/alphabet/language (Rauno). Font weight should not change on hover or selected state to prevent layout shift.

### The Geist System (Vercel)

Geist pre-sets combinations of font-size, line-height, letter-spacing, and font-weight as atomic tokens. Don't set these four properties independently. Define them as bundled presets (like Tailwind's `text-sm`, `text-lg`) so they always work together.

### Apple SF Pro

SF Pro has two optical sizes:
- **SF Text** for sizes below 20pt (optimized for legibility)
- **SF Display** for sizes 20pt and above (optimized for aesthetics)

The font literally changes shape at different sizes. On the web, choose appropriate fonts for different sizes manually.

### Common Mistakes

- Using too many font sizes (more than 4 per page)
- Using light weights (100-300) at body size
- Left-aligning short headings when center would work, or center-aligning text longer than 2-3 lines
- Not tightening letter-spacing on large headlines
- Not widening letter-spacing on all-caps labels
- Setting line height, font size, weight, and letter-spacing independently instead of as bundled presets
- Changing font weight on hover (causes layout shift)

---

## 2. Color

### The HSB/HSL Method

**Never pick colors in RGB or hex directly** (Kennedy, Schoger). Use HSB (Hue, Saturation, Brightness) or HSL.

**Darker variations:** Lower brightness + increase saturation simultaneously. Never just subtract brightness alone (produces muddy, lifeless darks).

**Lighter variations:** Raise brightness + decrease saturation. Produces clean, airy lights instead of washed-out pastels.

**Single-hue palette generation** (Kennedy):
1. Pick one hue (e.g., blue at H:220)
2. Darkest shade: S:80, B:20
3. Lightest shade: S:10, B:95
4. Mid-tone: S:60, B:60
5. Accent/vibrant: S:90, B:80

### Building a Full Palette (Schoger)

For each color (primary, accent, grey, danger, warning, success), define 8-10 shades from very light to very dark BEFORE you start designing. You'll end up with 10+ colors, each with 5-10 shades.

**Saturate your greys** (Schoger). Pure grey (#888, etc.) looks lifeless. Add a tiny bit of blue for cooler feel or brown/warm yellow for warmer feel. Increase saturation slightly on your lightest and darkest grey shades.

**Make gradients more vibrant** by rotating the hue 10-20 degrees between start and end color, not just changing lightness (Schoger).

### Color Hierarchy (Tobias van Schneider)

Maximum 2-3 colors in any design:
- **One subtle background color** (the majority of pixels)
- **One highlight** (used sparingly for interactive elements)
- **One high-contrast color** (used for the most important element on screen)

Don't study color theory. Collect colors from photography, architecture, fashion. Build a personal color library from the real world.

### Perceptually Uniform Color (Stripe)

Stripe uses CIELAB (Lab) color space instead of HSL for generating color scales. In HSL, `hsl(60, 100%, 50%)` (yellow) looks way brighter than `hsl(240, 100%, 50%)` (blue) at the same "lightness." Lab fixes this.

**Practical shortcut:** Use OKLCH in CSS. `oklch(65% 0.2 250)` gives you perceptually uniform colors natively in modern browsers. Your yellow-500 and blue-500 will actually look the same weight.

### Vercel's Semantic Color Layers

| Layer | Purpose | Count |
|-------|---------|-------|
| Background | Page backgrounds | 2 values (primary + subtle) |
| Component BG | UI element fills | 3 values (default, hover, active) |
| Border | UI element borders | 3 values (subtle, default, strong) |
| High Contrast BG | Buttons, badges | 2 values |

Background 1 is your default. Background 2 is only for subtle differentiation. Component colors step through default -> hover -> active.

### The Single-Accent Strategy (Web3 Consensus)

The biggest brand recognition gains come from color consistency. Pick ONE saturated color. Use it everywhere it matters. Leave everything else neutral.
- Uniswap: `#FF007A` (hot pink) on black
- Paradigm: `#00D395` (green) on white/black
- Linear: accent color configurable, but always one at a time

### Color on Colored Backgrounds

**Never use grey text on colored backgrounds** (Schoger). Grey on white works because it reduces contrast. On a colored background, grey text looks washed out. Instead, pick a color that matches the background hue but with adjusted saturation and lightness.

**Lighter colors feel closer, darker colors feel farther away** (Schoger). Use this for depth: a slightly lighter panel on a slightly darker background creates natural elevation.

### Common Mistakes

- Picking colors in hex/RGB instead of HSL/HSB
- Creating darker shades by only reducing brightness (produces mud)
- Using more than 3 colors without strong justification
- Using grey text on colored backgrounds
- Not saturating greys (lifeless palette)
- Different hues having different perceived brightness at the same HSL lightness (use OKLCH to fix)
- Not defining your full palette before starting to design

---

## 3. Spacing & Layout

### The 8px Grid (Industry Standard)

Everything aligns to multiples of 8px. Use 4px only for tight adjustments.

| Token | Value | Use for |
|-------|-------|---------|
| xs | 4px | Icon gaps, tight padding |
| sm | 8px | Inline spacing, small gaps |
| md | 16px | Standard padding, element gaps |
| lg | 24px | Section padding, card padding |
| xl | 32px | Major element gaps |
| 2xl | 48px | Section gaps |
| 3xl | 64px | Major section separation |
| 4xl | 96px | Hero padding |
| 5xl | 128-200px | Between page sections |

**Schoger's constrained spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px. No two adjacent values should be closer than about 25% apart.

### The "Double Your Whitespace" Rule (Kennedy)

Whatever whitespace you think looks right, double it. A music player with 12px font should have 12px padding above AND below each menu item. Beginners consistently under-space.

**Start with way too much whitespace, then remove it until you're happy** (Schoger). Go in the opposite direction from your instinct.

**The hierarchy:** space between lines < space between elements < space between groups of elements. If your line spacing is 8px, your element spacing should be 16-24px, and your group spacing should be 32-48px+.

### Apple HIG Spacing

| Context | Value |
|---------|-------|
| Minimum touch target | 44x44 points |
| Root view margins (sides) | 16pt |
| Root view margin (top) | 20pt |
| Non-root view margins | 8pt all sides |
| Between major sections | 16-24pt |
| Between list items | 8-12pt |
| Card spacing | 16-24pt |
| Tab bar height | 50pt |

### Section Spacing

World-class sites use **120-200px gaps** between major page sections. This feels like "too much" when you're building, but it's the breathing room that makes pages feel premium vs. cramped.

### Layout Patterns

- **Max-width:** 1200-1400px for content containers
- **Centered layout** is the dominant pattern for dev tool / SaaS landing pages
- Never full-bleed text. Constrain to a readable line length (~65-75 characters)
- **Input width as affordance** (Schoger): Make input width match expected content length

### Visual Hierarchy (Apple HIG + Kennedy)

Hierarchy tools in order of strength:
1. **Size** (biggest = most important)
2. **Weight** (boldest = most important)
3. **Color/contrast** (highest contrast = most important)
4. **Position** (top/center = most important)
5. **Whitespace** (more space around = more important)
6. **Typography style** (different font = attention-grabbing)

Use 2-3 simultaneously. Using all 6 on one element is visual shouting.

### The Bento Grid

For feature showcases, use an asymmetric grid where cards have different sizes:
- One large card spanning 2 columns (hero feature)
- 2-4 medium cards (supporting features)
- Optional small cards for tertiary info

### One CTA Per Section

Never more than two buttons side by side. Primary CTA: filled/solid. Secondary: outlined or text. Primary always uses an action verb ("Start building", "Deploy", "Download").

**Actions have hierarchy** (Schoger):
- Primary: solid, high-contrast button
- Secondary: outline or lower-contrast button
- Tertiary: styled like links

### Interactive Element Spacing (Rauno)

Interactive elements in a vertical/horizontal list should have **no dead areas between each element**. Increase padding instead of adding gaps. This ensures the entire clickable area is seamless.

### Common Mistakes

- Under-spacing everything (the #1 layout mistake)
- Using percentage-based widths when fixed/max-width works better (Schoger)
- Forcing everything into a 12-column grid when components need their own sizing
- Having the same gap between items within a group and between groups
- Not using 120-200px gaps between major page sections
- Making touch targets smaller than 44x44pt

---

## 4. Shadows & Depth

### Layered Shadows (Josh Comeau)

Never use a single box-shadow. Layer 3-6 shadows with different offsets and blur radii.

**Low elevation (cards, subtle lift):**
```css
box-shadow:
  0.3px 0.5px 0.7px rgba(0,0,0,0.1),
  0.4px 0.8px 1px -1.2px rgba(0,0,0,0.1),
  1px 2px 2.5px -2.5px rgba(0,0,0,0.1);
```

**Medium elevation (dropdowns, popovers):**
```css
box-shadow:
  0.3px 0.5px 0.7px rgba(0,0,0,0.07),
  0.8px 1.6px 2px -0.8px rgba(0,0,0,0.07),
  2.1px 4.1px 5.2px -1.7px rgba(0,0,0,0.07),
  5px 10px 12.6px -2.5px rgba(0,0,0,0.07);
```

**High elevation (modals, dialogs):**
```css
box-shadow:
  0.3px 0.5px 0.7px rgba(0,0,0,0.05),
  1.5px 2.9px 3.7px -0.4px rgba(0,0,0,0.05),
  2.7px 5.4px 6.8px -0.7px rgba(0,0,0,0.05),
  4.5px 8.9px 11.2px -1.1px rgba(0,0,0,0.05),
  7.1px 14.3px 18px -1.4px rgba(0,0,0,0.05),
  11.2px 22.3px 28.1px -1.8px rgba(0,0,0,0.05),
  17px 34px 42.8px -2.1px rgba(0,0,0,0.05),
  25px 50px 62.9px -2.5px rgba(0,0,0,0.05);
```

### Schoger's Two-Shadow Technique

Simpler alternative. Two shadows per element, not one:
```css
box-shadow:
  0 4px 6px rgba(0, 0, 0, 0.07),   /* ambient */
  0 2px 4px rgba(0, 0, 0, 0.06);    /* direct */
```

The first shadow is larger/softer/lighter (ambient light). The second is tighter/darker/closer (direct shadow underneath).

### The "Light From the Sky" Rule (Kennedy)

Top of elements should be lighter, bottom darker:
- Top border: `1px solid rgba(255,255,255,0.05)` on dark mode elements
- Bottom shadow: the box-shadow values above
- Inner elements: `inset 0 1px 0 rgba(255,255,255,0.05)`

Inverted elements (inset fields, wells) get the opposite: darker top edge, lighter bottom.

### Shadows Replace Borders (Schoger)

When you need to separate elements, try these alternatives to borders:
1. **Box shadow** (subtle outline without visual weight)
2. **Different background colors** (natural separation)
3. **More spacing** (just increase the gap)

**Accent borders add personality cheaply** (Schoger). A 3-4px colored border on the left side or top of a card/alert/section heading adds visual interest. One of the highest-ROI design tricks.

### Glassmorphism Values (Linear-style)

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
```

**Glass only works if there's visible color behind it** (from building experience). Blobs, gradients, or images. On flat black, glass just looks like a slightly lighter rectangle.

### Material Design Elevation Scale

| Level | Shadow | Use for |
|-------|--------|---------|
| Z1 | `0 1px 4px 0 rgba(0,0,0,0.37)` | Cards at rest |
| Z2 | `0 2px 2px 0 rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.3)` | Raised cards, buttons |
| Z3 | `0 11px 7px 0 rgba(0,0,0,0.19), 0 13px 25px 0 rgba(0,0,0,0.3)` | FABs, nav bars |
| Z4 | `0 14px 12px 0 rgba(0,0,0,0.17), 0 20px 40px 0 rgba(0,0,0,0.3)` | Menus, side sheets |
| Z5 | `0 17px 17px 0 rgba(0,0,0,0.15), 0 27px 55px 0 rgba(0,0,0,0.3)` | Modals, dialogs |

### Common Mistakes

- Using a single `box-shadow` instead of layered shadows
- Too many borders (use shadows, background colors, or spacing instead)
- Using glassmorphism on flat backgrounds (needs visible color behind it)
- Applying shadows equally on all sides instead of primarily downward ("light from the sky")
- Using `mix-blend-mode: screen` on stacking layers (blows to white where they overlap)

---

## 5. Motion & Animation

### The Golden Rule: Purpose First

**"Before you start animating, ask yourself: what's the purpose of this animation?"** (Emil Kowalski)

Animations work as long as the user will rarely interact with them. Used multiple times a day, initial delight fades and the animation slows users down. **Remove animations or hover interactions altogether if they are seen tens or hundreds of times a day** (Kowalski).

**Actions that are frequent and low in novelty should avoid extraneous animations** (Rauno). Example: macOS right-click menu only animates out, not in, because it's used constantly.

**If an animation doesn't perform well, feels pompous, or is out of rhythm relative to the page, don't build it** (Rauno/Vercel).

### Duration Guidelines

| Action | Duration | Easing | Source |
|--------|----------|--------|--------|
| Button press feedback | 160ms | ease-out | Emil Kowalski |
| Tooltip appear | 125ms | ease-out | Emil Kowalski |
| Micro-interaction (toggle) | 100-200ms | ease-out | Consensus |
| Element enter/exit | 200-300ms | ease-out | Consensus |
| Modal/popover | ~200ms | ease-out | Emil Kowalski |
| Page transition | 300-500ms | ease-in-out | Consensus |
| Complex reveal | 400-700ms | cubic-bezier(0.16, 1, 0.3, 1) | Vercel |
| Background blob drift | 15-30s | linear or ease-in-out | Practical |
| Color/opacity crossfade | any | linear | Linear |

**Animations should never exceed 1 second** unless illustrative. Most should be 200-300ms (Kowalski). **Animation duration should not exceed 200ms** for interactions to feel immediate (Rauno). These two slightly disagree: Rauno's threshold is stricter.

**Material Design 3 duration tokens:**
- `short1-4`: 50ms, 100ms, 150ms, 200ms (subtle feedback, small changes)
- `medium1-4`: 250ms, 300ms, 350ms, 400ms (default transitions, page changes)
- `long1-4`: 450ms, 500ms, 550ms, 600ms (large expansions, intro animations)

### Easing Curves

**Default to ease-out** (Emil Kowalski, Rauno Freiberg, consensus). It accelerates at the beginning, which feels snappy. The built-in CSS `ease-out` is usually not strong enough; use custom cubic-bezier.

**Material Design 3 named curves:**
```css
/* Most common: elements moving between resting states */
--md-standard: cubic-bezier(0.2, 0, 0, 1);

/* Elements entering the screen */
--md-decelerate: cubic-bezier(0, 0, 0, 1);

/* Elements leaving the screen */
--md-accelerate: cubic-bezier(0.3, 0, 1, 1);

/* Dramatic entrances */
--md-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);

/* Dramatic exits */
--md-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
```

Key principle: **asymmetric curves**. The deceleration phase should always be longer than the acceleration phase. Objects in the real world don't start and stop at the same rate.

### Spring Physics

Spring physics produce fundamentally different motion than CSS easing curves (Comeau). With springs, you specify physical properties (stiffness, damping, mass) and the animation takes however long it takes. Interrupted animations blend naturally.

| Feel | Stiffness | Damping | Mass | Use Case |
|------|-----------|---------|------|----------|
| Snappy | 300 | 20 | 1 | Button presses, toggles |
| Gentle | 120 | 14 | 1 | Page transitions, modals |
| Bouncy | 200 | 8 | 1 | Playful UI, notifications |
| Heavy | 150 | 20 | 2 | Draggable panels, drawers |
| Quick settle | 400 | 30 | 1 | Tooltips, dropdowns |

**CSS `linear()` function** for spring physics in pure CSS (Comeau):
```css
transition: transform 600ms linear(
  0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%,
  0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%,
  1.159, 1.163, 1.161, 1.154 29.9%, 1.074 36.8%,
  1.031 40.4%, 1.007, 0.993, 0.984 47.5%, 0.981 50.7%,
  0.988 58.1%, 1.001 68.2%, 1.006 78.6%, 1
);
```

### The 7 Practical Animation Techniques (Emil Kowalski)

**1. Scale buttons on press:**
```css
button { transition: transform 160ms ease-out; }
button:active { transform: scale(0.97); }
```
The single fastest way to make a UI feel alive.

**2. Never animate from `scale(0)`:** Use `scale(0.93)` or higher as starting point. Combine with opacity. `scale(0)` feels wrong because it looks like the element appears from nowhere.

**3. Smart tooltip delays:** First tooltip has a delay before appearing. Subsequent tooltips while one is already open appear with no delay and no animation.

**4. Origin-aware popovers:** When a button opens a dropdown, the dropdown should animate from the button's position.
```css
.popover { transform-origin: top center; }
/* Radix UI does this automatically */
.popover[data-radix] {
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
}
```

**5. Use blur to mask imperfections:** When easing and duration aren't enough, add `filter: blur(2px)` during the transition. Bridges the gap between old and new states.

**6. Clip-path for seamless tab transitions:** Duplicate the list, change styling, use `clip-path` to trim. Animate `clip-path` to reveal active tab. "One of the most underrated CSS properties" (Kowalski).

**7. Asymmetric timing for destructive actions:** Hold-to-delete: 2s linear (slow, deliberate). Cancel/release: 200ms ease-out (fast, responsive).

### Animation Proportionality (Rauno)

**Animation values should be proportional to the trigger size:**
- Don't animate dialog scale from 0 to 1; fade opacity and scale from ~0.8
- Don't scale buttons from 1 to 0.8; use ~0.96 or ~0.9
- Stagger child elements by 100-200ms between them
- For less visual noise, skip animation when the delta between updates exceeds the animation duration

### Scroll Animations

The only universally used pattern: **fade-up on viewport enter.**

```css
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
.fade-up:nth-child(1) { transition-delay: 0ms; }
.fade-up:nth-child(2) { transition-delay: 80ms; }
.fade-up:nth-child(3) { transition-delay: 160ms; }
.fade-up:nth-child(4) { transition-delay: 240ms; }
```

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // one-shot
    }
  });
}, { threshold: 0.15 }); // trigger at 15-25% visibility
```

Stagger sibling elements 40-100ms each. **No parallax** (dated). **No bounce** (cheap). **No auto-playing carousels** (hostile).

### The Organic Feel Technique

Give each animated element a unique, prime-ish duration:
- Element 1: 20s, Element 2: 25s, Element 3: 22s, Element 4: 30s, Element 5: 18s
- They rarely sync up, creating a "breathing" quality
- Same easing everywhere. Variety in duration, consistency in personality.

### Performance Rules

1. **Only animate `transform` and `opacity`** (consensus: Kowalski, Rauno, Comeau, Google). These run on the GPU compositor thread without triggering layout or paint.
2. **CSS transitions over keyframes for interactive elements** (Kowalski). Transitions are interruptible; keyframes are not.
3. **Use `will-change` judiciously** (Kowalski, Comeau). Each GPU layer consumes memory. Don't blanket-apply.
4. **Animations must be interruptible** (Vercel, Kowalski). Users should be able to change state mid-animation.
5. Always respect `prefers-reduced-motion`.

### When NOT to Animate

- Actions performed tens or hundreds of times daily (Kowalski)
- When the animation would exceed 300-400ms for a UI interaction (Kowalski)
- When it can't run at 60fps (Rauno)
- Decorative autoplay animations unrelated to user actions (Vercel)
- When the delta between state updates exceeds the animation duration (Rauno)

### Common Mistakes

- Animating from `scale(0)` instead of 0.9+ (Kowalski)
- Using `ease-in` for entrances (feels sluggish; use `ease-out`)
- Using linear easing for motion (almost nothing in the real world moves at constant speed)
- Animations longer than 300ms for frequent interactions
- Not making animations interruptible
- Applying `will-change` everywhere
- Animating `width`, `height`, `top`, `left`, `padding`, or `margin` (triggers layout recalculation)

---

## 6. Interaction Design

### Hover States (100-200ms)

- Scale buttons to `1.02-1.05` on hover (not 1.1, that's too much)
- Shift background color lightness by 5-8%
- Translate icons 1-2px in the direction of their action (arrow nudges right)
- `transition: all 150ms ease-out` for hover states

### Press / Active States (50-160ms)

- Scale down to `0.96-0.98` (Rauno: ~0.96, Kowalski: 0.97)
- Darken the element slightly
- Should feel instant, hence the shorter duration

**Consensus:** Both Kowalski and Rauno independently recommend scale-down on press. Kowalski's exact value is `0.97` at `160ms ease-out`. Rauno recommends `~0.96`.

### Tooltips

- Delay before first tooltip appears (prevents accidental activation)
- Once one is open, subsequent tooltips open **instantly with no animation** (Kowalski)
- Tooltips triggered by hover should **not contain interactive content** (Rauno)
- Tooltip duration: `125ms ease-out` (Kowalski)

### Forms and Inputs (Rauno)

- Clicking input **label** should focus the input
- Inputs should be **wrapped with a form** to submit by pressing Enter
- Inputs should have appropriate `type` (password, email, etc.)
- Input prefix/suffix decorations should be **absolutely positioned on top with padding**, not beside the input. Should trigger focus when clicked.
- **Toggles should immediately take effect**, not require confirmation
- Match button height to input height on the same row (Schoger)
- Input heights: 40-48px for most form inputs (Schoger)

### Buttons

- Disabled buttons should **not** have tooltips (not accessible: disabled buttons leave tab order) (Rauno)
- Buttons should be disabled after submission to avoid duplicate requests (Rauno)
- **Dropdown menus should trigger on mousedown, not click** (Rauno) -- opens immediately on press
- Interactive elements should disable `user-select` for inner content (Rauno)
- Decorative elements (glows, gradients) should disable `pointer-events` (Rauno)

### Focus and Keyboard

- Use **box-shadow for focus rings**, not outline (outline won't respect `border-radius`) (Rauno)
- Dark mode focus: `box-shadow: 0 0 0 2px rgba(accent-color, 0.5)` for a softer glow
- Focusable elements in sequential lists: navigable with arrow keys, deletable with Cmd+Backspace (Rauno)

### Micro-Interactions

**Toggle switches (200-300ms):**
```css
.toggle-knob {
  transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  /* The 1.56 overshoot creates the spring feel */
}
```

**Error shake:**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
.error { animation: shake 400ms ease-out; }
```

**Floating label on focus:**
```css
.label-float {
  transition: transform 150ms ease-out, font-size 150ms ease-out;
}
.input:focus + .label-float {
  transform: translateY(-20px) scale(0.85);
}
```

**Skeleton shimmer:**
```css
.skeleton {
  background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Overlap Elements for Depth (Schoger)

Use negative margins to make images, cards, or sections overlap. Immediately makes a layout feel more designed and three-dimensional.

### Common Mistakes

- Dead areas between interactive list items (use padding instead of gaps)
- Tooltips on disabled buttons (inaccessible to keyboard users)
- Changing font weight on hover (layout shift)
- Not disabling buttons after form submission
- Using `outline` instead of `box-shadow` for focus rings
- Toggle switches that require a confirmation step

---

## 7. Dark Mode Mastery

### Base Surface Color

**Never use pure black (`#000000`)**. Causes "black smearing" on OLED screens where pixels physically turn off and lag when reactivating. Even `#010101` avoids this. Use near-blacks with slight color tint.

Recommended base values:
- Material Design: `#121212`
- Apple-style: `#0a0a0f` to `#111111`
- With brand hue: `hsl(brand-hue, 10%, 7-10%)`

**Linear generates its entire theme from 3 variables:** base color, accent color, contrast level. Everything else derives from those three.

### The Elevation Overlay System (Material Design)

In dark mode, shadows are nearly invisible. The technique flips: **lighter surfaces = higher elevation.** Place semi-transparent white overlay on your base surface, increasing opacity with elevation:

| Elevation | Overlay Opacity | Approximate Hex |
|-----------|----------------|-----------------|
| 0dp | 0% | `#121212` |
| 1dp | 5% | `#1D1D1D` |
| 2dp | 7% | `#212121` |
| 3dp | 8% | `#242424` |
| 4dp | 9% | `#272727` |
| 6dp | 11% | `#2C2C2C` |
| 8dp | 12% | `#2E2E2E` |
| 12dp | 14% | `#333333` |
| 16dp | 15% | `#353535` |
| 24dp | 16% | `#383838` |

Formula: `opacity = (4.5 * ln(elevation + 1) + 2) / 100`

```css
.surface-1 { background: color-mix(in srgb, #ffffff 5%, #121212); }
.surface-2 { background: color-mix(in srgb, #ffffff 7%, #121212); }
.surface-3 { background: color-mix(in srgb, #ffffff 8%, #121212); }
```

### Text Contrast

**Never use pure white (`#FFFFFF`)** on dark backgrounds. Creates "halation" where white text appears to glow and blur, especially for users with astigmatism.

```css
.headline    { color: #ffffff; font-weight: 700; }  /* Only for headlines */
.subheading  { color: #e0e0e0; font-weight: 500; }
.body        { color: rgba(255, 255, 255, 0.87); }  /* #DEDEDE equivalent */
.secondary   { color: rgba(255, 255, 255, 0.60); }  /* #9E9E9E equivalent */
.muted       { color: #666666; font-weight: 400; }
.disabled    { color: rgba(255, 255, 255, 0.38); }
.label       { color: #888888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; }
```

Light text on dark backgrounds **appears bolder** than the same weight on light backgrounds. Consider dropping font-weight by one step in dark mode (e.g., 400 instead of 500 for body text).

### Saturation Rules

- Colors that look great on light backgrounds will "vibrate" against dark surfaces. **Desaturate brand colors by 10-20%** for dark mode.
- Material Design recommends using the 200-50 range of your color palette (lighter, less saturated tones)
- Exception: small accent elements (notification dots, active indicators) can stay fully saturated because they occupy minimal area
- Keep a consistent hue across all surface layers, just shift lightness

### Borders in Dark Mode

Borders should be barely visible:
```css
.subtle-border  { border: 1px solid rgba(255, 255, 255, 0.06); }
.default-border { border: 1px solid rgba(255, 255, 255, 0.08); }
.strong-border  { border: 1px solid rgba(255, 255, 255, 0.12); }
.hover-border   { border: 1px solid rgba(255, 255, 255, 0.15); }
```

### Glow Effects (Dark Mode Shadows)

Glow replaces shadow in dark mode:
```css
/* Subtle button glow on hover */
.btn:hover {
  box-shadow: 0 0 12px 2px rgba(var(--accent-rgb), 0.3);
}

/* Focus ring */
.input:focus {
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.5);
}
```

Keep glow opacity around 25-35%. Pick one direction for your conceptual light source (typically above) and stay consistent.

### Opacity Visibility Threshold

The human eye needs at least **0.15-0.20** to register color on a dark background. For decorative elements that should be clearly visible, **0.25-0.40** is the sweet spot. Below 0.10 is basically invisible. Most AI-generated dark themes use 0.04-0.12 and everything disappears.

### Animated Background Blobs

```css
.blob {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  filter: blur(120px);
  opacity: 0.25;
  animation: morph 20s ease-in-out infinite alternate;
}
.blob-1 { background: rgba(0, 255, 65, 0.3); animation-duration: 20s; }
.blob-2 { background: rgba(100, 50, 255, 0.3); animation-duration: 25s; }
.blob-3 { background: rgba(0, 200, 255, 0.3); animation-duration: 22s; }

@keyframes morph {
  0%   { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50%  { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  100% { border-radius: 40% 60% 60% 40% / 40% 70% 30% 60%; }
}
```

Use `rgba` transparency, NOT `mix-blend-mode: screen` (blows to white where layers overlap). Each blob gets its own timing so they never sync up. Used by: Linear, Stripe, Vercel, Raycast.

### Dark Mode Flash Prevention (Paco Coursey)

The `next-themes` library (under 1kB) solves SSR dark mode flicker by injecting a `<script>` that reads theme from localStorage before the page paints. Prevents the flash that occurs when client-side hydration switches themes.

### Design Light Mode First (Schoger)

Design the light version first without relying on shadows and borders. If you can make it work without those visual cues, converting to dark mode becomes much easier.

### Common Mistakes

- Using pure black (`#000000`) as background
- Using pure white (`#FFFFFF`) for body text
- Opacity values below 0.10 for decorative elements (invisible)
- Not desaturating colors for dark backgrounds (causes vibration)
- Trying to invert the light theme instead of building a separate dark system
- Using `mix-blend-mode: screen` on stacking blob layers
- Not accounting for dark mode flash on SSR sites

---

## 8. Web3/Crypto Design

### What Sets the Best Apart

Based on analysis of Abstract, Zora, Rainbow, Uniswap, and Paradigm:

**1. Strong point of view beats trend-following.** Every memorable crypto site commits to a direction. Uniswap: dark + pink + functional. Paradigm: monochrome + intellectual. Abstract: light + consumer. Most bad crypto sites combine dark mode + gradient + sans-serif + blockchain jargon into forgettable soup.

**2. The best sites hide the blockchain.** Zora looks like a social network. Rainbow looks like CashApp. Abstract looks like a consumer app store. Uniswap puts the swap interface front and center without explaining what a DEX is. The design communicates "use me" not "learn about blockchain."

**3. One accent color, used relentlessly.** Uniswap owns hot pink (`#FF007A`). Paradigm owns black and white with green (`#00D395`). The memorable brands pick a narrow palette and commit hard.

**4. Lead with function, not explanation.** Put your product on the homepage. If you build a swap, show the swap. Do not make people scroll past three sections of "How it works."

**5. Dark mode is dominant but not mandatory.** Three of five top sites use dark mode. But Abstract and Paradigm use light backgrounds to great effect. Going light when everyone else goes dark is itself a differentiator.

### Specific Web3 CSS Techniques

**Ambient gradient orbs (Uniswap):**
```css
.orb {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: drift 45s ease-in-out infinite alternate;
}
```

**Glassmorphism swap card:**
```css
.swap-card {
  background: rgba(20, 20, 20, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
}
```

**Gradient text:**
```css
.gradient-text {
  background: linear-gradient(135deg, #FF007A, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Pill-shaped navigation (Abstract):**
```css
.nav-pill {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 8px 24px;
  position: fixed;
}
```

### Typography as Differentiator

Using a serif for headlines (Uniswap), monospace + serif (Paradigm), or a custom display face immediately distinguishes you from the Inter/Poppins/DM Sans default that 90% of crypto uses. Pair two fonts with contrasting personalities: one for character, one for readability.

### Common Mistakes

- Purple + blue + green gradients simultaneously (generic crypto soup)
- Leading with technical explanations instead of the product
- Dark mode because "crypto = dark" instead of because it fits the brand
- No distinctive accent color (blends into every other protocol)
- Overcomplicated dashboards when a simple interface would work

---

## 9. The "Personality" Factor

### The Core Problem

**"Technical polish makes something look good. But it doesn't make it yours."** Clean spacing, nice animations, glass effects are the floor, not the ceiling. A portfolio that follows best practices perfectly looks like anyone could have made it.

The test: **someone should look at your work and know it's yours without seeing your name** (Tobias van Schneider).

### The Design DNA Formula

From the Abstract Wrapped analysis:

**1 custom font + 1 easing curve + 1 signature gradient + deliberate choreography = personality.**

They have fewer techniques but apply them with more intention. A single easing curve used 100 times creates more personality than 10 different animations used once each. **Consistency IS the style.**

### Shu Ding's Cycle Theory

Design quality does not scale proportionally with complexity. The design industry cycles: excess -> stripping back -> deeper understanding -> selective reintroduction. When you reintroduce embellishment after understanding minimalism, the result is richer than either extreme.

### Van Schneider's Unconventional Rules

1. **Trust intuition over information.** If you've been staring at two options for 10 minutes, go with your first instinct. Analysis paralysis produces mediocre compromises.

2. **Side projects should be "stupid."** No client brief, no KPIs, no audience research. The most distinctive visual language comes from removing expectations.

3. **Color Claim method:** Don't study color theory. Collect colors from photography, architecture, fashion. Build a personal color library from the real world.

### How to Find Your Style

- Look at your personal projects. What makes them feel like *you*? Bring those instincts to professional work.
- Opinionated choices create recognition: unexpected color, unusual layout, breaking a "rule" on purpose.
- **"Figure out what your style is, own it, don't be afraid to be different."** (Abstract Wrapped team)

### Section Color Identity

Each section of a long page should have its own color atmosphere. Creates a sense of journey:
- Hero: green + purple (brand)
- Features: purple + cyan (technical)
- Comparison: amber + orange (warmth)
- Install: green + cyan (fresh, action)

Without this, scrolling feels like moving through one uniform dark tube.

### Craft as Competitive Advantage (Paco Coursey)

> "Every single interface has infinite opportunity for polish and delight."

His running list of details that matter:
- Polishing the `:active` state on interactive elements
- Loading a single typeface glyph to render the best ampersand
- Animating transitions between open tooltips spatially
- Rendering a custom text caret and animating it better than browsers do
- Making things fast and accessible at the same time

### Performance IS Aesthetics (Shu Ding)

A 5kB globe looks better than an 80kB one because it loads instantly. Speed is a design choice. Shu's texture trick: downscale aggressively. A world map from 4096x2048 (80kB) to 256x128 (1kB) looks nearly identical on a dotted globe.

### Build Craft Pages

Both Paco and Rauno maintain living documentation of their techniques. This forces you to isolate and understand each technique rather than burying it in product code. Your craft page IS your portfolio.

### Common Mistakes

- Optimizing for correctness at the expense of character
- Using 10 different techniques once each instead of 1 technique applied 100 times
- Being afraid to break "rules" for the sake of personality
- Not having a signature color, font, or motion style
- Following trends instead of developing a point of view

---

## 10. Quick Reference Cheat Sheet

### Copy-Paste CSS: Premium Dark Card

```css
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 32px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03),
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.15),
    0 16px 32px rgba(0, 0, 0, 0.15);
}
```

### Copy-Paste CSS: Button with Press Feedback

```css
.btn {
  transition: transform 160ms ease-out, box-shadow 160ms ease-out;
}
.btn:hover {
  transform: scale(1.02);
  box-shadow: 0 0 12px 2px rgba(var(--accent-rgb), 0.25);
}
.btn:active {
  transform: scale(0.97);
}
```

### Copy-Paste CSS: Responsive Type Scale

```css
:root {
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 17px;
  --text-lg: 21px;
  --text-xl: 24px;
  --text-2xl: 36px;
  --text-3xl: 48px;
  --text-4xl: 72px;
}
```

### Copy-Paste CSS: Dark Mode Text Hierarchy

```css
--text-primary:   rgba(255, 255, 255, 0.87);
--text-secondary:  rgba(255, 255, 255, 0.60);
--text-disabled:   rgba(255, 255, 255, 0.38);
--text-hint:       rgba(255, 255, 255, 0.50);
--border-subtle:   rgba(255, 255, 255, 0.06);
--border-default:  rgba(255, 255, 255, 0.08);
--border-strong:   rgba(255, 255, 255, 0.12);
```

### Copy-Paste CSS: Spacing Scale

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --space-32: 128px;
}
```

### Copy-Paste CSS: Stripe-Style Diagonal Section

```css
.diagonal-section {
  position: relative;
  overflow: hidden;
  transform: skewY(-6deg);
  padding: 120px 0;
}
.diagonal-section > * {
  transform: skewY(6deg);
}
```

### The Rules That Matter Most (Condensed)

| # | Rule | Source |
|---|------|--------|
| 1 | Double your whitespace | Kennedy, Schoger |
| 2 | Max 4 font sizes per page | Kennedy |
| 3 | Max 2-3 colors | Van Schneider |
| 4 | Never pure black bg or pure white text in dark mode | Apple, Material Design |
| 5 | `ease-out` for everything entering, `ease-in` for everything leaving | Kowalski, Rauno, MD3 |
| 6 | UI animations under 300ms | Kowalski, Rauno |
| 7 | Only animate `transform` and `opacity` | Everyone |
| 8 | `scale(0.97)` on button press | Kowalski |
| 9 | Layer 2+ shadows, never use one flat shadow | Comeau, Schoger |
| 10 | Fewer borders, more spacing and background color | Schoger |
| 11 | Saturate your greys | Schoger |
| 12 | One signature element used 100 times beats 10 elements used once | Abstract Wrapped |
| 13 | 120-200px between page sections | Industry consensus |
| 14 | Glass needs something behind it | Practical experience |
| 15 | Desaturate colors 10-20% for dark mode | Apple, Material Design |

### Where Designers Disagree

| Topic | Position A | Position B |
|-------|-----------|-----------|
| Max animation duration | 200ms for UI interactions (Rauno) | 300-400ms acceptable (Kowalski, MD3) |
| Button press scale | 0.96 (Rauno) | 0.97 (Kowalski) |
| Design approach | Work in final medium/code early (Rauno, Paco) | Structure in greyscale first, polish later (Schoger) |
| Color method | Build palettes from real world/intuition (Van Schneider) | Use HSB/Lab math systematically (Kennedy, Stripe) |
| Embellishment | "As little design as possible" (Rams) | Selective reintroduction after understanding minimalism (Shu Ding) |
| Spring vs CSS easing | Springs for everything interactive (Comeau) | Custom cubic-bezier is sufficient for most cases (Kowalski) |

---

## Sources

### Designers
- [Emil Kowalski - Blog](https://emilkowal.ski/) | [Animations on the Web](https://animations.dev/)
- [Rauno Freiberg - Craft](https://rauno.me/craft) | [Web Interface Guidelines](https://interfaces.rauno.me/)
- [Steve Schoger - Refactoring UI](https://refactoringui.com/) | [Heroicons](https://heroicons.com/)
- [Paco Coursey - Site](https://paco.me/) | [next-themes](https://github.com/pacocoursey/next-themes)
- [Shu Ding - Site](https://shud.in/) | [Satori](https://github.com/vercel/satori) | [COBE](https://github.com/shuding/cobe)
- [Erik Kennedy - Learn UI Design](https://www.learnui.design/blog/)
- [Josh Comeau - Blog](https://www.joshwcomeau.com/) | [Shadow Palette Generator](https://www.joshwcomeau.com/shadow-palette/)
- [Tobias van Schneider - Colors](https://vanschneider.com/colors)
- [Cassie Evans - GreenSock](https://www.cassie.codes/)

### Design Systems
- [Linear - How We Redesigned the UI](https://linear.app/now/how-we-redesigned-the-linear-ui) | [linear.style](https://linear.style/)
- [Vercel Geist](https://vercel.com/geist) | [Design Guidelines](https://vercel.com/design/guidelines)
- [Stripe - Accessible Color Systems](https://stripe.com/blog/accessible-color-systems)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)

### Web3 Reference Sites
- [Uniswap](https://uniswap.org) | [Abstract](https://abs.xyz) | [Zora](https://zora.co) | [Rainbow](https://rainbow.me) | [Paradigm](https://paradigm.xyz)
