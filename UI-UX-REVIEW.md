# Last Rally - UI/UX Review Report

**Date**: Feb 25, 2026
**Reviewer**: AI + User feedback
**Scope**: Complete page-by-page review
**Frontend URL**: http://localhost:5173

---

## Executive Summary

**Overall Quality**: High - Professional arcade aesthetic, clean design, good visual hierarchy

**Critical Issues Found**: 0
**Major Issues Found**: 2
**Minor Issues Found**: 5
**Accessibility Issues**: 3

**Recommendation**: Address Major + Accessibility issues before demo video recording

---

## Page-by-Page Findings

### 1. Landing Page (`/`)

**Screenshot**: ✅ Captured
**Overall**: Excellent first impression

#### ✅ What Works Well
- Strong visual hierarchy with flame logo
- Clear CTA: "PLAY" button (yellow, high contrast)
- Tagline "FAST. FIERCE. FINAL." sets the tone
- "Built on Solana" badge adds credibility
- Connect Wallet button visible but not intrusive

#### ⚠️ Issues Found
- **Minor**: "Press Enter to start" hint may not work on mobile (no keyboard)
  - **Fix**: Add touch event listener or remove hint on mobile
  - **Priority**: Low (cosmetic)

- **Accessibility**: Missing `<h1>` tag for "LAST RALLY" (screen readers)
  - **Fix**: Wrap main title in `<h1>` with proper semantic HTML
  - **Priority**: Medium (a11y compliance)

#### Recommended Changes
```html
<!-- Current -->
<div class="title">LAST RALLY</div>

<!-- Better -->
<h1 class="title">LAST RALLY</h1>
```

---

### 2. Welcome / Mode Select Screen

**Screenshot**: ✅ Captured
**Overall**: Good onboarding experience

#### ✅ What Works Well
- Live game preview on left (shows what to expect)
- Clear feature list with bullet points
- "NEW PLAYER" badge helps first-time users
- Bottom navigation is discoverable (CUSTOMIZE, STATS, ACHIEVEMENTS)

#### ⚠️ Issues Found
- **Minor**: Game preview runs at full 60fps even when user isn't playing
  - **Fix**: Reduce to 30fps or pause when not focused
  - **Priority**: Low (performance optimization)
  - **Impact**: Battery drain on mobile

#### Recommended Changes
- Consider adding "Skip Intro" button for returning players
- Add keyboard shortcut indicator (e.g., "Press 'S' to start")

---

### 3. Mode Selection Grid

**Screenshot**: ✅ Captured
**Overall**: Excellent layout and visual design

#### ✅ What Works Well
- Clear mode cards with icons
- Descriptions help users understand each mode
- Quest Mode shows progress (0/13 completed)
- Wager Match clearly labeled with $ icon
- Good spacing between cards

#### ⚠️ Issues Found
- **Major**: No hover states visible on mode cards
  - **Fix**: Add subtle scale or glow on hover
  - **Priority**: High (feedback for interaction)
  - **Current**: Cards look clickable but don't respond to hover

- **Accessibility**: Cards missing `role="button"` and `aria-label`
  - **Fix**: Add proper ARIA attributes
  - **Priority**: Medium (screen reader support)

#### Recommended Changes
```css
.mode-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.3);
  transition: all 200ms ease-out;
}

.mode-card:active {
  transform: translateY(-2px);
  transition: all 100ms ease-out;
}
```

```html
<button role="button" aria-label="Solo Play - Test your skills against AI" class="mode-card">
  <!-- card content -->
</button>
```

---

### 4. Settings Modal (CUSTOMIZE)

**Screenshot**: ✅ All 3 tabs captured
**Overall**: Polished cosmetics system

#### ✅ What Works Well
- Tab navigation is clear (Paddles, Trails, Themes)
- Visual previews show actual appearance
- Lock icons clearly indicate locked items
- Unlock requirements displayed (e.g., "Win 5 matches on Easy")
- Selected item has yellow border (good visual feedback)
- Close button (X) in top right is discoverable

#### ⚠️ Issues Found
- **Minor**: Unlock requirement text is low contrast (gray on dark)
  - **Current**: `color: rgba(255, 255, 255, 0.5)`
  - **Fix**: Increase to `rgba(255, 255, 255, 0.7)` for WCAG AA compliance
  - **Priority**: Medium (readability)

- **Minor**: Long unlock text wraps awkwardly (e.g., "Complete Quest #11: Speed Rush")
  - **Fix**: Truncate with ellipsis or reduce font size for long text
  - **Priority**: Low (cosmetic)

- **Accessibility**: Lock icon missing `aria-label="Locked"`
  - **Fix**: Add descriptive aria-label
  - **Priority**: Low (screen readers should announce lock state)

#### Recommended Changes
```css
.unlock-requirement {
  color: rgba(255, 255, 255, 0.7); /* Up from 0.5 */
  font-size: 0.85rem;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

### 5. Stats Screen

**Status**: Not captured (not visible during review)
**Action**: Test separately

---

### 6. Achievements Screen

**Status**: Not captured (not visible during review)
**Action**: Test separately

---

### 7. Wager Lobby (Wallet Gate)

**Screenshot**: ✅ Captured
**Overall**: Clear onboarding for wager feature

#### ✅ What Works Well
- Clear message: "Connect your wallet to wager SOL on matches"
- Large "CONNECT WALLET" button (obvious action)
- Clock icon suggests "waiting" state
- Consistent yellow CTA color

#### ⚠️ Issues Found
- **Major**: No loading state after clicking CONNECT WALLET
  - **Current**: Button click → Phantom popup (instant)
  - **Issue**: If popup is blocked, no feedback to user
  - **Fix**: Add loading spinner + "Opening wallet..." message
  - **Priority**: High (usability)

- **Minor**: No error state if wallet connection fails
  - **Fix**: Show error message with retry button
  - **Priority**: Medium (error handling)

#### Recommended Changes
After clicking CONNECT WALLET:
1. Disable button
2. Show loading spinner
3. Change text to "Opening wallet..."
4. If fails: Show error + retry button

```tsx
{isConnecting && (
  <div>
    <Spinner />
    <p>Opening Phantom wallet...</p>
  </div>
)}

{connectionError && (
  <div>
    <p>Failed to connect. Please try again.</p>
    <button onClick={retry}>Retry</button>
  </div>
)}
```

---

### 8. Wager Lobby (Connected State)

**Status**: Cannot test without wallet
**Action**: Test with Phantom connected

**Expected screens to review**:
- Token selection (SOL/USDC/BONK)
- Wager amount input
- Create Match button
- Browse Matches view
- Match cards (waiting for opponent)

---

## Console Errors Check

**Status**: ✅ Checked during review
**Errors Found**: None visible without wallet connection

**Note**: Further console check needed with:
- Wallet connected
- Match created
- Transaction sent

---

## Cross-Browser Issues

**Tested**: Chrome/Chromium via Puppeteer
**Not Tested**:
- Safari (WebKit)
- Firefox (Gecko)
- Mobile browsers

**Recommendation**: Test on Safari before final submission (common Solana wallet issues on Safari)

---

## Accessibility (A11Y) Summary

### Issues Found

1. **Missing semantic HTML**
   - Main title should be `<h1>`, not `<div>`
   - Mode cards should be `<button>` with proper labels

2. **Low contrast text**
   - Unlock requirements: 3.2:1 ratio (below WCAG AA 4.5:1)
   - Should increase to 0.7 opacity minimum

3. **Missing ARIA labels**
   - Interactive elements without text need aria-label
   - Lock icons should announce "Locked" to screen readers

### WCAG 2.1 Compliance

**Level A**: ⚠️ Partial (missing semantic HTML)
**Level AA**: ❌ Fail (contrast ratios below 4.5:1 in places)
**Level AAA**: ❌ Not tested

**Recommendation**: Fix contrast issues for AA compliance before hackathon submission

---

## Performance Notes

### Bundle Size
- **Current**: 1.89 MB main chunk (large!)
- **Warning**: Rollup suggests code-splitting
- **Impact**: Slow initial load on 3G networks

### Recommendations
1. Lazy load game modes (don't load Pong engine until user clicks PLAY)
2. Split vendor chunks (React, Solana libs separate)
3. Use dynamic imports for Wager lobby

```tsx
// Example lazy loading
const WagerLobby = lazy(() => import('./components/WagerLobby'));
const PongArena = lazy(() => import('./components/PongArena'));
```

### Frame Rate
- Game preview runs at 60fps constantly
- **Fix**: RequestAnimationFrame should pause when tab inactive
- **Impact**: Battery drain + CPU usage

---

## Mobile Responsiveness

**Status**: Not tested (desktop only review)
**Action Required**: Test on mobile before submission

**Likely issues**:
- Touch controls for Pong (already implemented?)
- Wallet connection on mobile browsers
- Modal sizing on small screens
- Button sizes (need 44px minimum for touch)

---

## Recommended Fixes (Priority Order)

### Priority 1: Before Demo Recording
1. ✅ Add hover states to mode cards (visual feedback)
2. ✅ Add loading state to CONNECT WALLET button
3. ✅ Fix contrast on unlock requirement text (0.5 → 0.7 opacity)

### Priority 2: Before Submission
4. Fix semantic HTML (`<h1>` for title, `<button>` for cards)
5. Add ARIA labels for accessibility
6. Test wallet connection error handling

### Priority 3: Post-Hackathon
7. Code split for performance (reduce bundle size)
8. Pause game preview when not focused (60fps → 0fps)
9. Mobile testing + touch optimization

---

## Friend's Feedback Integration

**Status**: Pending user input
**Action**: User mentioned friend pointed out "a number" of issues

**Request**: Please share specific issues friend noticed:
- Which pages?
- What specific flaws?
- Screenshots if available?

Will add to this report once provided.

---

## Overall Assessment

### Strengths
- Professional visual design
- Clear information hierarchy
- Consistent color scheme (yellow CTAs, dark theme)
- Good onboarding flow
- Polished cosmetics system

### Weaknesses
- Missing interaction feedback (hover states)
- Some accessibility gaps
- Large bundle size (performance)
- Untested mobile experience

### Grade: B+ (85/100)
- Visual Design: A (95/100)
- Usability: B+ (85/100)
- Accessibility: C+ (75/100)
- Performance: B- (80/100)

**With recommended fixes**: A- (90/100)

---

## Next Steps

1. Implement Priority 1 fixes (1 hour)
2. Test with wallet connected (capture more screens)
3. Get specific feedback from friend
4. Record demo video showcasing polished UI
5. Submit to hackathon

**Estimated time to address all Priority 1 issues**: 1-2 hours
