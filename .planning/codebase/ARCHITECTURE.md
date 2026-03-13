# Architecture

**Analysis Date:** 2026-03-13

## Pattern Overview

**Overall:** Single-page application (SPA) with vertical scroll narrative, built on Next.js App Router with static export

**Key Characteristics:**
- Single route (`/`) renders the entire portfolio as one long-scroll page
- No server-side rendering — output mode is `export` (static HTML/CSS/JS)
- All interactivity is client-side via Framer Motion scroll/in-view hooks
- Component-driven: page is assembled by composing section and shared components
- No state management store (Zustand is listed as a dependency but not used in current components)

## Layers

**Route Layer:**
- Purpose: Next.js App Router routing and HTML shell
- Location: `src/app/`
- Contains: `layout.tsx` (root HTML, metadata, global fonts, persistent chrome), `page.tsx` (page composition), `globals.css` (Tailwind base + CSS custom properties)
- Depends on: Components layer
- Used by: Next.js build system

**Page Composition Layer:**
- Purpose: Assembles sections into a scrollable page
- Location: `src/app/page.tsx`
- Contains: Ordered `<main>` wrapper with all page sections in sequence
- Depends on: Section components
- Used by: App Router, rendered inside `layout.tsx`

**Section Components Layer:**
- Purpose: Self-contained, full-screen scroll segments representing page chapters
- Location: `src/components/sections/`
- Contains: `HeroSection.tsx`, `IntroduceSection.tsx`, `AboutSection.tsx`, `ProjectSection.tsx`
- Depends on: Shared UI components, Framer Motion, Next.js `Link`
- Used by: `src/app/page.tsx`

**Shared UI Components Layer:**
- Purpose: Reusable primitives and interactive micro-components
- Location: `src/components/`
- Contains: Animation wrappers (`AnimatedDiv`, `AnimatedText`), media wrappers (`BaseImage`, `BaseVideo`), interactive buttons (`ButtonDownloadCV`, `ButtonRedirect`), structural chrome (`Header`, `Footer`, `LoadingScreen`), visual effects (`GradientBackground`), data display (`InfoItem`)
- Depends on: Framer Motion, Lucide React, Next.js `Image`/`Link`, `ldrs` (loader animations)
- Used by: Section components and `layout.tsx`

## Data Flow

**Scroll-Driven Animation Flow:**
1. User scrolls the page
2. `HeroSection` uses `useScroll` + `useTransform` from Framer Motion to compute scroll-based values (`scaleX`, `scaleY`, `borderRadius`, etc.)
3. Motion values are applied directly to `motion.div` `style` props — no React state updates, fully declarative
4. `IntroduceSection` uses `useInView` to trigger entry animations when sections enter the viewport
5. `Header` listens to `window.scroll` via `useEffect` to update `activeSection` state and `logoColor` state reactively

**In-View Animation Flow:**
1. `AnimatedDiv` and `AnimatedText` both observe their own DOM node via `IntersectionObserver` (wrapped via Framer Motion's `useInView` or manual `IntersectionObserver`)
2. When a node enters the viewport, visibility state flips to `true`
3. Framer Motion `animate` prop switches between initial and final states using spring physics
4. `once` prop controls whether animation replays on scroll-out

**Asset Resolution Flow:**
1. `BaseImage` and `BaseVideo` prepend `process.env.NEXT_PUBLIC_BASE_PATH` to all `src` values
2. This resolves GitHub Pages sub-path deployment (e.g., `/rayquasar18.github.io/` prefix)
3. `ButtonDownloadCV` constructs a programmatic `<a>` download link pointing to `/HaMinhQuan_CV.pdf`

**State Management:**
- Local component state only (`useState`, `useRef`)
- No global store in active use
- Header uses derived scroll state to color-switch logo and highlight active nav item

## Key Abstractions

**AnimatedText:**
- Purpose: Word-by-word staggered entrance animation for any text string
- Examples: `src/components/AnimatedText.tsx`
- Pattern: Splits text into words, maps each to a `motion.div` with staggered `delay: index * 0.1`. Accepts `as` prop to render as any heading/paragraph tag. Accepts `once` prop for replay control.

**AnimatedDiv:**
- Purpose: Scroll-into-view reveal wrapper for block-level content
- Examples: `src/components/AnimatedDiv.tsx`
- Pattern: Wraps children in a single `motion.div` with configurable `initialScale`, `finalScale`, optional `withRotate`. Triggers on `useInView` with `margin: "-100px"` offset.

**BaseImage / BaseVideo:**
- Purpose: Path-aware media wrappers that handle GitHub Pages base path
- Examples: `src/components/BaseImage.tsx`, `src/components/BaseVideo.tsx`
- Pattern: Prefix all `src` with `NEXT_PUBLIC_BASE_PATH` env var. `BaseImage` delegates to Next.js `Image` with `fill` + `sizes`. `BaseVideo` renders an autoplay, muted, looping `<video>` with interaction controls disabled.

**Section:**
- Purpose: Full-page scroll chapter with unique layout and animation identity
- Examples: `src/components/sections/HeroSection.tsx`, `src/components/sections/ProjectSection.tsx`
- Pattern: Each section owns a `sectionRef`, defines its scroll or in-view hooks, assembles layout using shared components, and exports a default functional component.

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Sets `<html lang>`, loads custom fonts (`MarlinGeoSQ`, `Geist Mono`) via Next.js font system, injects SEO `<Metadata>`, renders JSON-LD structured data, mounts `<Header>`, `{children}`, `<LoadingScreen>`, and `<Footer>`

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: Route `/` (the only route)
- Responsibilities: Composes the full page by rendering `HeroSection`, `IntroduceSection`, `AboutSection`, `ProjectSection` in a `<main>` container

**Loading Screen:**
- Location: `src/components/LoadingScreen.tsx`
- Triggers: Mounts immediately, waits for `window` load event
- Responsibilities: Blocks visual rendering with a white overlay and animated loaders (`ldrs` Reuleaux + Bouncy), then animates out after 2 seconds + 1 second exit transition

## Error Handling

**Strategy:** Minimal — loading-screen has a try/catch that ensures the overlay is always dismissed even if asset loading throws.

**Patterns:**
- `LoadingScreen` wraps asset-load wait in try/catch, sets `isLoaded = true` on error to avoid permanent blocking
- No global error boundary or 404 page — single-page static export has no routing to fail

## Cross-Cutting Concerns

**Logging:** `console.error` in `LoadingScreen` only; no logging framework
**Validation:** None — no forms or user input exist
**Authentication:** None — fully public static site
**SEO:** Centralized in `src/app/layout.tsx` via Next.js `Metadata` export; includes OpenGraph, Twitter card, JSON-LD Person schema, Google Search Console verification, sitemap generated via `next-sitemap` post-build
**Base Path:** Handled uniformly via `BaseImage` and `BaseVideo` reading `NEXT_PUBLIC_BASE_PATH`; `next.config.ts` sets `assetPrefix` and `basePath` for production

---

*Architecture analysis: 2026-03-13*
