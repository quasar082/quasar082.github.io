# Project Research Summary

**Project:** RayQuasar / QuanMofii Portfolio v2.0 — White Minimalist Redesign
**Domain:** Award-winning portfolio redesign (Dennis Snellenberg aesthetic) on existing Next.js + R3F stack
**Researched:** 2026-03-15
**Confidence:** HIGH

## Executive Summary

This v2.0 redesign adds a GSAP/Lenis animation system, Dennis Snellenberg-style white minimalist aesthetic, and intro preloader sequence onto an existing, working Next.js 16 App Router portfolio with React Three Fiber, Zustand, Framer Motion, and next-intl. Only three new npm packages are needed: `gsap` (3.14.2), `@gsap/react` (2.1.2), and `lenis` (1.3.18). All are verified against the npm registry, fully compatible with the existing React 19/Next.js 16 stack, and together they deliver scroll-triggered animations, smooth scroll, text reveals, the preloader sequence, and the marquee hero — the defining features of the target aesthetic. Framer Motion is explicitly retained for the four components that already use it (ChatBar, ChatPanel, MobileMenu, TypingIndicator); GSAP does not replace it.

The recommended execution order is driven by hard architectural dependencies: the Lenis + GSAP + ScrollTrigger integration must come first because every downstream animation component depends on it. The white theme CSS overhaul must come second because every new section component is built against the final visual system. The preloader comes third because it gates the entire experience and exposes any Lenis/GSAP initialization timing issues early. Only then do hero, robot relocation, content sections, and polish-tier features follow. Page transitions are explicitly deferred — they are the single highest-complexity, most fragile feature relative to their visual payoff and should not block the v2.0 launch.

The critical risk cluster is the four-way interaction between Lenis smooth scroll, GSAP ScrollTrigger, the static export preloader, and the existing R3F Canvas. Each of these has a documented failure mode: scroll position desync, hydration mismatch, zombie ScrollTrigger instances after navigation, and WebGL context loss on Canvas remount. All four are preventable with known patterns (the `useGSAP` hook, CSS-class-based preloader visibility, `ScrollTrigger.refresh()` after preloader completion, and layout-level Canvas mounting). These patterns must be established as architectural constraints in Phase 1, not retrofitted later.

---

## Key Findings

### Recommended Stack

The existing stack is unchanged. Three packages are added for the animation system. GSAP 3.14.2 includes ScrollTrigger, SplitText, Flip, CustomEase, and Observer at no cost — the free npm package contains the full implementations (verified by tarball inspection). `@gsap/react` provides the `useGSAP()` hook, the mandatory React integration that handles GSAP context scoping and cleanup automatically. Lenis 1.3.18 provides smooth scroll via its `lenis/react` subpath (`ReactLenis`, `useLenis`) and must be driven by GSAP's ticker for perfect sync with ScrollTrigger.

See `.planning/research/STACK.md` for full version matrix, peer dependency checks, and feature-to-package mapping.

**Core technologies (new additions only):**
- `gsap@3.14.2`: Animation engine, ScrollTrigger, SplitText, Flip, CustomEase — primary animation runtime
- `@gsap/react@2.1.2`: `useGSAP()` hook — mandatory for React lifecycle-safe GSAP usage
- `lenis@1.3.18`: Smooth scroll — normalizes scroll across browsers, integrates with ScrollTrigger via GSAP ticker

**Do not add:** `split-type`, `locomotive-scroll`, `@barba/core`, `react-transition-group`, `gsap-trial`. All are unnecessary given the free GSAP package contents and the existing Next.js App Router setup.

---

### Expected Features

See `.planning/research/FEATURES.md` for full specifications, effort estimates, and implementation patterns.

**Must have (table stakes) — Priority 1-3:**
- White/warm-white CSS theme system — entire visual identity; everything depends on it
- Lenis smooth scroll — hallmark of premium portfolios; required for ScrollTrigger sync
- Oversized display typography (`clamp()` fluid sizing) — core aesthetic signal
- Scroll-triggered text reveals (clip-path / line-by-line) — universal pattern for minimalist portfolios
- Full-viewport hero with centered photo and marquee name — first impression; establishes the aesthetic
- Minimal navigation redesign — existing dark nav is incompatible with white theme
- Intro preloader sequence (text fade to curtain reveal) — narrative entrance; defines the experience
- 3D robot in dedicated Section 2 (relocated from hero) — gives robot a proper showcase stage
- Centered floating transparent chat bar redesign — redesign from dark right-aligned to glass centered

**Should have (differentiators):**
- Scroll-velocity-linked marquee speed — marquee reacts to scroll energy
- Magnetic hover effects on nav/buttons — Dennis Snellenberg signature micro-interaction
- Custom cursor — expected at Awwwards tier
- Section dividers with animated shapes — visual rhythm between content blocks
- Grain/noise texture overlay — warmth; prevents sterile white look
- Hover underline slide animations on nav links

**Defer to post-launch:**
- Page transitions — highest complexity, most fragile with App Router, moderate visual payoff
- Infinite scroll / pagination — unnecessary with current content volume
- Dark mode / theme toggle — contradicts the v2 design commitment
- Parallax on hero background images — dated pattern, competes with marquee

---

### Architecture Approach

The architecture is organized around a single new client-side provider hierarchy wrapping the existing layout: `SmoothScrollProvider` (Lenis + ScrollTrigger bridge) wraps `PreloaderGate` (preloader overlay logic) which wraps the existing `Header`, `<main>{children}`, and `ChatBar`. This hierarchy ensures Lenis initializes at layout level (singleton scroll controller — never per page), the preloader gates the whole experience, and ChatBar stays outside the GSAP-animated `<main>` to prevent Framer Motion/GSAP transform conflicts. The page content structure changes from a single hero section with inline robot to a sequential section layout: HeroSection, RobotSection, AboutSection, ProjectsSection, BlogSection, Footer.

See `.planning/research/ARCHITECTURE.md` for full component inventory, data flow diagrams, code patterns, and build order.

**Major components:**
1. `SmoothScrollProvider` (new) — Lenis `ReactLenis root` + ScrollTrigger bridge via `useLenis(() => ScrollTrigger.update())`
2. `PreloaderGate` + `Preloader` (new) — CSS-class-based overlay; GSAP timeline; `ScrollTrigger.refresh()` on complete
3. `HeroSection` (new) — photo + GSAP marquee + entrance animations; no robot
4. `RobotSection` (new) — `RobotCanvas` relocated here; GSAP scroll-triggered entrance on wrapper div
5. `TextReveal` + `ScrollReveal` (new) — reusable `useGSAP` animation wrappers for all content sections
6. `TransitionLink` (new, stretch) — GSAP exit/enter animation on route changes; defer to post-launch

**Unchanged components:** RobotCanvas, RobotScene, RobotModel, useRobotStore, useChatStore, ChatBar, ChatPanel, ChatBubble, ChatInput, PromptChips, TypingIndicator, services/chat.ts. The entire R3F and chat subsystem is encapsulated and animation-framework agnostic.

---

### Critical Pitfalls

See `.planning/research/PITFALLS.md` for full prevention patterns, warning signs, and recovery costs.

1. **ScrollTrigger zombie instances on route change** — Always use `useGSAP()` from `@gsap/react`, never raw `useEffect` + `gsap.to()`. The hook creates a scoped `gsap.context()` that auto-reverts on unmount. Establish this as the only allowed pattern in Phase 1 before writing any animation.

2. **Lenis + ScrollTrigger scroll position desync** — Drive Lenis from GSAP's ticker (`gsap.ticker.add((time) => lenis.raf(time * 1000))`), pipe Lenis scroll events to `ScrollTrigger.update`, set `gsap.ticker.lagSmoothing(0)`. Must be wired in `SmoothScrollProvider` before any ScrollTrigger animations are written.

3. **Preloader hydration mismatch on static export** — Use CSS class on `<html>` (`preloader-active`) to hide content, not React state. The HTML for both server and client is identical; JS removes the class after preloader completes. This prevents the flash-of-content that makes preloaders look broken.

4. **GSAP and Framer Motion fighting over transforms** — Maintain a hard boundary: GSAP owns scroll-driven, timeline, and page-level animations; Framer Motion owns component mount/unmount (ChatPanel, MobileMenu). Never apply both to the same DOM element. Keep ChatBar and its Framer Motion components as siblings of `<main>`, not children.

5. **R3F Canvas remount loses WebGL context** — Mount `RobotCanvas` at a stable DOM position; do not conditionally render it in different parent sections. Use CSS visibility or ScrollTrigger `onToggle` to show/hide it. Each remount re-downloads the .glb, re-uploads GPU buffers, and risks the iOS 8-context limit.

6. **ScrollTrigger.refresh() not called after preloader** — All trigger positions are calculated from hidden elements (zero dimensions) during the preloader. `ScrollTrigger.refresh()` must be called in the preloader's `onComplete` callback with a 1-frame delay (`requestAnimationFrame`) to let React commit DOM changes first.

---

## Implications for Roadmap

Based on the dependency graph from FEATURES.md and the architectural constraints from ARCHITECTURE.md and PITFALLS.md, the following phase structure is recommended. The ordering is not stylistic preference — it is driven by hard technical dependencies.

### Phase 1: Animation Infrastructure
**Rationale:** Every animation in v2.0 depends on GSAP, Lenis, and their synchronization being correct. Installing packages and wiring the provider hierarchy first means every subsequent phase can write animations immediately without re-architecting. This is also where all four critical pitfalls are mitigated at the source.
**Delivers:** `SmoothScrollProvider` with working Lenis + ScrollTrigger bridge; `useGSAP` pattern established as the only allowed GSAP hook; `gsap.registerPlugin()` centralized in `src/lib/gsap.ts`; Lenis working with existing Header, ChatBar, and R3F Canvas; static export GSAP guard in place.
**Addresses:** Smooth scroll (Lenis table stake), GSAP base (required by all animation features)
**Avoids:** P1 (zombie ScrollTriggers), P2 (Lenis/ScrollTrigger desync), P4 (GSAP/Framer Motion conflict), P7 (flash of native scroll)
**Research flag:** Standard patterns — skip `/gsd:research-phase`

### Phase 2: White Theme CSS Overhaul
**Rationale:** All new section components must be built against the final visual system. Building sections before the theme means double-work. This phase has no animation dependencies — it is a pure CSS token and component restyling task.
**Delivers:** Complete replacement of dark theme CSS variables in `globals.css` with white minimalist tokens; all existing components (Header, ChatBar, ChatPanel) restyled for light backgrounds; WCAG AA contrast validated; oversized display typography system (`clamp()` fluid sizing) in place.
**Addresses:** White theme (table stake), oversized display typography (table stake)
**Avoids:** Technical debt of building sections twice on the wrong theme
**Research flag:** Standard patterns — skip `/gsd:research-phase`

### Phase 3: Preloader Sequence
**Rationale:** The preloader gates the entire experience and exposes Lenis/GSAP initialization timing issues early. Building it third (immediately after infrastructure and theme) means timing bugs surface before the entire section library is built against a broken initialization sequence.
**Delivers:** `PreloaderGate` + `Preloader` components integrated into layout; GSAP timeline text sequence ("Welcome to the party" to "Quasar" to curtain reveal); CSS-class-based preloader visibility (no hydration mismatch); scroll lock during preloader; `ScrollTrigger.refresh()` on completion; sessionStorage skip for return visits.
**Addresses:** Loading/preloader (table stake), intro preloader sequence (differentiator)
**Avoids:** P3 (hydration mismatch), P6 (ScrollTrigger wrong positions after preloader)
**Research flag:** Standard patterns — skip `/gsd:research-phase`

### Phase 4: Hero Section
**Rationale:** The hero is the first thing users see after the preloader. It establishes the visual language for all subsequent sections and contains the marquee — the most visually distinctive feature. The robot is removed from the hero here; RobotSection is deferred to Phase 5.
**Delivers:** `HeroSection` with full-viewport layout, centered photo, oversized marquee name (GSAP infinite loop with optional velocity-link), role text, scroll indicator, GSAP entrance animations; robot removed from hero area.
**Addresses:** Full-viewport hero (table stake), oversized display typography (table stake), marquee name scroll (differentiator)
**Avoids:** Overcrowding the hero with both robot and marquee (explicit anti-feature)
**Research flag:** Standard patterns — skip `/gsd:research-phase`

### Phase 5: Robot Section Restructure
**Rationale:** The robot relocation is an architectural decision (Canvas mount strategy) that must be correct before building any surrounding content. Moving it at this stage — before About/Projects/Footer are built — means the surrounding section structure is fresh and the DOM is not yet tightly coupled. The key risk (WebGL context on remount) must be resolved here.
**Delivers:** `RobotSection` component; `RobotCanvas` relocated from hero to Section 2; GSAP scroll-triggered entrance on wrapper div; Canvas mount strategy confirmed; chat to robot emotion flow verified working in new position; R3F + GSAP coexistence verified.
**Addresses:** 3D robot in dedicated Section 2 (differentiator)
**Avoids:** P5 (R3F Canvas remount / WebGL context loss)
**Research flag:** Needs validation — Canvas mount strategy (layout-level vs. section-level) should be tested with a spike. Mark for `/gsd:research-phase` if Canvas remount behavior is unclear before planning.

### Phase 6: Content Sections + Scroll Animations
**Rationale:** All infrastructure, theme, preloader, hero, and robot are in place. This phase builds the remaining content sections and applies reusable animation patterns consistently.
**Delivers:** `AboutSection`, `ProjectsSection`, `BlogSection` (preview), `Footer`; `TextReveal` and `ScrollReveal` reusable components; scroll-triggered text reveals on all section headings; project card fade-up animations; footer with large display CTA; i18n wired for all sections.
**Addresses:** Scroll-triggered text reveals (table stake), generous whitespace (table stake), responsive design (table stake), section numbering, text weight contrast, hover underline animations
**Avoids:** Animation fatigue (animating every element is an explicit anti-feature); scroll-jacking (anti-feature)
**Research flag:** i18n + animation integration needs attention — Vietnamese text lengths differ; `ScrollTrigger.refresh()` must be called on locale change. Otherwise standard patterns.

### Phase 7: Polish and Micro-interactions
**Rationale:** Ship-blocking features are complete. This phase adds the differentiating micro-interactions that elevate the site to Awwwards tier. All items are additive — nothing breaks if any one is cut.
**Delivers:** Magnetic hover effects on nav and CTA buttons (GSAP `quickTo()`); custom cursor; scroll-velocity-linked marquee speed; grain/noise texture overlay; section dividers with animated shapes; hover underline slide animations; Dennis Snellenberg design details (rounded image masks, monospace accent text, smooth color section transitions).
**Addresses:** Cursor-following interactions (table stake), magnetic hover (differentiator), scroll-velocity animations (differentiator), section dividers (differentiator)
**Avoids:** Overbuilding polish before core content is solid
**Research flag:** Standard patterns — skip `/gsd:research-phase`

### Phase 8: Page Transitions (Stretch Goal — Post-Launch)
**Rationale:** Explicitly deferred. This is the highest-complexity, most fragile feature relative to visual payoff. The site is primarily a single-page scroll experience; actual route changes are infrequent. Ship v2.0 without this and add it in a dedicated post-launch phase.
**Delivers:** `TransitionLink` component; page transition overlay in layout; GSAP exit/enter timeline on route changes; tested with static export.
**Addresses:** Page transitions (differentiator)
**Avoids:** Blocking launch on a feature known to be brittle with Next.js App Router
**Research flag:** Needs `/gsd:research-phase` — no built-in App Router transition API; `TransitionLink` + overlay approach has known timing heuristics that need live validation.

---

### Phase Ordering Rationale

- Phases 1-3 are pure prerequisites. No animation can be correctly written before Phase 1; no component can be correctly styled before Phase 2; no timing issue can be caught early without Phase 3.
- Phases 4-6 follow FEATURES.md Priority 1-3 ordering exactly, which is itself derived from the feature dependency graph: hero depends on theme and animation infra; robot depends on hero being separated; content sections depend on robot being positioned.
- Phase 7 is explicitly deferred polish. All Phase 7 features are `should-have` or `differentiator` tier, not `table stakes`.
- Phase 8 (page transitions) is a post-launch stretch. FEATURES.md and ARCHITECTURE.md both independently recommend deferral, and PITFALLS.md rates recovery cost as HIGH if implemented incorrectly.

---

### Research Flags

**Needs `/gsd:research-phase` during planning:**
- **Phase 5 (Robot Section):** Canvas mount strategy for the WebGL context remount issue needs a code spike before planning commits to either approach (layout-level Canvas vs. stable-position section Canvas). Behavior on iOS Safari is not covered by training data with sufficient confidence.
- **Phase 8 (Page Transitions):** The `TransitionLink` + overlay approach is architecturally sound but timing-heuristic-based. The App Router `router.push` timing relative to the enter animation needs live verification.

**Standard patterns — skip `/gsd:research-phase`:**
- **Phase 1:** Lenis + GSAP integration is well-documented; `useGSAP` hook is official. Verified from npm registry.
- **Phase 2:** CSS variable overhaul and Tailwind v4 `@theme inline` are standard.
- **Phase 3:** GSAP timeline + CSS-class preloader pattern is architecturally sound and well-tested.
- **Phase 4:** Marquee loop and GSAP entrance animations are established patterns.
- **Phase 6:** `TextReveal` / `ScrollReveal` with `useGSAP` + `ScrollTrigger` are standard.
- **Phase 7:** GSAP `quickTo()` for magnetic effects, CSS `::after` for hover underlines — standard.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All three new packages verified against npm registry; tarball inspection confirmed SplitText free availability; peer deps confirmed compatible with React 19.2.3 |
| Features | HIGH | Table stakes are industry-standard patterns; differentiators are well-documented GSAP/CSS techniques applied to a unique context; anti-features explicitly scoped in project requirements |
| Architecture | MEDIUM-HIGH | `useGSAP` hook and Lenis `root` mode are HIGH confidence (official packages, npm-verified); Preloader in App Router and Lenis `root` + ScrollTrigger without scrollerProxy are MEDIUM (architecturally sound, training data, could not verify against live docs) |
| Pitfalls | HIGH | Codebase-verified integration analysis; all seven critical pitfalls are rooted in documented GSAP, Lenis, R3F, and Next.js behaviors with clear prevention patterns and stated recovery costs |

**Overall confidence:** HIGH

### Gaps to Address

- **Lenis `root` mode + ScrollTrigger sync without scrollerProxy:** The modern (v1.x) pattern is that `scrollerProxy` is no longer needed. Validate this in Phase 1 with a simple ScrollTrigger pin test before writing all scroll animations.
- **R3F Canvas remount strategy on iOS Safari:** WebGL context limit (8 contexts) on iOS is documented but the specific behavior when remounting a Three.js Canvas via React reconciler has not been live-tested in this codebase. Validate in Phase 5 spike before committing to the section-level Canvas approach.
- **`ScrollTrigger.refresh()` after preloader timing:** The `requestAnimationFrame` vs. `setTimeout(fn, 100)` delay for letting React commit DOM changes is a heuristic. Validate in Phase 3 that trigger positions are correct on first scroll after preloader completion.
- **i18n (Vietnamese) + text reveal animations:** Vietnamese text is significantly longer than English for the same content. SplitText / word-split reveals may overflow or clip incorrectly. Validate in Phase 6 by testing all section headings with the `vi` locale active.

---

## Sources

### Primary (HIGH confidence)
- npm registry queries (2026-03-15): `gsap@3.14.2`, `@gsap/react@2.1.2`, `lenis@1.3.18` — versions, peer deps, license, publish dates
- Tarball inspection (2026-03-15): `gsap@3.14.2` ScrollTrigger.js (112.1kB), SplitText.js (17.3kB), Flip.js (49.1kB), Observer.js (26.1kB), CustomEase.js (11.4kB) confirmed as full implementations; `lenis@1.3.18` `dist/lenis-react.d.ts` confirmed `ReactLenis`, `useLenis`, `LenisContext` exports
- Existing codebase (2026-03-15): `package.json`, `src/app/[lang]/layout.tsx`, `src/components/chat/ChatBar.tsx`, `src/components/robot/RobotCanvas.tsx`, `src/lib/fonts.ts`, `next.config.ts` (`output: 'export'`)
- GSAP standard license: https://gsap.com/standard-license — confirmed free for personal portfolio use

### Secondary (MEDIUM confidence)
- GSAP ScrollTrigger docs: gsap.com/docs/v3/Plugins/ScrollTrigger — trigger lifecycle, refresh, kill (training data)
- GSAP React guide: gsap.com/resources/React — `useGSAP` hook, `gsap.context()` pattern (training data)
- Lenis + GSAP integration: github.com/darkroomengineering/lenis README — ScrollTrigger sync pattern (training data)
- Next.js static export docs: nextjs.org/docs — `output: 'export'` constraints (training data)
- Dennis Snellenberg design reference: dennissnellenberg.com — design patterns (training data, Awwwards-documented)

### Tertiary (LOW confidence — needs live validation)
- iOS Safari WebGL context limit behavior on Canvas remount — training data, validate in Phase 5 spike
- Lenis `root` mode + ScrollTrigger without `scrollerProxy` in Lenis v1.3.x — training data, validate in Phase 1

---
*Research completed: 2026-03-15*
*Ready for roadmap: yes*
