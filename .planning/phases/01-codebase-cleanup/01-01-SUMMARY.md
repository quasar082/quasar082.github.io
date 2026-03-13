---
phase: 01-codebase-cleanup
plan: 01
subsystem: ui
tags: [nextjs, react, server-components, static-export, seo]

# Dependency graph
requires: []
provides:
  - Correct client/server component boundaries (page.tsx as server component)
  - Clean next.config.ts with ESM export and no basePath/assetPrefix
  - All domain URLs updated to rayquasar18.github.io
  - BaseVideo and BaseImage simplified with direct src paths
affects: [02-build-pipeline, 03-3d-robot]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server component page.tsx composing client section components"
    - "Direct asset paths (no basePath prefix) for static export to root domain"

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/app/layout.tsx
    - src/components/GradientBackground.tsx
    - src/components/InfoItem.tsx
    - src/components/sections/IntroduceSection.tsx
    - src/components/sections/ProjectSection.tsx
    - src/components/BaseVideo.tsx
    - src/components/BaseImage.tsx
    - src/components/Footer.tsx
    - next.config.ts
    - .env.local
    - .env.production

key-decisions:
  - "page.tsx converted to server component for SEO and smaller client bundle"
  - "basePath/assetPrefix removed entirely since site deploys to root domain rayquasar18.github.io"

patterns-established:
  - "Client directive pattern: every component using React hooks, framer-motion, or browser APIs must have 'use client' directive"
  - "Asset path pattern: use direct paths (e.g., /hero/video1.webm) without basePath prefix"

requirements-completed: [FNDN-01, FNDN-02, UX-05]

# Metrics
duration: 5min
completed: 2026-03-13
---

# Phase 1 Plan 01: Codebase Cleanup Summary

**Fixed client/server component boundaries on 5 files, removed basePath/assetPrefix legacy config, and updated all domain references from quanmofii.github.io to rayquasar18.github.io**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-13T09:18:34Z
- **Completed:** 2026-03-13T09:24:24Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- Restored all source files from git and verified baseline build
- Fixed "use client" directives on 4 components (GradientBackground, InfoItem, IntroduceSection, ProjectSection) and converted page.tsx to server component
- Rewrote next.config.ts to proper TypeScript ESM with no basePath/assetPrefix
- Removed all NEXT_PUBLIC_BASE_PATH references from env files and components
- Updated all quanmofii.github.io domain references to rayquasar18.github.io
- Full static export build passes with all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Restore source files from git and install dependencies** - No commit needed (files restored to match HEAD, no changes to tracked files)
2. **Task 2: Fix "use client" directives and convert page.tsx to server component** - `e0935a0` (feat)
3. **Task 3: Remove basePath/URL legacy and update all domain references** - `36457a8` (fix)

## Files Created/Modified
- `src/app/page.tsx` - Removed "use client" directive (now server component)
- `src/components/GradientBackground.tsx` - Added "use client" directive
- `src/components/InfoItem.tsx` - Added "use client" directive
- `src/components/sections/IntroduceSection.tsx` - Added "use client" directive
- `src/components/sections/ProjectSection.tsx` - Added "use client" directive
- `next.config.ts` - Rewritten to TypeScript ESM, removed basePath/assetPrefix
- `.env.local` - Removed NEXT_PUBLIC_BASE_PATH
- `.env.production` - Removed NEXT_PUBLIC_BASE_PATH
- `src/components/BaseVideo.tsx` - Removed basePath prefix logic, uses direct src
- `src/components/BaseImage.tsx` - Removed basePath prefix logic, uses direct src
- `src/app/layout.tsx` - Updated all domain URLs from quanmofii to rayquasar18
- `src/components/Footer.tsx` - Updated repo link and display text for new domain

## Decisions Made
- page.tsx converted to server component since it uses no hooks, event handlers, or browser APIs -- only imports and renders client section components. Better for SEO and smaller client bundle.
- basePath and assetPrefix removed entirely (not conditionally) since the site deploys to root domain rayquasar18.github.io, not a subdirectory.
- Kept "QuanMofii" as a display name/brand in metadata (title, creator, alternateName) since it is a personal brand, not a domain reference.
- Project GitHub URLs (e.g., github.com/QuanMofii/PAPERY) left unchanged since they point to actual repositories under the old username.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated Footer.tsx domain references**
- **Found during:** Task 3 (Remove basePath/URL legacy)
- **Issue:** Footer.tsx contained two references to `QuanMofii.github.io` (repo link and display text) that were not listed in the plan's file list
- **Fix:** Updated `github.com/QuanMofii/QuanMofii.github.io` to `github.com/rayquasar18/rayquasar18.github.io` and display text to `#rayquasar18.github.io/`
- **Files modified:** src/components/Footer.tsx
- **Verification:** `grep -ri "quanmofii.github.io" src/` returns empty
- **Committed in:** 36457a8 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for meeting must_have "No references to quanmofii.github.io remain in any source file." No scope creep.

## Issues Encountered
- Baseline build succeeded (expected it might fail) -- the missing "use client" directives did not cause build errors in the existing configuration because Next.js was able to infer client boundaries from parent components. The fix is still correct for proper explicit boundaries and future reliability.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All source files restored and properly configured
- Build succeeds with static export
- Client/server component boundaries correctly established
- Ready for Plan 02 (remaining codebase cleanup tasks)

---
*Phase: 01-codebase-cleanup*
*Completed: 2026-03-13*

## Self-Check: PASSED

All 12 modified files verified on disk. Both task commits (e0935a0, 36457a8) verified in git log. SUMMARY.md exists at expected path.
