# Architecture Patterns: v2.0 GSAP + Lenis Integration

**Domain:** GSAP/Lenis animation system integration with existing Next.js 16 App Router + React Three Fiber portfolio
**Researched:** 2026-03-15
**Overall Confidence:** MEDIUM-HIGH (GSAP + Lenis patterns well-established; Next.js App Router preloader pattern less documented but architecturally sound; web search returned empty results so findings rely on training data + npm registry verification)

---

## Critical Context: What Already Exists

Before defining new architecture, here is what is already built and must not break:

| Existing System | Location | Key Constraint |
|----------------|----------|----------------|
| Next.js 16 App Router | `src/app/[lang]/layout.tsx` | Static export (`output: 'export'`), `generateStaticParams` for locales |
| React Three Fiber | `src/components/robot/RobotCanvas.tsx` | `dynamic({ ssr: false })` — must remain SSR-safe |
| Zustand stores | `src/stores/useRobotStore.ts`, `useChatStore.ts` | Bridge between DOM and R3F Canvas — do not change this pattern |
| ChatBar | `src/components/chat/ChatBar.tsx` | Mounted in layout, uses Framer Motion `AnimatePresence` |
| Header | `src/components/Header.tsx` | Fixed position, listens to `window.scrollY` |
| Framer Motion | `package.json` | Used for ChatPanel animations — retained for component-level motion |
| Tailwind CSS v4 | `src/app/globals.css` | `@theme inline` design tokens, dark theme currently |

---

## Recommended Architecture

### New Packages Required

| Package | Version | Purpose | Verified |
|---------|---------|---------|----------|
| `gsap` | ^3.14.2 | Core animation engine, ScrollTrigger plugin | npm registry confirmed |
| `@gsap/react` | ^2.1.2 | `useGSAP()` hook — drop-in replacement for `useEffect`/`useLayoutEffect` with automatic cleanup | npm registry confirmed |
| `lenis` | ^1.3.18 | Smooth scroll library with React bindings (`lenis/react`) | npm registry confirmed, exports `lenis/react` entry point |

**No additional packages needed.** Lenis ships its own React component (`ReactLenis` from `lenis/react`). GSAP includes ScrollTrigger as a built-in plugin (not a separate package).

```bash
npm install gsap @gsap/react lenis
```

---

## System Architecture Diagram

```
Browser Viewport
+==============================================================================+
|                                                                              |
|  app/[lang]/layout.tsx (Server Component)                                    |
|    |                                                                         |
|    +-- <SmoothScrollProvider> .............. NEW (Client Component wrapper)   |
|    |     |                                                                   |
|    |     +-- <ReactLenis root>  ........... Lenis instance lives HERE        |
|    |           |                                                             |
|    |           +-- <PreloaderGate> ......... NEW (controls initial reveal)    |
|    |           |     |                                                       |
|    |           |     +-- <Preloader />  .... NEW (overlay with text sequence) |
|    |           |                                                             |
|    |           +-- <Header />  ............. MODIFIED (scroll listener swap)  |
|    |           |                                                             |
|    |           +-- <main>                                                    |
|    |           |     |                                                       |
|    |           |     +-- {children}  ....... Page content (sections)          |
|    |           |                                                             |
|    |           +-- <ChatBar />  ............ EXISTING (no changes needed)     |
|    |                                                                         |
+==============================================================================+

app/[lang]/page.tsx (Client Component)
  |
  +-- <HeroSection />  ...................... NEW (photo + marquee, no robot)
  |
  +-- <RobotSection />  .................... NEW (dedicated Section 2)
  |     |
  |     +-- <RobotCanvas />  ............... EXISTING (dynamic import preserved)
  |           |
  |           +-- <RobotScene />  .......... EXISTING (R3F Canvas, untouched)
  |
  +-- <AboutSection />  .................... NEW
  +-- <ProjectsSection />  ................. NEW
  +-- <BlogSection />  ..................... NEW (preview)
  +-- <Footer />  .......................... NEW
```

---

## Integration Point 1: Lenis Smooth Scroll

### Where Lenis Initializes: Layout Level

Lenis MUST initialize at the layout level, not the page level. Reason: Lenis controls the entire page scroll experience. If it initialized per-page, it would be destroyed and recreated on every navigation, causing scroll position jumps and broken ScrollTrigger instances.

**New file: `src/components/providers/SmoothScrollProvider.tsx`**

```typescript
'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps the entire app in Lenis smooth scroll.
 *
 * CRITICAL: This component must be mounted in the [lang]/layout.tsx,
 * NOT in individual pages. Lenis is a singleton scroll controller.
 *
 * The Lenis-ScrollTrigger integration happens here via the
 * onScroll callback that feeds Lenis's scroll position into
 * GSAP's ScrollTrigger.update().
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        // Do NOT set infinite: true — breaks ScrollTrigger
      }}
    >
      <ScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}

/**
 * Bridges Lenis scroll events to GSAP ScrollTrigger.
 *
 * Without this, ScrollTrigger uses native scroll events which
 * are out of sync with Lenis's interpolated scroll position.
 * This causes animations to jitter or fire at wrong positions.
 */
function ScrollTriggerBridge() {
  useLenis((data) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    // Tell ScrollTrigger to use Lenis's scroll position
    ScrollTrigger.defaults({
      // ScrollTrigger uses window scroll by default
      // Lenis intercepts and smooths it — no scroller proxy needed
      // because Lenis still uses native scroll position (not transform)
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return null;
}
```

### Why `root` Prop on ReactLenis

The `root` prop tells Lenis to control the `<html>` element's scroll rather than creating a wrapper div with `overflow: scroll`. This is critical because:

1. **ScrollTrigger compatibility**: ScrollTrigger works with `window` scroll by default. With `root`, Lenis still uses native `window.scrollTo` under the hood, so ScrollTrigger's scroll position detection works correctly.
2. **No scrollerProxy needed**: Older Lenis/GSAP tutorials required `ScrollTrigger.scrollerProxy()`. With `root` mode, this is unnecessary because Lenis modifies the actual scroll position, not a CSS transform.
3. **Fixed-position elements work**: ChatBar and Header use `position: fixed`. With root-level scroll, fixed positioning works normally. A non-root wrapper div scroll would break fixed elements inside the scroll container.

**Confidence: MEDIUM** — The `root` prop and ScrollTrigger bridge pattern is well-documented in Lenis's GitHub README and GSAP community. However, I could not verify against the current Lenis 1.3.18 docs via web search (search returned empty). Validate this during implementation.

### Layout Integration

**Modified: `src/app/[lang]/layout.tsx`**

```typescript
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

export default async function LocaleLayout({ children, params }) {
  // ... existing locale setup ...

  return (
    <html lang={lang}>
      <body className={`${marlinGeo.variable} ${saprona.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={lang} messages={messages}>
          <SmoothScrollProvider>
            <PreloaderGate>
              <Header />
              <main>{children}</main>
              <ChatBar />
            </PreloaderGate>
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Header Scroll Listener Change

The existing Header uses `window.addEventListener('scroll', ...)`. With Lenis, this still works because Lenis in `root` mode uses native scroll. However, for smoother coordination, the Header should use `useLenis` instead:

```typescript
// BEFORE (still works, but slightly less smooth):
useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 20);
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// AFTER (synchronized with Lenis interpolation):
useLenis(({ scroll }) => {
  setScrolled(scroll > 20);
});
```

**Impact: MINIMAL** — This is a quality improvement, not a requirement. The existing pattern will not break.

---

## Integration Point 2: GSAP ScrollTrigger

### Plugin Registration

GSAP plugins must be registered once, globally, before any ScrollTrigger is created. This happens in `SmoothScrollProvider.tsx` (shown above) at the module level:

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

### The `useGSAP` Hook Pattern

Every component that uses GSAP animations MUST use `useGSAP` from `@gsap/react` instead of `useEffect` or `useLayoutEffect`. This is non-negotiable because:

1. **Automatic cleanup**: `useGSAP` kills all GSAP tweens and ScrollTriggers created inside it when the component unmounts. Without this, you leak animations that reference stale DOM nodes.
2. **Scope containment**: The `scope` parameter limits GSAP selectors to the component's container, preventing accidental animation of elements in other components.
3. **React 18+ StrictMode safe**: `useGSAP` handles the double-mount in React StrictMode correctly.

**Pattern for scroll-triggered section animations:**

```typescript
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // All selectors scoped to containerRef
    gsap.from('.about-heading', {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }, { scope: containerRef }); // Scope limits querySelector to this container

  return (
    <section ref={containerRef}>
      <h2 className="about-heading">...</h2>
    </section>
  );
}
```

### ScrollTrigger + Lenis Cooperation Summary

| Concern | Solution |
|---------|----------|
| Scroll position sync | `useLenis(() => ScrollTrigger.update())` in bridge component |
| ScrollerProxy needed? | NO — Lenis `root` mode uses native scroll position |
| ScrollTrigger.refresh timing | Call `ScrollTrigger.refresh()` after layout changes (e.g., after preloader exits, after dynamic content loads) |
| Pin behavior | Works normally with `root` mode Lenis — pinned elements use `position: fixed` internally |
| Horizontal scroll | Not planned for v2, but would work with `pin: true` + `scrub` |

**Confidence: MEDIUM** — The Lenis `root` mode + ScrollTrigger integration without scrollerProxy is the modern pattern (Lenis v1.x). Older tutorials for Lenis v0.x used scrollerProxy which is no longer needed. Verify this specific behavior works correctly during implementation by testing a simple ScrollTrigger pin.

---

## Integration Point 3: Preloader Sequence in App Router

### The Challenge

App Router does NOT have `_app.tsx` or `getInitialProps` like Pages Router. There is no single client-side entry point to gate rendering. The preloader must work within the App Router component tree.

### Solution: PreloaderGate Component

The preloader is a client component that:
1. Renders a full-screen overlay on mount
2. Runs the text sequence animation (GSAP timeline)
3. Plays the curtain reveal transition
4. Unmounts the overlay and enables scroll

**New file: `src/components/preloader/PreloaderGate.tsx`**

```typescript
'use client';

import { useState, useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

/**
 * Gates the entire page behind a preloader overlay.
 *
 * Architecture:
 * - Children are rendered immediately (for SEO / static export)
 * - But hidden behind the overlay via z-index + overflow: hidden on body
 * - Preloader runs its timeline, then removes itself
 * - On completion, body overflow is restored and scroll is enabled
 *
 * This is an App Router pattern: the preloader is a client component
 * in the layout tree, not a page-level wrapper.
 */
export function PreloaderGate({ children }: { children: React.ReactNode }) {
  const [isComplete, setIsComplete] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
    // Re-enable scroll
    document.body.style.overflow = '';
    // Refresh ScrollTrigger after layout shift
    // (delayed to allow DOM to settle)
    setTimeout(() => {
      const { ScrollTrigger } = require('gsap/ScrollTrigger');
      ScrollTrigger.refresh();
    }, 100);
  }, []);

  useGSAP(() => {
    // Disable scroll during preloader
    document.body.style.overflow = 'hidden';
  }, []);

  return (
    <>
      {!isComplete && (
        <Preloader ref={overlayRef} onComplete={handleComplete} />
      )}
      {children}
    </>
  );
}
```

**New file: `src/components/preloader/Preloader.tsx`**

```typescript
'use client';

import { forwardRef, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

/**
 * The actual preloader overlay with animated text sequence.
 *
 * Sequence:
 * 1. Black screen
 * 2. "Welcome to the party" text fades in
 * 3. Text morphs/transitions to "Quasar"
 * 4. Curtain splits open (two halves slide up/down or left/right)
 * 5. onComplete called — overlay unmounts
 *
 * All animation is GSAP timeline — no Framer Motion here.
 * This is a one-shot animation, not interactive.
 */
export const Preloader = forwardRef<HTMLDivElement, PreloaderProps>(
  function Preloader({ onComplete }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
      const tl = gsap.timeline({
        onComplete,
        defaults: { ease: 'power3.inOut' },
      });

      tl.from('.preloader-text-1', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
      })
      .to('.preloader-text-1', {
        opacity: 0,
        duration: 0.4,
        delay: 0.6,
      })
      .from('.preloader-text-2', {
        y: 40,
        opacity: 0,
        duration: 0.8,
      })
      .to('.preloader-text-2', {
        opacity: 0,
        duration: 0.4,
        delay: 0.4,
      })
      // Curtain reveal: two halves split
      .to('.preloader-curtain-top', {
        yPercent: -100,
        duration: 1,
        ease: 'power4.inOut',
      })
      .to('.preloader-curtain-bottom', {
        yPercent: 100,
        duration: 1,
        ease: 'power4.inOut',
      }, '<'); // '<' = same start time as previous tween

    }, { scope: containerRef });

    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Text layer */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <h2 className="preloader-text-1 absolute font-display text-4xl text-white">
            Welcome to the party
          </h2>
          <h2 className="preloader-text-2 absolute font-display text-6xl font-medium text-white opacity-0">
            Quasar
          </h2>
        </div>

        {/* Curtain halves */}
        <div className="preloader-curtain-top absolute top-0 left-0 right-0 h-1/2 bg-black" />
        <div className="preloader-curtain-bottom absolute bottom-0 left-0 right-0 h-1/2 bg-black" />
      </div>
    );
  }
);
```

### Why This Works in App Router

1. **Children render immediately**: The page content (`{children}`) is rendered in the DOM from the first frame. This is important for static export SEO — the content exists in the HTML.
2. **Overlay hides content visually**: The preloader sits at `z-index: 100` above everything. Content is there but not visible.
3. **Body overflow hidden**: Prevents scroll during the preloader sequence. Lenis cannot scroll a locked body.
4. **ScrollTrigger.refresh() after completion**: Critical. ScrollTrigger calculates element positions on initialization. If the preloader changes the layout (e.g., by unmounting), positions are wrong. Calling `refresh()` recalculates.

### Preloader + Session Handling

The preloader should only play on the first visit, not on every page navigation. Two approaches:

**Option A (Recommended): Session storage flag**
```typescript
// In PreloaderGate
const hasPlayed = sessionStorage.getItem('preloader-played');
if (hasPlayed) {
  // Skip preloader, render children immediately
  return <>{children}</>;
}
// After preloader completes:
sessionStorage.setItem('preloader-played', 'true');
```

**Option B: Zustand store** (if you want more control)
Create a `useUIStore` with `preloaderComplete` state. Components can check this to defer their entrance animations until after the preloader.

**Recommendation:** Option A for simplicity. The preloader is a one-shot UX flourish, not application state.

---

## Integration Point 4: Page Transitions with App Router

### The Challenge

Next.js App Router uses React Server Components and streaming. There is no built-in page transition API. `next/router` events (`routeChangeStart`, `routeChangeComplete`) do not exist in App Router.

### Solution: GSAP-Powered Exit/Enter Transitions via Layout

For a static export portfolio with client-side navigation, page transitions work by:

1. Intercepting navigation (link click)
2. Playing an exit animation on the current page content
3. Navigating to the new route
4. Playing an enter animation on the new page content

**Approach: TransitionLink component + page animation wrapper**

```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useRef, useCallback } from 'react';

/**
 * A link component that plays a GSAP exit animation before navigating.
 *
 * Usage:
 *   <TransitionLink href="/en/blog">Blog</TransitionLink>
 *
 * The exit animation targets a shared transition overlay element
 * (mounted in the layout) that slides in, covers the page,
 * then the navigation happens, then the overlay slides out.
 */
export function TransitionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    // Play exit animation
    const overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
      router.push(href);
      return;
    }

    gsap.timeline()
      .to(overlay, {
        scaleY: 1,
        transformOrigin: 'bottom',
        duration: 0.5,
        ease: 'power4.inOut',
      })
      .call(() => {
        router.push(href);
      })
      .to(overlay, {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 0.5,
        ease: 'power4.inOut',
        delay: 0.3, // Allow new page to render
      });
  }, [href, router]);

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
```

**Transition overlay element in layout:**

```html
<!-- Inside SmoothScrollProvider or layout -->
<div
  className="page-transition-overlay fixed inset-0 z-[90] bg-black pointer-events-none"
  style={{ transform: 'scaleY(0)' }}
/>
```

### Limitations and Tradeoffs

| Concern | Assessment |
|---------|-----------|
| SEO impact | None — the overlay is purely visual, content is in the DOM |
| Static export compatibility | Works — client-side navigation with `router.push` |
| Timing reliability | The `delay: 0.3` for new page render is a heuristic. May need adjustment. Consider using `requestAnimationFrame` or `MutationObserver` for more reliable detection |
| R3F Canvas during transition | The R3F Canvas persists if the robot section is on both pages. If navigating to a page without the robot, the Canvas unmounts normally |

### When NOT to Use Page Transitions

For this portfolio with static export, page transitions are primarily between:
- Home page sections (smooth scroll, not navigation)
- Home -> Blog index
- Home -> Project detail
- Blog index -> Blog post

The main homepage is a single-page scroll experience. Most "navigation" is actually scrolling within the same page. Full page transitions are only needed for actual route changes (blog posts, project pages).

**Recommendation:** Implement page transitions as a stretch goal. Focus first on scroll-triggered section animations which provide 90% of the perceived animation quality.

---

## Integration Point 5: Robot Section Restructure

### Current State

The robot is rendered directly in `page.tsx`:

```tsx
// Current: src/app/[lang]/page.tsx
<section>
  <RobotCanvas /> {/* <-- In hero area */}
</section>
```

### Target State

The robot moves to a dedicated Section 2, below the hero. The hero becomes a photo + typography section.

```tsx
// Target: src/app/[lang]/page.tsx
<HeroSection />        {/* Photo + marquee name + role text */}
<RobotSection />       {/* Dedicated 3D robot showcase */}
<AboutSection />       {/* Storytelling */}
<ProjectsSection />    {/* Card grid */}
<BlogSection />        {/* Recent posts */}
<Footer />
```

### RobotSection Component

**New file: `src/components/sections/RobotSection.tsx`**

```typescript
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RobotCanvas } from '@/components/robot/RobotCanvas';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 2: Dedicated 3D robot showcase.
 *
 * The robot enters view as the user scrolls past the hero.
 * GSAP ScrollTrigger controls entrance animation (fade + scale).
 *
 * CRITICAL: RobotCanvas uses dynamic(() => import('./RobotScene'), { ssr: false }).
 * This is preserved. No changes to the R3F import strategy.
 * The GSAP animation targets the WRAPPER div, not the Canvas itself.
 */
export function RobotSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from('.robot-container', {
      opacity: 0,
      scale: 0.9,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative min-h-dvh">
      <div className="robot-container mx-auto max-w-[1200px] px-4 sm:px-6">
        <RobotCanvas />
      </div>
    </section>
  );
}
```

### What Does NOT Change in the R3F Stack

| Component | Change? | Reason |
|-----------|---------|--------|
| `RobotCanvas.tsx` | NO | Dynamic import boundary stays identical |
| `RobotScene.tsx` | NO | R3F Canvas, lights, camera unchanged |
| `RobotModel.tsx` | NO | GLTF loader, emotion crossfade unchanged |
| `useRobotStore.ts` | NO | Zustand store unchanged |
| `useChatStore.ts` | NO | Chat state unchanged |
| `ChatBar.tsx` | NO | Stays in layout, position fixed at bottom |

The only change is WHERE `<RobotCanvas />` is mounted in the page tree — from the hero section to a dedicated `RobotSection` component. The entire R3F subsystem is encapsulated; it does not care where its parent div lives.

### GSAP + R3F Coexistence Rules

1. **Never animate the `<Canvas>` element directly with GSAP.** GSAP manipulates DOM elements. The R3F Canvas is a WebGL context. Animate the wrapper div around the Canvas instead.
2. **Use Zustand, not GSAP, for R3F state changes.** If you want the robot to react to scroll position, pipe scroll data through Zustand: `useLenis(({ scroll }) => useRobotStore.getState().setScrollProgress(scroll))`.
3. **R3F's `useFrame` and GSAP's ticker are independent.** They run on separate animation loops. Do not try to synchronize them. Let each manage its own domain (R3F = 3D rendering, GSAP = DOM animation).

---

## Integration Point 6: Scroll-Triggered Text Reveal Animations

### Pattern: Reusable AnimatedText Component

For the Dennis Snellenberg-style text reveals (words/lines animate in on scroll), create a reusable component:

```typescript
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  /** Split by 'words' or 'lines' */
  splitBy?: 'words' | 'lines';
  /** Stagger delay between each word/line */
  stagger?: number;
}

/**
 * Text that reveals word-by-word or line-by-line on scroll.
 *
 * Implementation note: We split text into spans manually rather than
 * using GSAP SplitText plugin (which requires GSAP Club membership).
 * This manual approach is sufficient for the word-level reveals
 * used in Dennis Snellenberg-style portfolios.
 */
export function TextReveal({
  children,
  as: Tag = 'p',
  className,
  splitBy = 'words',
  stagger = 0.05,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const words = children.split(' ');

  useGSAP(() => {
    gsap.from(ref.current!.querySelectorAll('.word'), {
      y: '100%',
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }, { scope: ref });

  return (
    <Tag ref={ref as any} className={className} style={{ overflow: 'hidden' }}>
      {words.map((word, i) => (
        <span key={i} className="word inline-block">
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Tag>
  );
}
```

### Pattern: Section Entrance Animation

```typescript
/**
 * Reusable wrapper for scroll-triggered entrance animations.
 * Wrap any section content to get a fade-up-on-scroll effect.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(ref.current!, {
      y: 40,
      opacity: 0,
      duration: 1,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

---

## Integration Point 7: Marquee Name Animation (Hero)

The Dennis Snellenberg-style oversized name marquee in the hero. This is a GSAP-powered infinite horizontal scroll:

```typescript
useGSAP(() => {
  // Infinite horizontal marquee
  const marquee = gsap.to('.marquee-inner', {
    xPercent: -50, // Move by half (since content is duplicated)
    repeat: -1,
    duration: 20,
    ease: 'none', // Linear for smooth marquee
  });

  // Optional: speed up on scroll
  ScrollTrigger.create({
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      marquee.timeScale(1 + self.getVelocity() / 500);
    },
  });
}, { scope: heroRef });
```

---

## Component Inventory: New vs Modified vs Unchanged

### New Components

| Component | Purpose | Dependencies |
|-----------|---------|-------------|
| `SmoothScrollProvider` | Lenis + GSAP ScrollTrigger bridge | `lenis/react`, `gsap`, `@gsap/react` |
| `PreloaderGate` | Controls preloader display logic | `gsap`, `@gsap/react` |
| `Preloader` | Animated overlay with text sequence | `gsap`, `@gsap/react` |
| `TransitionLink` | Page transition wrapper for navigation | `gsap`, `next/navigation` |
| `HeroSection` | Photo + marquee name + role text | `gsap`, `@gsap/react` |
| `RobotSection` | Dedicated Section 2 for 3D robot | `RobotCanvas`, `gsap`, `@gsap/react` |
| `TextReveal` | Reusable scroll-triggered text animation | `gsap`, `@gsap/react` |
| `ScrollReveal` | Reusable scroll-triggered entrance wrapper | `gsap`, `@gsap/react` |
| `AboutSection` | Storytelling section | `gsap`, `@gsap/react`, i18n |
| `ProjectsSection` | Project card grid | `gsap`, `@gsap/react`, i18n |
| `Footer` | Social links footer | i18n |

### Modified Components

| Component | What Changes | Why |
|-----------|-------------|-----|
| `app/[lang]/layout.tsx` | Wrap children in `SmoothScrollProvider` + `PreloaderGate` | Lenis must init at layout level |
| `app/[lang]/page.tsx` | Restructure sections: Hero -> Robot -> About -> Projects -> Blog -> Footer | v2 section ordering |
| `Header.tsx` | Replace `window.scroll` listener with `useLenis` | Smoother scroll-aware behavior |
| `globals.css` | Replace dark theme tokens with white minimalist tokens | v2 visual redesign |

### Unchanged Components

| Component | Why Unchanged |
|-----------|--------------|
| `RobotCanvas.tsx` | Dynamic import boundary is preserved exactly |
| `RobotScene.tsx` | R3F scene graph has no DOM animation involvement |
| `RobotModel.tsx` | GLTF + emotion animation logic is independent |
| `RobotLoadingIndicator.tsx` | Loading state display within R3F |
| `useRobotStore.ts` | Zustand store is animation-framework agnostic |
| `useChatStore.ts` | Chat state has no scroll/animation dependency |
| `ChatBar.tsx` | Fixed-position chat works with Lenis root mode |
| `ChatPanel.tsx` | Framer Motion animations inside chat are retained |
| `ChatBubble.tsx` | Pure UI component |
| `ChatInput.tsx` | Pure UI component |
| `PromptChips.tsx` | Pure UI component |
| `TypingIndicator.tsx` | Pure UI component |
| `services/chat.ts` | Business logic, no DOM involvement |

---

## Data Flow Changes

### New: Scroll Progress to Robot (Optional Enhancement)

```
User scrolls
    |
    v
Lenis onScroll callback (in SmoothScrollProvider)
    |
    v
useLenis(({ scroll, limit }) => {
  useRobotStore.getState().setScrollProgress(scroll / limit);
})
    |
    v
RobotModel reads scrollProgress from Zustand
    |
    v
Robot idle animation speed varies with scroll progress
```

This is an OPTIONAL enhancement. The robot can simply play emotion-based animations as it does today. Adding scroll reactivity is a stretch goal.

### New: Preloader -> ScrollTrigger Refresh Flow

```
Page mounts
    |
    v
PreloaderGate disables body scroll
    |
    v
Preloader timeline plays (GSAP)
    |
    v
Preloader completes -> onComplete callback
    |
    v
body.style.overflow = ''  (re-enable scroll)
sessionStorage.set('preloader-played', 'true')
    |
    v
ScrollTrigger.refresh()  (recalculate trigger positions)
    |
    v
Lenis starts receiving scroll events
    |
    v
ScrollTrigger animations activate as user scrolls
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Initializing Lenis Per-Page Instead of Layout

**What goes wrong:** Each page creates its own Lenis instance. Navigating between pages destroys and recreates Lenis, causing scroll position reset, ScrollTrigger position miscalculation, and visible jank.

**Why:** Lenis is a singleton scroll controller. Multiple instances fight for control of `window.scrollTo`.

**Instead:** Mount `ReactLenis root` once in `[lang]/layout.tsx` via `SmoothScrollProvider`.

### Anti-Pattern 2: Using `useEffect` Instead of `useGSAP` for Animations

**What goes wrong:** GSAP tweens and ScrollTrigger instances created in `useEffect` are not cleaned up when the component unmounts. This causes:
- Memory leaks (orphaned ScrollTrigger instances)
- Animations targeting removed DOM elements (console errors)
- Stale callbacks executing after unmount

**Instead:** Always use `useGSAP` from `@gsap/react`. It handles cleanup automatically.

### Anti-Pattern 3: Animating the R3F Canvas Element with GSAP

**What goes wrong:** You try `gsap.to(canvasElement, { opacity: 0 })`. The canvas flickers, the WebGL context may be lost, or the animation looks wrong because the canvas is a GPU-rendered surface.

**Instead:** Animate the wrapper `<div>` around `<RobotCanvas>`, not the canvas itself. For 3D-specific animations (camera zoom, model rotation), use R3F's `useFrame` or Zustand state, not GSAP.

### Anti-Pattern 4: Using ScrollTrigger Pins with Lenis Non-Root Mode

**What goes wrong:** If Lenis runs in non-root mode (wrapping a scroll container instead of `<html>`), ScrollTrigger's `pin: true` breaks because the pinned element's position is calculated relative to the window, not the scroll container.

**Instead:** Always use Lenis in `root` mode for this project. The `root` prop ensures native window scroll is used.

### Anti-Pattern 5: Calling ScrollTrigger.refresh() Synchronously After Preloader

**What goes wrong:** The preloader unmounts, you immediately call `ScrollTrigger.refresh()`, but React hasn't committed the DOM changes yet. ScrollTrigger reads stale positions.

**Instead:** Use `setTimeout(() => ScrollTrigger.refresh(), 100)` or `requestAnimationFrame(() => ScrollTrigger.refresh())` to allow the DOM to settle first.

### Anti-Pattern 6: Preloader Blocking Static HTML Content

**What goes wrong:** You conditionally render `{isPreloaderComplete && children}`, which means the page content is not in the initial HTML. This breaks SEO for static export because crawlers see an empty page.

**Instead:** Always render children. Use the preloader as a visual overlay (`z-index + position: fixed`), not a conditional render gate. The HTML content exists for crawlers; the overlay is a JS-only visual effect.

---

## GSAP vs Framer Motion: Division of Responsibility

Both animation libraries coexist. Here is the clear boundary:

| Domain | Library | Rationale |
|--------|---------|-----------|
| Scroll-triggered section reveals | GSAP ScrollTrigger | ScrollTrigger is purpose-built for scroll-driven animation. Framer Motion's `whileInView` is simpler but less controllable. |
| Page-level transitions | GSAP Timeline | Timeline sequencing with precise easing control |
| Preloader sequence | GSAP Timeline | Complex multi-step sequence with curtain effect |
| Marquee / horizontal scroll | GSAP | Infinite repeat with velocity-based speed adjustment |
| Text reveal animations | GSAP | Word-by-word stagger with ScrollTrigger |
| Chat panel open/close | Framer Motion | `AnimatePresence` already works perfectly for mount/unmount |
| Mobile menu animation | Framer Motion | Component-level mount/unmount animation |
| Button hover states | CSS / Tailwind | No JS animation needed |
| 3D robot animations | R3F / Three.js | AnimationMixer within WebGL context |

**Rule of thumb:** If it involves scroll position or complex sequencing, use GSAP. If it involves React component mount/unmount transitions, use Framer Motion. If it is a 3D animation, use R3F/Three.js.

---

## Suggested Build Order

Given existing R3F/chatbot infrastructure, build in this order:

### Step 1: Animation Infrastructure (must be first)

1. Install `gsap`, `@gsap/react`, `lenis`
2. Create `SmoothScrollProvider` with Lenis + ScrollTrigger bridge
3. Modify `[lang]/layout.tsx` to wrap in `SmoothScrollProvider`
4. Verify Lenis smooth scroll works with existing page
5. Verify Header scroll detection still works (then optionally swap to `useLenis`)
6. Verify ChatBar fixed positioning works with Lenis
7. Verify R3F Canvas renders correctly inside Lenis scroll context

**Why first:** Every subsequent component depends on GSAP and Lenis being available.

### Step 2: Theme Overhaul (visual foundation)

1. Replace dark theme CSS tokens in `globals.css` with white minimalist tokens
2. Update all color references (surface, text, accent, border)
3. Verify all existing components render correctly with new theme

**Why second:** All new section components need to be built against the final visual system.

### Step 3: Preloader

1. Create `PreloaderGate` and `Preloader` components
2. Integrate into layout
3. Verify scroll lock during preloader
4. Verify ScrollTrigger.refresh() after preloader exit
5. Add sessionStorage skip for return visits

**Why third:** The preloader gates the entire experience. Building it early catches any Lenis/GSAP initialization timing issues.

### Step 4: Hero Section (new)

1. Create `HeroSection` with photo, oversized marquee name, role text
2. Implement marquee animation with GSAP
3. Implement entrance animations with GSAP
4. Remove robot from hero area

**Why fourth:** The hero is the first thing users see after the preloader. It establishes the visual language.

### Step 5: Robot Section (restructure)

1. Create `RobotSection` component
2. Move `<RobotCanvas />` from `page.tsx` hero area to `RobotSection`
3. Add GSAP scroll-triggered entrance animation on the wrapper div
4. Verify R3F dynamic import still works (this is the critical test)
5. Verify chat -> robot emotion flow still works

**Why fifth:** The robot is already built. This is a relocation, not a rebuild. Verifying R3F + GSAP coexistence is the main risk here.

### Step 6: Content Sections + Animations

1. Build `AboutSection`, `ProjectsSection`, `BlogSection` (preview), `Footer`
2. Apply `TextReveal` and `ScrollReveal` animation patterns
3. Wire up i18n translations

**Why sixth:** These sections are the bulk of content work. They depend on all infrastructure being solid.

### Step 7: Page Transitions (stretch goal)

1. Create `TransitionLink` component
2. Add transition overlay to layout
3. Wire up navigation between home/blog/projects
4. Test with static export

**Why last:** Page transitions are polish. The site works without them.

---

## Scalability Considerations

| Concern | At Current Scale (1 page) | At Full Site (10+ pages) | Mitigation |
|---------|--------------------------|-------------------------|------------|
| ScrollTrigger count | 5-10 instances | 30-50 instances | GSAP handles hundreds. No concern. |
| Lenis + heavy 3D on same page | Robot is lazy-loaded, 1 Canvas | Same | Lenis smooth scroll is lightweight (~33KB). No conflict with R3F. |
| GSAP bundle size | ~60KB gzip | Same | GSAP tree-shakes unused plugins. Only import ScrollTrigger, not all plugins. |
| Preloader on slow devices | ~3s animation | Same | Add a skip button after 2s. Add `prefers-reduced-motion` media query to skip animations entirely. |
| Lenis on mobile | Smooth scroll on mobile can feel unnatural | Same | Consider disabling Lenis on mobile (`smoothWheel: true` only affects wheel events, touch is native by default in Lenis). |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Lenis root mode + ScrollTrigger cooperation | MEDIUM | Training data + npm registry structure verified. Lenis 1.3.x `root` mode avoids need for scrollerProxy. Could not verify with live docs (web search empty). Validate during implementation. |
| `useGSAP` hook pattern | HIGH | npm registry confirms `@gsap/react` 2.1.2. This is GSAP's official React integration. Well-established pattern. |
| Preloader in App Router | MEDIUM | The PreloaderGate pattern is architecturally sound (overlay + body lock + ScrollTrigger refresh). This is not a documented Next.js pattern but follows React principles. The key risk is ScrollTrigger refresh timing. |
| R3F + GSAP coexistence | HIGH | GSAP animates DOM elements, R3F renders WebGL. They operate in completely separate domains. The only interaction is through Zustand stores. No conflict possible if the "never animate Canvas directly" rule is followed. |
| Page transitions in App Router | MEDIUM-LOW | The TransitionLink approach works but is brittle. Timing the new page render is heuristic-based. Consider this a stretch goal. |
| ChatBar compatibility with Lenis | HIGH | ChatBar uses `position: fixed`. Lenis `root` mode uses native window scroll. Fixed positioning works normally. Zero risk. |

---

## Sources

- GSAP official package: npm registry `gsap@3.14.2` (verified 2026-03-15)
- `@gsap/react` official package: npm registry `@gsap/react@2.1.2` — `useGSAP()` hook (verified 2026-03-15)
- Lenis official package: npm registry `lenis@1.3.18` — exports `lenis/react` with `ReactLenis` component (verified 2026-03-15)
- GSAP React integration guide: https://gsap.com/resources/React/ (training data, MEDIUM confidence)
- Lenis documentation: https://lenis.darkroom.engineering/ (training data, MEDIUM confidence)
- GSAP ScrollTrigger docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (training data, HIGH confidence for core API)
- Existing codebase analysis: all `src/` files read directly (2026-03-15)

---

*Architecture research for v2.0 GSAP + Lenis integration: 2026-03-15*
