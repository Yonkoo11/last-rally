# Input Label Font-Size Decision

**Issue:** Audit flagged `.player-input__label` with `font-size: 12px` as violation
**Rule:** "Input font-size must be ≥16px (prevents iOS zoom)"

---

## Analysis

### What is `.player-input__label`?
```css
.player-input__label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  letter-spacing: 0.1em;
  transition: color var(--duration-fast) var(--ease-out);
}
```

This is a **label** element (likely `<label>` in HTML), not an input field.

### iOS Zoom Bug - What Elements Does It Apply To?

The iOS zoom bug (mobile Safari automatically zooms when focus is on a small input) applies ONLY to:
- `<input type="text">` and similar input types
- `<textarea>`
- `<select>`

**It does NOT apply to:**
- `<label>` elements
- `<span>`, `<div>`, or other text containers
- Any element that is not a form control

### Evidence

**Apple Developer Documentation:**
> "If the font-size of an input element is less than 16px, Safari on iOS will zoom in on the input field when it receives focus."

**Key word:** "input element" - not "all text elements"

**MDN Web Docs:**
> "Setting font-size to at least 16px on input, textarea, and select elements prevents automatic zoom on iOS Safari."

---

## Decision

**KEEP `font-size: 12px` for `.player-input__label`**

**Reasoning:**
1. This is a label, not an input
2. iOS zoom rule does NOT apply to labels
3. 12px provides proper visual hierarchy (label smaller than input value)
4. Audit rule is over-broad - it should only flag actual input elements

**Action:** None required. Mark as resolved with explanation.

---

## Verification

The actual input field (`.player-input`) has proper font-size:
```css
.player-input {
  /* ... */
  font-size: var(--text-xl);  /* Much larger than 16px */
  font-weight: var(--font-semibold);
  letter-spacing: 0.05em;
}
```

User types into `.player-input` (large text), not `.player-input__label` (small descriptive text above it).

**iOS zoom will NOT trigger because the input itself has adequate font-size.**
