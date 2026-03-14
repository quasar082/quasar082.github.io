# Technology Stack: v2.0 Redesign Additions

**Project:** RayQuasar Portfolio v2.0 -- White Minimalist Redesign
**Researched:** 2026-03-15
**Overall Confidence:** HIGH (all versions verified against npm registry; API types extracted and inspected)

---

## Scope: New Packages Only

This document covers ONLY the new dependencies required for the v2.0 redesign features (GSAP animations, Lenis smooth scroll, text reveals, preloader, page transitions, marquee typography). The existing stack is validated and unchanged:

| Existing (Keep As-Is) | Version | Role |
|------------------------|---------|------|
| Next.js | 16.1.6 | Framework, App Router |
| React | 19.2.3 | UI rendering |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| React Three Fiber | ^9.5.0 | 3D robot |
| @react-three/drei | ^10.7.7 | 3D utilities |
| Zustand | ^5.0.11 | Global state |
| next-intl | ^4.8.3 | i18n |
| Framer Motion | ^12.36.0 | **Retained** for component-level animations (chat panel, mobile menu, typing indicator) |
| lucide-react | ^0.577.0 | Icons |

**Framer Motion is NOT replaced.** It stays for the 4 components that use it today (MobileMenu, ChatBar, ChatPanel, TypingIndicator). GSAP handles the new scroll-driven, timeline-based, and page-level animations. This avoids a risky migration of working code.

---

## New Package 1: gsap -- 3.14.2

**Purpose:** Professional animation engine for scroll-triggered animations, text reveals, preloader timeline, curtain transitions, marquee effects, and page transitions.

**Why GSAP, not more Framer Motion:**
- GSAP's ScrollTrigger provides precise scroll-linked animations with scrubbing, pinning, and snap. Framer Motion's `whileInView` is binary (in/out) with no scrub control.
- GSAP timelines compose complex multi-step sequences (preloader: fade text in, hold, fade out, curtain slide) declaratively. Framer Motion variants cannot express timeline sequencing with this level of control.
- `SplitText` (now included free in gsap 3.14.2) splits DOM text into chars/words/lines for per-character reveal animations. This is core to the Dennis Snellenberg text reveal aesthetic.
- GSAP is the de facto standard for award-winning portfolio sites. Dennis Snellenberg himself uses GSAP.
- Performance: GSAP uses its own optimized render loop, bypasses React reconciliation for animation frames, and batches DOM writes.

**What plugins are included in the free npm package (verified by unpacking gsap@3.14.2):**

| Plugin | Use in v2.0 |
|--------|------------|
| ScrollTrigger | Scroll-linked animations for every section, parallax effects, pin preloader |
| SplitText | Split headings/paragraphs into chars/words/lines for reveal animations |
| Observer | Detect scroll/touch/pointer events for custom interactions |
| Flip | Layout animation transitions (project card expansions) |
| CustomEase | Custom easing curves matching the design reference |
| MotionPathPlugin | Available if needed for decorative path animations |

**License:** GSAP Standard "no charge" license. Permits free use on sites that are not sold as tools/templates to multiple end users. A personal portfolio qualifies. No license fee.

**Last published:** 2025-12-12

**Install:**
```bash
npm install gsap
```

**Confidence:** HIGH -- version verified via npm registry. Plugin contents verified by unpacking the tarball and inspecting source files. SplitText confirmed as full implementation (not a stub).

---

## New Package 2: @gsap/react -- 2.1.2

**Purpose:** Official GSAP React integration. Provides `useGSAP()` hook -- a drop-in replacement for `useLayoutEffect`/`useEffect` that automatically handles GSAP context creation and cleanup.

**Why this is essential (not optional):**
- Without `useGSAP()`, every component using GSAP must manually create a `gsap.context()`, register animations, and call `context.revert()` on unmount. This is error-prone and leads to memory leaks on route changes.
- `useGSAP()` scopes all GSAP animations to a ref, so animations in one component cannot accidentally target elements in another.
- Handles React 19 strict mode correctly (double-mount in dev won't create duplicate animations).

**Peer requirements:** `gsap ^3.12.5` (satisfied by 3.14.2), `react >=17` (satisfied by 19.2.3).

**Usage pattern:**
```typescript
'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // All animations auto-scoped to containerRef
    // Auto-cleaned up on unmount
    gsap.from('.hero-title', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
    });
  }, { scope: containerRef });

  return <div ref={containerRef}>...</div>;
}
```

**Last published:** 2025-12-12

**Install:**
```bash
npm install @gsap/react
```

**Confidence:** HIGH -- verified via npm registry. Peer deps confirmed compatible.

---

## New Package 3: lenis -- 1.3.18

**Purpose:** Smooth scroll library that normalizes scroll behavior across browsers and devices. Provides the buttery-smooth, momentum-based scrolling that defines the Dennis Snellenberg aesthetic.

**Why Lenis, not native CSS `scroll-behavior: smooth`:**
- CSS `scroll-behavior: smooth` only affects programmatic scrolls (anchor clicks, `scrollTo()`). It does NOT smooth mousewheel/trackpad scrolling.
- Lenis intercepts wheel/touch events and applies lerp-based (linear interpolation) smoothing to ALL scroll input, creating the characteristic momentum feel.
- Lenis integrates with GSAP ScrollTrigger -- critical because ScrollTrigger needs to know the actual scroll position (which Lenis controls).

**Why Lenis, not GSAP ScrollSmoother:**
- ScrollSmoother is a GSAP Club (paid) plugin, NOT included in the free npm package.
- Lenis is MIT-licensed and free.
- Lenis is the community standard for smooth scroll; used by most award-winning portfolio sites alongside GSAP.

**React integration (built-in):**
Lenis ships with `lenis/react` subpath export providing `ReactLenis` component and `useLenis` hook:

```typescript
'use client';
import { ReactLenis } from 'lenis/react';

// In root layout or a client wrapper:
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      {children}
    </ReactLenis>
  );
}
```

The `root` prop makes Lenis control `window` scroll (no wrapper div needed). The `ReactLenis` component provides context so any child can access the Lenis instance via `useLenis()`.

**Lenis + ScrollTrigger bridge:**
Lenis must sync its scroll position to ScrollTrigger. The standard pattern:

```typescript
'use client';
import { useEffect } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollTriggerSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Sync Lenis scroll to ScrollTrigger on every frame
    lenis.on('scroll', ScrollTrigger.update);

    // Use Lenis's RAF for GSAP ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, [lenis]);

  return null;
}
```

**Peer requirements:** `react >=17.0.0` (satisfied by 19.2.3). Other peers (`@nuxt/kit`, `vue`) are optional.

**Last published:** 2026-03-04 (very actively maintained)

**Install:**
```bash
npm install lenis
```

**Confidence:** HIGH -- version verified via npm registry. React types extracted and inspected from `dist/lenis-react.d.ts`. API confirmed: `ReactLenis`, `useLenis`, `LenisContext`.

---

## Do NOT Add These

| Package | Why Not |
|---------|---------|
| `split-type` (0.3.4) | GSAP 3.14.2 now includes `SplitText` for free. No reason to add a separate text-splitting library. SplitText integrates natively with GSAP timelines. |
| `locomotive-scroll` | Predecessor to Lenis (same team: darkroom.engineering). Lenis is the successor -- lighter, better maintained, cleaner API. |
| `@studio-freight/lenis` | Old package name. Renamed to `lenis` under darkroom.engineering. Use `lenis` directly. |
| `gsap-trial` | Unnecessary. All needed plugins (ScrollTrigger, SplitText, Observer, Flip, CustomEase) are in the free `gsap` package as of 3.12+. |
| `smooth-scrollbar` | Heavier than Lenis, less ecosystem integration with ScrollTrigger. |
| `react-transition-group` | GSAP timelines handle page transitions more powerfully. |
| `@barba/core` | Page transition library designed for vanilla JS multi-page apps. Next.js App Router handles routing; GSAP handles the animation layer. |
| Additional font packages | Existing `next/font` setup with local fonts (MarlinGeoSQ, Saprona) and Geist Mono is sufficient. Font choice is a design decision, not a stack one. If new fonts are needed for v2, add them via `next/font/local` or `next/font/google` -- no new npm packages required. |
| `@tailwindcss/typography` | Already in STACK.md v1 scope for blog. Not a v2 redesign concern. |

---

## GSAP Plugin Registration (One-Time Setup)

GSAP plugins must be registered once, globally. Create a single registration module:

```typescript
// src/lib/gsap.ts
'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, Observer);

export { gsap, ScrollTrigger, SplitText, Flip, CustomEase, Observer };
```

All components import from `@/lib/gsap` instead of directly from `gsap/...`. This ensures plugins are registered before use and provides a single place to configure defaults.

---

## Integration Architecture with Existing Stack

### GSAP + React Three Fiber
- No direct conflict. R3F manages its own render loop (`useFrame`). GSAP manages DOM animations.
- The 3D robot in Section 2 can have its container scroll-triggered via GSAP ScrollTrigger while R3F handles the 3D rendering inside.
- Do NOT use GSAP to animate Three.js objects directly -- use R3F's `useFrame` for that. GSAP controls the DOM wrapper visibility/position.

### GSAP + Framer Motion (Coexistence)
- Both can exist in the same project. The rule: Framer Motion owns component-level mount/unmount animations (AnimatePresence in chat, mobile menu). GSAP owns scroll-driven, timeline-based, and page-level animations.
- Never use both on the same DOM element simultaneously. This causes conflicting transforms.
- Framer Motion's `motion.div` manages its own transforms via style props. GSAP writes transforms directly to `element.style.transform`. If both target the same element, the last writer wins, causing jank.

### GSAP + Zustand
- Zustand stores can trigger GSAP animations. Example: preloader completion state in Zustand triggers hero entrance animation.
- Pattern: Zustand store holds `isPreloaderDone: boolean`. Hero component watches it and starts GSAP timeline when true.

### Lenis + Next.js App Router
- `ReactLenis` with `root` prop wraps the content in the root layout's client boundary.
- Lenis works with native browser scrolling position, so Next.js scroll restoration works normally.
- On route change, call `lenis.scrollTo(0, { immediate: true })` to reset scroll position.

### GSAP + Next.js SSR / Static Export
- All GSAP code MUST be in `'use client'` components. GSAP accesses the DOM and cannot run server-side.
- `gsap.registerPlugin()` must NOT run at module level in a server component -- always in a client module.
- ScrollTrigger `invalidateOnRefresh: true` should be set for layouts that change on resize.

---

## Complete Install Command

```bash
# v2.0 animation system (3 packages, that's it)
npm install gsap @gsap/react lenis
```

No dev dependencies needed. All three are runtime dependencies.

---

## Version Matrix (Verified 2026-03-15)

| Package | Version | npm Published | React Compat | Notes |
|---------|---------|---------------|--------------|-------|
| gsap | 3.14.2 | 2025-12-12 | Framework-agnostic | Includes ScrollTrigger, SplitText, Flip, CustomEase, Observer |
| @gsap/react | 2.1.2 | 2025-12-12 | `>=17` (React 19.2.3 OK) | Peer: `gsap ^3.12.5` |
| lenis | 1.3.18 | 2026-03-04 | `>=17.0.0` (React 19.2.3 OK) | MIT license. Ships `lenis/react` subpath |

---

## Peer Dependency Compatibility Check

| Library | React req | GSAP req | Status |
|---------|-----------|----------|--------|
| gsap 3.14.2 | (none) | -- | Framework-agnostic, no React peer |
| @gsap/react 2.1.2 | `>=17` | `^3.12.5` | React 19.2.3 OK, gsap 3.14.2 OK |
| lenis 1.3.18 | `>=17.0.0` | (none) | React 19.2.3 OK. Vue/Nuxt peers optional |

All new packages are compatible with the existing stack. Zero peer conflicts.

---

## Feature-to-Package Mapping

| v2.0 Feature | Primary Package | Specific API |
|---------------|-----------------|-------------|
| Smooth scroll (whole site) | lenis | `ReactLenis` with `root` prop |
| Scroll-triggered section reveals | gsap | `ScrollTrigger` plugin |
| Text reveal animations (clip-path) | gsap | `SplitText` + `gsap.from()` with `clipPath` |
| Intro preloader sequence | gsap | `gsap.timeline()` with sequenced tweens |
| Curtain transition (preloader -> hero) | gsap | `gsap.to()` animating `clipPath` or `y` transform |
| Oversized marquee typography | gsap | `gsap.to()` with `xPercent` + `repeat: -1` |
| Page transitions | gsap | `gsap.timeline()` triggered on route change |
| Parallax effects | gsap | `ScrollTrigger` with `scrub: true` |
| Pinned sections | gsap | `ScrollTrigger` with `pin: true` |
| React cleanup/scoping | @gsap/react | `useGSAP()` hook with `scope` option |
| Lenis + ScrollTrigger sync | lenis + gsap | `lenis.on('scroll', ScrollTrigger.update)` bridge |

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| GSAP core + plugins | HIGH | Version, contents, and source verified via npm registry + tarball inspection |
| @gsap/react | HIGH | Peer deps verified; API confirmed from npm description |
| Lenis | HIGH | Version verified; React types extracted and inspected from dist |
| Lenis-GSAP integration | MEDIUM | Bridge pattern is well-documented by both communities but not verified from official docs (WebFetch unavailable). Pattern is stable and widely used. |
| GSAP + Next.js App Router | MEDIUM | Client-only constraint is standard; official GSAP React guide exists but could not be fetched. Pattern confirmed by training data + npm metadata. |
| SplitText free availability | HIGH | Confirmed by extracting actual source from gsap@3.14.2 tarball -- full implementation, not a stub |
| License for portfolio use | HIGH | GSAP standard license field on npm explicitly says "no charge". Personal portfolio is covered. |

---

## Sources

- **npm registry** (live queries, 2026-03-15):
  - `gsap@3.14.2` -- version, license, keywords, exports, dist-tags, publish date
  - `@gsap/react@2.1.2` -- version, peerDependencies, description
  - `lenis@1.3.18` -- version, license, peerDependencies, exports, publish date
  - `split-type@0.3.4` -- version, description (investigated and rejected)
- **Tarball inspection** (2026-03-15):
  - `gsap@3.14.2`: Unpacked and verified ScrollTrigger.js (112.1kB), SplitText.js (17.3kB), Flip.js (49.1kB), Observer.js (26.1kB), CustomEase.js (11.4kB) are real implementations
  - `lenis@1.3.18`: Extracted `dist/lenis-react.d.ts` and `dist/lenis.d.ts` -- confirmed ReactLenis, useLenis, LenisContext exports and full LenisOptions type
- **Existing codebase** (2026-03-15):
  - `package.json` -- confirmed Next.js 16.1.6, React 19.2.3, Framer Motion ^12.36.0
  - `src/lib/fonts.ts` -- confirmed next/font local fonts setup
  - `src/components/` -- confirmed Framer Motion used in 4 components only (MobileMenu, ChatBar, ChatPanel, TypingIndicator)
- GSAP standard license: https://gsap.com/standard-license

---

*Stack research for v2.0 redesign: 2026-03-15*
