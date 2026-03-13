---
phase: 01-codebase-cleanup
plan: 02
subsystem: ui
tags: [framer-motion, loading-screen, scroll-animation, react, nextjs]

# Dependency graph
requires:
  - phase: 01-codebase-cleanup plan 01
    provides: Correct client/server boundaries, restored source files, clean next.config.ts
provides:
  - LoadingScreen with race-condition-free dismiss logic and compositor-only exit animation
  - HeroSection with self-documenting named scroll constants
affects: [05-hero-rebuild]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Promise.all + Promise.race pattern for multi-condition wait with timeout fallback"
    - "framer-motion motion.div with animate prop for exit animations (no AnimatePresence needed for self-managed components)"
    - "Named constant objects with 'as const' for scroll animation keyframes"

key-files:
  created: []
  modified:
    - src/components/LoadingScreen.tsx
    - src/components/sections/HeroSection.tsx

key-decisions:
  - "LoadingScreen uses self-managed state machine (loading/exiting/done) instead of AnimatePresence in parent, avoiding need to make layout.tsx a client component"
  - "HERO_SCROLL_HEIGHT kept as inline comment rather than JS constant because Tailwind JIT requires static class strings"

patterns-established:
  - "Loading screen dismiss: Promise.all([readyState, minTime]) with Promise.race timeout fallback"
  - "Exit animation: motion.div animate prop with onAnimationComplete callback for DOM removal"
  - "Scroll constants: SCROLL_KEYFRAMES object with descriptive property names for useTransform ranges"

requirements-completed: [FNDN-04]

# Metrics
duration: 5min
completed: 2026-03-13
---

# Phase 1 Plan 02: Loading Screen Fix and HeroSection Constants Summary

**Rewrote LoadingScreen with Promise.all dismiss logic and scale+fade exit via framer-motion; extracted all HeroSection scroll magic numbers into named SCROLL_KEYFRAMES and QUOTE_TRANSFORM constants**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-13T09:28:28Z
- **Completed:** 2026-03-13T09:33:23Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Eliminated race condition in LoadingScreen by replacing dual setTimeout/window.load with Promise.all pattern
- Replaced layout-triggering h-screen/h-0 exit animation with compositor-only scale(0.95)+opacity(0) via framer-motion
- Added 8-second timeout fallback so loading screen never gets permanently stuck
- Added scroll lock (body overflow hidden) during loading screen display
- Extracted all 10+ magic numbers from HeroSection useTransform calls into descriptive named constants
- Full static export build passes with both changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite LoadingScreen with proper timing and scale+fade exit** - `d138c1f` (fix)
2. **Task 2: Extract HeroSection scroll magic numbers into named constants** - `79a7f69` (refactor)

## Files Created/Modified
- `src/components/LoadingScreen.tsx` - Complete rewrite: three-phase state machine (loading/exiting/done), Promise.all+Promise.race dismiss logic, framer-motion scale+fade exit, scroll lock, DOM removal after animation
- `src/components/sections/HeroSection.tsx` - Added SCROLL_KEYFRAMES, QUOTE_TRANSFORM, VIDEO_BORDER_RADIUS, HERO_HEADER_OFFSET_PX, HERO_TRANSLATE_Y_FACTOR constants; replaced all bare numbers in useTransform calls

## Decisions Made
- Used self-managed state machine in LoadingScreen (internal phase state) instead of AnimatePresence in layout.tsx, because layout.tsx must remain a server component for metadata exports. The motion.div animate prop with onAnimationComplete callback achieves the same exit animation effect.
- Removed HERO_SCROLL_HEIGHT as a JS constant since it was only used in a Tailwind className (h-[1100vh]) which must be a static string for JIT compilation. Kept as an inline comment instead.
- Left opacity output values [0, 1] in quoteOpacity useTransform as literal numbers since they are semantic (fully transparent to fully opaque), not magic numbers.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused variable build error for HERO_SCROLL_HEIGHT**
- **Found during:** Task 2 (HeroSection constants extraction)
- **Issue:** ESLint `@typescript-eslint/no-unused-vars` rejected HERO_SCROLL_HEIGHT because Tailwind classes must be static strings -- the constant could not be interpolated into the className
- **Fix:** Removed the JS constant and used an inline comment on the className instead
- **Files modified:** src/components/sections/HeroSection.tsx
- **Verification:** `npx next build` passes without errors
- **Committed in:** 79a7f69 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary adaptation for Tailwind JIT constraint. The constant value is still documented via comment. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviation above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 1 (Codebase Cleanup) is now fully complete -- both plans executed
- All client/server boundaries correct, basePath removed, loading screen fixed, scroll constants extracted
- Build passes with static export
- Ready to proceed to Phase 2

---
*Phase: 01-codebase-cleanup*
*Completed: 2026-03-13*

## Self-Check: PASSED

All 2 modified files verified on disk. Both task commits (d138c1f, 79a7f69) verified in git log. SUMMARY.md exists at expected path.
