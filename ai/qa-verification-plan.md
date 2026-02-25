# UI Revamp QA Verification Plan

**Goal:** Verify all design fixes are working correctly and nothing broke

## Task 1: Audit Validation
**Success criteria:** Understand what the 67 "violations" actually are
**Steps:**
1. Re-run automated audit: `node ~/.claude/skills/ui-revamp/scripts/audit.js /Users/yonko/Projects/last-rally-v4/src`
2. For each violation flagged:
   - Read the actual code context (not just the line)
   - Verify if it's inside a `@media (hover: hover)` block or not
   - Document: Real violation vs False positive
3. Create file: `ai/audit-analysis.md` with breakdown

**Output:** List of actual violations (if any) vs false positives

---

## Task 2: Fix Input Label Font-Size (if needed)
**Success criteria:** Decide if label needs to be 16px or if 12px is acceptable
**Steps:**
1. Read components.css line 701 context - what element uses this label?
2. Check HTML usage - is this label for an actual text input users type into?
3. Research: Do iOS zoom rules apply to labels or only inputs themselves?
4. Decision:
   - If label only: Keep 12px (zoom doesn't apply to labels)
   - If input related: Change to 16px or use `max(12px, 16px)` media query
5. Document decision in `ai/audit-analysis.md`

**Output:** Either keep 12px (with justification) or change to 16px

---

## Task 3: Visual QA - Screenshots & Testing
**Success criteria:** Confirm UI looks correct and animations work
**Steps:**
1. Navigate to https://yonkoo11.github.io/last-rally/
2. Take screenshots of key pages:
   - Landing page (before-after if possible)
   - Title screen
   - Mode select
   - Wager lobby
   - Achievements screen
   - Cosmetics screen
3. Test interactions:
   - Hover over buttons (should animate smoothly on desktop)
   - Touch on mobile simulator (hover effects should NOT trigger)
   - Check transitions are smooth (not janky)
   - Verify BONK cosmetics render correctly
4. Save screenshots to `ai/qa-screenshots/`
5. Document findings in `ai/visual-qa-report.md`

**Output:** Screenshots + report confirming visual correctness

---

## Task 4: Performance Check
**Success criteria:** Verify performance improvements from specific transitions
**Steps:**
1. Open browser DevTools Performance tab
2. Record interaction (hover over multiple buttons, open modals, etc.)
3. Check for:
   - No layout thrashing (excessive reflows)
   - Smooth 60fps animations
   - No unnecessary property changes
4. Compare mental model: `transition: all` would animate ALL properties, specific transitions only animate what we listed
5. Document in `ai/performance-check.md`

**Output:** Confirmation that transitions are performant

---

## Task 5: Hover State Verification
**Success criteria:** Confirm @media blocks are working correctly
**Steps:**
1. Test on desktop (hover should work)
2. Test on mobile simulator (hover should NOT trigger on tap)
3. Verify specific files:
   - components.css - all 25 hovers in @media block
   - design-system.css - all 7 hovers in @media block
   - TitleScreen.css - all 5 hovers in @media block
4. Document in `ai/hover-verification.md`

**Output:** Confirmation hover states work correctly per device

---

## Task 6: Final Audit Report
**Success criteria:** Comprehensive report of current state
**Steps:**
1. Compile all findings from Tasks 1-5
2. Create `ai/final-qa-report.md` with:
   - What was fixed (with evidence)
   - What remains unfixed (if anything)
   - Performance improvements measured
   - Visual correctness confirmed
   - Recommended next steps (if any)
3. Update task #24 with final status

**Output:** Complete QA report ready for review

---

## Success Definition
All tasks complete when:
- [ ] Audit violations understood (real vs false positive breakdown)
- [ ] Input label decision documented with reasoning
- [ ] Screenshots taken and visual correctness verified
- [ ] Performance improvements confirmed
- [ ] Hover states working correctly on desktop + mobile
- [ ] Final QA report written

**Estimated time:** 30-45 minutes of autonomous work
