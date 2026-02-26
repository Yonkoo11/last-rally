# UX Ship Checklist

Auto-enforced during `/design` QA gate. Every item has a testable value. Fail any = do not ship.

---

## Typography (T1-T9)

T1. Body text >= 16px on mobile, 16-21px on desktop (iOS zooms inputs below 16px)
T2. Line height 1.4-1.6 for body text, 1.1-1.25 for headings 24px+ (readability vs. compactness)
T3. Line length 45-90 characters per line; max-width on text containers (prevents eye-tracking loss)
T4. Max 4 font sizes per page/view (more = visual noise, Kennedy's #1 rule)
T5. ALL CAPS text has letter-spacing +0.05-0.12em (caps designed for mixed case, too tight alone)
T6. Heading scale uses consistent ratio: 1.200-1.333 between levels (arbitrary sizes break hierarchy)
T7. Adjacent heading levels differ by >= 20% in size (smaller gap = invisible hierarchy)
T8. No bold+italic stacking; use one or the other (competing emphasis cancels out)
T9. Negative letter-spacing on display text 24px+: -0.01em to -0.02em (prevents airy appearance)

## Contrast (C1-C7)

C1. Body text contrast ratio >= 4.5:1 against background, WCAG AA (legal accessibility minimum)
C2. Large text 18px+ or 14px bold+ contrast >= 3:1, WCAG AA (large text threshold)
C3. UI components and icons >= 3:1 against adjacent colors (WCAG 1.4.11 non-text contrast)
C4. Hover state has >= 3:1 contrast change vs. default state (must be perceivable, WCAG 1.4.11)
C5. Focus indicator has >= 3:1 contrast vs. adjacent background (keyboard users must see it)
C6. Disabled text APCA Lc > 30 or roughly 2:1 ratio minimum (below = invisible, above = looks active)
C7. Text over images/gradients/video uses contrast treatment: overlay, blur, scrim, or shadow (unprotected text = unreadable)

## Spacing (S1-S6)

S1. Base spacing grid: 4px or 8px; all spacing values are multiples (prevents inconsistent gaps)
S2. Internal padding < external gap between components (law of proximity, grouping clarity)
S3. Whitespace between content groups > whitespace within groups (gestalt grouping)
S4. Touch target spacing >= 8px between adjacent targets (prevents mis-taps)
S5. Paragraph spacing: indent OR vertical space, never both (Butterick's amateur-detector rule)
S6. Icon-to-label gap >= 8px (cramped icon+text reads as broken)

## Interactive (I1-I8)

I1. Touch targets >= 44x44px on mobile, >= 36px on desktop (Fitts's law + Apple HIG)
I2. Hover state uses 8% opacity overlay or equivalent visible change within 150ms (feedback loop)
I3. Active/pressed state distinct from hover: 12% overlay, scale(0.98), or darken (confirms the tap)
I4. All clickable elements show cursor:pointer and have visible affordance (prevents mystery meat nav)
I5. System feedback within 100ms for direct actions; progress indicator within 1s for operations (Nielsen's thresholds)
I6. Animation duration: 100-200ms for micro-interactions, 200-300ms for transitions, never > 400ms for direct manipulation (longer = sluggish)
I7. Easing: ease-out for elements entering, ease-in for elements leaving (natural motion)
I8. Form inputs validate on blur, not on keystroke; show success states too (Wroblewski's 22% error reduction)

## Dark Mode (D1-D8)

D1. Background NOT pure #000; use #0a0a0c to #121212 range (halation affects ~47% of users with astigmatism)
D2. Body text NOT pure #fff; use #e0e0e0 to #f0f0f3 range (pure white bleeds/glows on dark)
D3. 4-level text hierarchy minimum: primary #ededed-#f7f8f8, body #b8bcc5, secondary #8b9099, muted #5c6370 (flat text = no scanability)
D4. Accent/brand colors desaturated 20-30% from light mode values, lightness 55-70% (saturated colors vibrate on dark bg)
D5. Elevation via surface tint (lighter bg per layer), not box-shadow (shadows invisible on dark)
D6. Each elevation layer adds ~4-6% lightness from base (more = stops feeling dark mode)
D7. Borders use rgba(255,255,255, 0.08-0.25), not gray hex (auto-adapts to any dark surface)
D8. Font weight bumped one step heavier than light mode equivalent (dark bg makes light text appear thinner)

## Accessibility (A1-A6)

A1. All interactive elements keyboard-focusable with visible focus indicator >= 2px solid (WCAG 2.4.7)
A2. Focus indicator uses two-color technique (outline + box-shadow) visible on any background (Soueidan's Oreo method)
A3. Skip-to-content link as first focusable element, targets `<main>` (keyboard nav requirement)
A4. Single `<main>` per page; all content inside semantic landmarks (screen reader navigation)
A5. Dynamic content updates use aria-live="polite" regions injected into pre-existing DOM nodes (toast/validation announcements)
A6. Form inputs have visible `<label>` elements, never placeholder-only labels (disappear on focus)

---

**Total: 44 items**

Quick fail check: run through IDs (T1-T9, C1-C7, S1-S6, I1-I8, D1-D8, A1-A6). Any failure blocks ship.

Sources: Reichenstein (iA), Kennedy (Learn UI Design), Butterick, Krug, Nielsen/NNg, Wroblewski, Friedman/Smashing, Norman, Spool, Verou, Soueidan, Material Design 3, Linear, Vercel, GitHub, Raycast, Stripe.
