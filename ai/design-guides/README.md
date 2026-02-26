# Design Knowledge - Quick Reference

These are the design principles and rules used to build Last Rally's UI.

---

## 📚 Files in This Directory

### 1. DESIGN_MASTERY.md (45KB, 1100+ lines)
**The complete design system**

Covers:
- Typography (scales, weights, line heights)
- Color systems (palettes, contrast, dark mode)
- Spacing & layout (8pt grid, spacing tokens)
- Shadows & depth (elevation system)
- Motion & animation (timing, easing, springs)
- Dark mode mastery (10 consensus rules)
- Icons & visual elements
- The "personality" factor (avoiding AI slop)
- Quick reference cheat sheet

**When to use:**
- Designing new UI components
- Choosing font sizes, colors, spacing
- Adding animations
- Dark mode implementation

### 2. UX_MASTERY.md (26KB, 734 lines)
**UX rules from 15+ design experts**

Covers:
- Typography system (exact type scale values)
- Color & contrast (WCAG, APCA ratios)
- Spacing & layout (spacing tokens, grid systems)
- Visual hierarchy (F-pattern, Z-pattern)
- Interactive elements (button states, animations)
- Text over complex backgrounds (overlays, scrims)
- Accessibility (WCAG 2.1 compliance)
- Dark mode specific rules
- Quick reference card (all values)
- Anti-patterns (things that make UI look like AI slop)

**When to use:**
- Implementing interactive elements
- Fixing accessibility issues
- Optimizing visual hierarchy
- Debugging contrast problems

### 3. UX_CHECKLIST.md (4.9KB, 44 items)
**The ship-gate checklist**

Categories:
- Typography (T1-T9)
- Contrast (C1-C7)
- Spacing (S1-S6)
- Interactive (I1-I8)
- Dark Mode (D1-D8)
- Accessibility (A1-A6)

**When to use:**
- Before recording demo video
- Before submitting to hackathon
- Final QA pass

---

## 🚀 Quick Start

### If Friend Wants to Polish UI Further:

**Read these sections in order:**

1. **UX_CHECKLIST.md** (5 min read)
   - Scan the 44 items
   - See if any are violated in Last Rally
   - Fix critical issues

2. **DESIGN_MASTERY.md - Section 10: Quick Reference** (10 min read)
   - Get all the specific values (font sizes, spacing, timing)
   - Use as a reference card

3. **UX_MASTERY.md - Section 10: Anti-Patterns** (5 min read)
   - See what makes UI look like AI slop
   - Avoid these patterns

**Total time:** 20 minutes to get 80% of the value

### If Friend Wants Deep Knowledge:

Read the full files in this order:
1. UX_CHECKLIST.md (start here)
2. DESIGN_MASTERY.md Sections 1-5 (foundations)
3. UX_MASTERY.md Sections 1-6 (application)

**Total time:** 2-3 hours

---

## 🎨 How These Were Used in Last Rally

**Priority 1 Fixes** (already done):
- Contrast increased on unlock text (0.5 → 0.7 opacity) - per UX_MASTERY.md Section 2
- Loading state added to wallet button - per DESIGN_MASTERY.md Section 5 (motion)
- Used UX_CHECKLIST.md items C2, I3

**Priority 2 Fixes** (already done):
- Semantic HTML (h1, proper buttons) - per UX_CHECKLIST.md items A1, A2
- ARIA labels added - per UX_MASTERY.md Section 7 (accessibility)
- Used UX_CHECKLIST.md items A3, A4, A5

**Current state:**
- Typography: ✓ Proper scale (DESIGN_MASTERY.md Section 1)
- Colors: ✓ Arcade theme with good contrast
- Spacing: ✓ Consistent scale (8pt grid)
- Animations: ✓ Ease-out timing, no linear easing
- Dark mode: ✓ All 10 consensus rules followed

**What could be improved** (if time permits):
- Add more hover feedback on cards (UX_MASTERY.md Section 5)
- Improve mobile responsiveness (not tested yet)
- Add focus states to all interactive elements

---

## 🛠️ Practical Tips

### Checking Contrast
```css
/* From UX_MASTERY.md Section 2 */
Text on dark bg: minimum 0.65 opacity (APCA ~60)
Secondary text: minimum 0.5 opacity (APCA ~45)

Current Last Rally:
- Primary text: rgba(255,255,255,0.95) ✓ Good
- Secondary text: rgba(255,255,255,0.7) ✓ Good (was 0.5, we fixed it)
```

### Animation Timing
```css
/* From DESIGN_MASTERY.md Section 5 */
Button press: 150ms ease-out
Modal open: 200ms ease-out
Dropdown: 180ms ease-out
Page transition: 250ms ease-out

Never use: linear easing, scale(0), >300ms for functional UI
```

### Spacing Scale
```css
/* From DESIGN_MASTERY.md Section 3 */
Base unit: 4px (0.25rem)
Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

Last Rally uses CSS variables:
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-4: 1rem (16px)
etc.
```

---

## 📖 Sources

These guides synthesize knowledge from:
- **Emil Kowalski** (Linear) - Animation & Motion
- **Rauno Freiberg** (Vercel) - Interaction Design
- **Steve Schoger** (Refactoring UI) - Visual Design
- **Sara Soueidan** - Accessibility
- **Stripe, Linear, Vercel, Arc, Raycast** - Dark mode analysis

---

## ⚡ TL;DR for Friend

**If you just want to make sure nothing looks bad:**
1. Read UX_CHECKLIST.md (5 min)
2. Fix any violations
3. Ship it

**If you want to deeply understand the design:**
1. Read all three files (2-3 hours)
2. Reference DESIGN_MASTERY.md Section 10 for quick lookups

**Current UI quality:** B+ (85/100) according to UI-UX-REVIEW.md
**With these guides:** Can get to A- (90/100) with 1-2 hours of polish

---

*Design knowledge transferred. Your friend now has the same design system you used.* ✓
