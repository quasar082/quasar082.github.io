---
phase: 02-i18n-foundation-lab-aesthetic
plan: 02
subsystem: ui, i18n
tags: [header, language-switcher, mobile-menu, framer-motion, next-intl, translations, design-tokens]

# Dependency graph
requires:
  - phase: 02-i18n-foundation-lab-aesthetic
    plan: 01
    provides: next-intl i18n routing, design token system, translation files, locale layout
provides:
  - Fixed header with scroll blur effect, brand mark (FlaskConical), navigation links
  - EN/VI language switcher with localStorage persistence and next-intl router integration
  - Mobile hamburger menu with framer-motion slide-down animation
  - Expanded translation files (Home.description, Home.cta, Footer.copyright)
  - Placeholder home page demonstrating full design token system (hero, card, ghost button)
  - Header integrated into locale layout with proper pt-16 offset
affects: [phase-3, phase-4, phase-5, phase-6, phase-7, phase-8, phase-9]

# Tech tracking
tech-stack:
  added: []
  patterns: [Header with scroll blur via passive scroll listener, LanguageSwitcher with localStorage + router.replace, MobileMenu with AnimatePresence enter/exit, ghost button hover pattern]

key-files:
  created:
    - src/components/Header.tsx
    - src/components/LanguageSwitcher.tsx
    - src/components/MobileMenu.tsx
  modified:
    - src/messages/en.json
    - src/messages/vi.json
    - src/app/[lang]/layout.tsx
    - src/app/[lang]/page.tsx

key-decisions:
  - "FlaskConical from lucide-react chosen as brand mark placeholder icon -- evokes lab/science aesthetic"
  - "Ghost button style: transparent with green border, solid green fill on hover with dark text"

patterns-established:
  - "Header scroll effect: useState + passive scroll listener, threshold at 20px, bg-surface-base/80 + backdrop-blur-md"
  - "Language switcher pattern: useLocale + useRouter/usePathname from next-intl, persist to localStorage, router.replace with locale option"
  - "Mobile menu animation: AnimatePresence + motion.div, opacity + y transform only, 200ms ease-out entrance"
  - "Component text pattern: all visible text via useTranslations hook, zero hardcoded strings"

requirements-completed: [I18N-02, I18N-03]

# Metrics
duration: 4min
completed: 2026-03-14
---

# Phase 2 Plan 02: Header + Language Switcher + Mobile Menu Summary

**Header with scroll blur, EN/VI language switcher with localStorage persistence, framer-motion mobile menu, and expanded bilingual translations with design-system showcase home page**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T20:46:40Z
- **Completed:** 2026-03-13T20:50:27Z
- **Tasks:** 3 (2 auto + 1 auto-approved checkpoint)
- **Files modified:** 7

## Accomplishments
- Header component with fixed positioning, scroll-triggered backdrop blur, FlaskConical brand mark, desktop navigation links, and EN/VI language switcher
- LanguageSwitcher persists locale choice to localStorage and uses next-intl router for seamless locale navigation
- MobileMenu with framer-motion AnimatePresence slide-down animation (compositor-only: opacity + transform, 200ms)
- Home page rewritten as design-system showcase: hero section with greeting/role/tagline, elevated card with description, ghost button with hover fill
- All visible UI text sourced from translation files via useTranslations -- zero hardcoded strings in any component
- Both /en/ and /vi/ static builds succeed with correct hreflang metadata

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Header, LanguageSwitcher, and MobileMenu components** - `886a9ab` (feat)
2. **Task 2: Expand translations, integrate Header into layout, build home page content** - `a42b457` (feat)
3. **Task 3: Visual and functional verification** - auto-approved (auto mode)

## Files Created/Modified
- `src/components/Header.tsx` - Fixed header with scroll blur, brand mark, nav, language switcher, mobile toggle
- `src/components/LanguageSwitcher.tsx` - EN/VI toggle with localStorage persistence and next-intl router
- `src/components/MobileMenu.tsx` - AnimatePresence slide-down menu with nav links and language switcher
- `src/messages/en.json` - Added Home.description, Home.cta, Footer.copyright keys
- `src/messages/vi.json` - Added Vietnamese translations for new keys with proper diacritics
- `src/app/[lang]/layout.tsx` - Header import and render, children wrapped in main with pt-16
- `src/app/[lang]/page.tsx` - Rewritten with hero section, showcase card, ghost button

## Decisions Made
- FlaskConical from lucide-react chosen as brand mark placeholder icon (evokes lab/science aesthetic matching the dark lab design system)
- Ghost button implemented as `border border-accent text-accent hover:bg-accent hover:text-surface-base` per user-specified style

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - build succeeded on first attempt for both tasks, all verification checks passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 2 complete: bilingual routing + dark lab aesthetic + header + language switcher + mobile menu all operational
- Design token system fully demonstrated in home page (surfaces, text colors, accents, borders, fonts, ghost button)
- All components follow baseline-ui constraints (compositor-only animation, aria-labels, dvh, duration limits)
- Translation files structured and ready for expansion in future phases
- Ready for Phase 3: 3D robot model integration

## Self-Check: PASSED

All 7 created/modified files verified present on disk. Both task commits (886a9ab, a42b457) verified in git log.

---
*Phase: 02-i18n-foundation-lab-aesthetic*
*Completed: 2026-03-14*
