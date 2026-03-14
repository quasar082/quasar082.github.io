# Pitfalls Research

**Domain:** Adding GSAP/Lenis animations, preloader, and white minimalist redesign to existing Next.js 16 + R3F portfolio
**Researched:** 2026-03-15
**Confidence:** HIGH (codebase-verified integration analysis; web search unavailable -- based on deep domain knowledge of GSAP, Lenis, R3F, and Next.js App Router)

---

## Critical Pitfalls

### Pitfall 1: GSAP ScrollTrigger Instances Not Killed on Route Change / Component Unmount

**What goes wrong:**
GSAP ScrollTrigger creates global scroll listeners and pin/scrub bindings that attach to the DOM. In React, when components unmount (route change, conditional render, React Strict Mode double-mount in dev), ScrollTrigger instances survive because they are registered globally on `ScrollTrigger.getAll()`. Orphaned triggers fire callbacks on elements that no longer exist, causing "Cannot read properties of null" errors, phantom scroll-locking, and animations targeting stale DOM nodes.

This codebase is especially vulnerable because the page is a single-route SPA (`/[lang]/page.tsx` renders everything), but the v2 redesign will add blog post routes (`/[lang]/blog/[slug]`). Navigating between the main page and a blog post will unmount all GSAP-animated sections without cleanup.

**Why it happens:**
Developers use `useEffect` with GSAP timelines and forget that ScrollTrigger instances are not automatically garbage-collected when the React component unmounts. GSAP operates outside React's lifecycle. Without explicit `scrollTrigger.kill()` or `gsap.context().revert()`, every mount creates new triggers while old ones persist.

**How to avoid:**
Use GSAP's official `useGSAP` hook (from `@gsap/react`) instead of raw `useEffect`. It automatically creates a `gsap.context()` scoped to a ref and calls `context.revert()` on unmount, which kills all GSAP animations and ScrollTrigger instances created within that context.

```tsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function AnimatedSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // All GSAP code here is auto-scoped to containerRef
    // and auto-cleaned on unmount
    gsap.from(".reveal-text", {
      y: 100,
      opacity: 0,
      scrollTrigger: {
        trigger: ".reveal-text",
        start: "top 80%",
      },
    });
  }, { scope: containerRef }); // scope limits selector queries to this container

  return <div ref={containerRef}>...</div>;
}
```

Critical rule: NEVER use raw `useEffect` + `gsap.to()` without a `gsap.context()`. The `useGSAP` hook handles this automatically.

**Warning signs:**
- Console warnings about ScrollTrigger targeting elements that don't exist
- Scroll behavior breaks after navigating to blog and back
- Animations fire on wrong elements after React Strict Mode double-mount in dev
- `ScrollTrigger.getAll().length` grows after each navigation

**Phase to address:**
Animation system setup phase (first phase that introduces GSAP). Establish the `useGSAP` pattern as the only allowed way to create GSAP animations. No raw `useEffect` + GSAP.

---

### Pitfall 2: Lenis Smooth Scroll Breaks ScrollTrigger Scroll Position Calculations

**What goes wrong:**
Lenis intercepts native browser scroll and creates its own virtual scroll position. GSAP ScrollTrigger, by default, reads `window.scrollY` for trigger calculations. When Lenis is active, `window.scrollY` updates asynchronously (Lenis uses `requestAnimationFrame` to lerp the scroll position), so ScrollTrigger reads stale values. This causes triggers to fire at wrong positions, pin calculations to be off by hundreds of pixels, and scrub animations to jitter or skip.

The existing codebase is a static export site -- there is no server-side scroll state. All scroll logic runs client-side, making this mismatch the single most likely cause of "animations feel broken" during development.

**Why it happens:**
Lenis and ScrollTrigger each have their own scroll tracking. Without explicit synchronization, they fight over who controls scroll position reporting. Lenis uses transform-based smooth scrolling by default (translating a wrapper element), but ScrollTrigger reads native scroll position.

**How to avoid:**
Synchronize Lenis with ScrollTrigger using the official integration pattern. Lenis v1.1+ provides a direct ScrollTrigger integration:

```tsx
// In a top-level provider or layout component
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();

    // Connect Lenis scroll position to ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Use GSAP ticker to drive Lenis (replaces Lenis's own RAF loop)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000); // GSAP ticker time is in seconds, Lenis expects ms
    });
    gsap.ticker.lagSmoothing(0); // Prevent GSAP from throttling the RAF

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
}
```

The key insight: drive Lenis from GSAP's ticker (not Lenis's own `requestAnimationFrame`), and pipe Lenis scroll events into `ScrollTrigger.update`. This ensures both systems share the same timing source and scroll position.

**Warning signs:**
- ScrollTrigger animations fire 50-200px too early or too late
- Pin animations jitter when scrolling slowly
- Scrub animations feel "laggy" compared to scroll input
- `ScrollTrigger.refresh()` temporarily fixes positions (confirms sync issue)

**Phase to address:**
Animation system setup phase. The Lenis + ScrollTrigger sync must be the very first thing configured, before any ScrollTrigger-dependent animation is written. Baking this into a `SmoothScrollProvider` that wraps the entire app prevents every downstream animation from inheriting the bug.

---

### Pitfall 3: Preloader Causes Hydration Mismatch in Next.js Static Export

**What goes wrong:**
The intro preloader (black screen -> text sequence -> curtain reveal) requires the page to start in a "hidden" state (content invisible, preloader visible). In Next.js static export, the HTML is pre-rendered at build time with all content visible. When React hydrates, if the component state says "preloader active, content hidden" but the HTML says "content visible", React throws a hydration mismatch warning and may re-render the entire page, causing a visible flash of unstyled content (FOUC) before the preloader kicks in.

This is especially bad for a portfolio: the recruiter sees a flash of the full page, then it goes black for the preloader, then reveals again. It looks like a bug.

**Why it happens:**
Next.js `output: 'export'` generates static HTML at build time. The server render has no concept of "preloader state." The initial HTML will always render with content visible. The preloader state is JavaScript-only, initialized after hydration.

**How to avoid:**
Use CSS to hide content initially, not React state. This avoids the hydration mismatch entirely because both server HTML and client agree on the visual state:

```css
/* In globals.css -- hides main content until preloader completes */
.preloader-active main {
  visibility: hidden; /* not display:none -- preserves layout for ScrollTrigger */
}
```

```tsx
// In the preloader component
function Preloader() {
  useEffect(() => {
    // Run preloader animation sequence
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove("preloader-active");
        ScrollTrigger.refresh(); // Recalculate after layout is visible
      },
    });
    // ... preloader animation keyframes
  }, []);
}
```

```tsx
// In layout.tsx -- add class to html element at build time
<html lang={lang} className="preloader-active">
```

The `preloader-active` class is on the HTML element in both server and client HTML (no mismatch). CSS hides the content. JavaScript removes the class after the preloader animation completes. No React state involved in the visibility toggle.

**Warning signs:**
- Brief flash of page content before preloader appears
- React hydration mismatch warnings in console
- Preloader animation starts from wrong state (half-visible content)
- Content layout shifts after preloader completes (because elements measured before visibility)

**Phase to address:**
Preloader/intro phase. Must be implemented before other animation phases because ScrollTrigger measurements depend on content being visible when `ScrollTrigger.refresh()` runs.

---

### Pitfall 4: GSAP and Framer Motion Fight Over the Same Element's Transform

**What goes wrong:**
The existing codebase uses Framer Motion for ChatPanel (slide-up animation via `motion.div` with `y` transform), MobileMenu (AnimatePresence), and TypingIndicator (scale animation). GSAP also uses CSS `transform` for animations. When both libraries animate the same element or parent/child elements, they overwrite each other's transform values on every frame, causing:
- Elements snapping to wrong positions
- Animations stuttering or freezing mid-way
- Exit animations (AnimatePresence) not playing because GSAP has overwritten the transform

This codebase has a specific risk: the ChatPanel uses `motion.div` with `y: '100%'` for slide-up, and it sits inside the layout alongside GSAP-animated sections. If GSAP animates the layout wrapper's transform (e.g., for page transitions), the ChatPanel's Framer Motion animation will be relative to the wrong transform origin.

**Why it happens:**
Both GSAP and Framer Motion write to `element.style.transform`. CSS transforms are a single property (not composable) -- you cannot have two independent transform values on one element. Whichever library writes last "wins" that frame, overwriting the other's value.

**How to avoid:**
Draw a hard boundary: GSAP owns scroll-triggered and page-level animations; Framer Motion owns component-level mount/unmount animations (AnimatePresence). Never let them touch the same DOM element.

Practical rules for this codebase:
1. **ChatPanel, MobileMenu, TypingIndicator** -- keep Framer Motion. These are mount/unmount animations where AnimatePresence excels.
2. **Text reveals, scroll animations, preloader, page transitions** -- use GSAP exclusively. These are timeline-based and scroll-coupled.
3. **Never wrap a Framer Motion `motion.*` element inside a GSAP-animated parent** that transforms. If GSAP transforms a section, ensure any Framer Motion children within that section are nested inside a non-transformed wrapper div.
4. **ChatBar is in layout.tsx** (outside `<main>`) -- this is correct. The preloader and page transitions should only target `<main>`, never the layout-level chat or header.

```tsx
// layout.tsx structure that respects boundaries
<body>
  <Header />           {/* GSAP: nav animations */}
  <main id="smooth-wrapper"> {/* GSAP: all scroll + page transitions */}
    {children}
  </main>
  <ChatBar />          {/* Framer Motion: AnimatePresence slide-up */}
  <Preloader />        {/* GSAP: timeline sequence */}
</body>
```

**Warning signs:**
- ChatPanel slide-up animation stutters or doesn't play
- Elements "jump" to unexpected positions after animations complete
- AnimatePresence exit animations skip entirely (element just disappears)
- Console warnings from Framer Motion about unexpected transform values

**Phase to address:**
Animation system setup phase. Define the GSAP/Framer Motion boundary in the first commit, before writing any animations. Document which components belong to which system.

---

### Pitfall 5: R3F Canvas Remount Loses WebGL Context When Moving Robot Between Sections

**What goes wrong:**
In v1, the RobotCanvas lives inline in the page. In v2, the robot moves to a dedicated Section 2. If this is implemented by conditionally rendering the `<RobotCanvas>` component in a different DOM location (removing from hero, adding to Section 2), React unmounts the old Canvas and mounts a new one. Each mount creates a new WebGL context, re-downloads and re-parses the GLTF model, and re-initializes the animation mixer. On iOS Safari, this is especially bad: the old context may not be properly released, counting toward the 8-context limit.

More subtly, the existing `useGLTF.preload(MODEL_PATH)` at module scope in RobotModel.tsx caches the model data, but the WebGL-side resources (GPU buffers, compiled shaders) are per-context and must be re-uploaded to the new context.

**Why it happens:**
React's reconciler sees a Canvas in a different parent as a different component instance. R3F's Canvas creates a new Three.js WebGLRenderer on every mount. There is no built-in way to "move" a WebGL context between DOM elements.

**How to avoid:**
Keep the Canvas mounted at layout level and use CSS to position it over the correct section:

```tsx
// layout.tsx -- Canvas is always mounted
<body>
  <Header />
  <main>{children}</main>
  <RobotCanvas className="pointer-events-none fixed inset-0 z-10" />
  <ChatBar />
</body>
```

```tsx
// In the robot component, use scroll position to control visibility/position
useGSAP(() => {
  ScrollTrigger.create({
    trigger: "#robot-section",
    start: "top center",
    end: "bottom center",
    onToggle: (self) => {
      // Show/hide robot canvas, adjust camera position
      robotStore.setVisible(self.isActive);
    },
  });
}, { scope: containerRef });
```

The Canvas is always in the DOM (no unmount/remount). CSS `pointer-events: none` prevents it from blocking scroll. ScrollTrigger controls when it is visible and interactive. The 3D camera can be animated to "move" the robot to appear in the correct section without remounting the Canvas.

Alternative: if the robot must only appear in Section 2, keep the Canvas conditionally rendered BUT in the same DOM position every time (no parent change). Use `opacity-0` and `pointer-events-none` to hide it when not in the robot section, rather than unmounting.

**Warning signs:**
- Robot takes 1-3 seconds to appear after scrolling to Section 2 (re-initialization)
- Brief black/white flash in the Canvas area during remount
- "WebGL context lost" errors in console on iOS after several scroll cycles
- Animation state resets (robot always starts in idle instead of maintaining emotion)

**Phase to address:**
Layout restructuring phase. The Canvas mount strategy must be decided before building Section 2. This is an architectural decision, not a fix-later issue.

---

### Pitfall 6: ScrollTrigger.refresh() Not Called After Preloader Completes, Breaking All Scroll Positions

**What goes wrong:**
ScrollTrigger calculates trigger positions (`start`, `end`) based on element positions at the time `ScrollTrigger.create()` runs. If content is hidden during the preloader (via `visibility: hidden`, `display: none`, or off-screen position), elements have zero or wrong dimensions. Every ScrollTrigger created before the preloader finishes will have incorrect trigger positions. Text reveal animations fire immediately instead of on scroll. Pinned sections are offset by the full viewport height.

This is the most common "everything was working until we added the preloader" bug.

**Why it happens:**
The preloader hides content while GSAP initializes. ScrollTrigger reads `getBoundingClientRect()` on hidden elements and gets `{top: 0, height: 0}`. All triggers think they are at the top of the page.

**How to avoid:**
Two-part strategy:

1. **Use `visibility: hidden` (not `display: none`)** for hidden content during preloader. `visibility: hidden` preserves layout dimensions, so ScrollTrigger can still measure elements correctly.

2. **Call `ScrollTrigger.refresh()` after the preloader animation completes:**
```tsx
const preloaderTimeline = gsap.timeline({
  onComplete: () => {
    // Content is now visible, force ScrollTrigger to recalculate
    ScrollTrigger.refresh();
  },
});
```

3. **Defer ScrollTrigger creation until after preloader** for critical animations. Use a global state flag:
```tsx
const useAppStore = create((set) => ({
  preloaderComplete: false,
  setPreloaderComplete: () => set({ preloaderComplete: true }),
}));

// In animated sections:
const preloaderComplete = useAppStore((s) => s.preloaderComplete);
useGSAP(() => {
  if (!preloaderComplete) return; // Don't create triggers yet
  // ... ScrollTrigger animations
}, { dependencies: [preloaderComplete], scope: containerRef });
```

**Warning signs:**
- All scroll animations play immediately on page load instead of on scroll
- Pinned sections are offset or overlap
- Animations work correctly on page refresh but not on first visit (with preloader)
- `ScrollTrigger.refresh()` fixes everything (confirms this is the issue)

**Phase to address:**
Preloader phase AND animation phase. The preloader must signal completion to the animation system. This is a cross-cutting concern that must be designed upfront, not patched later.

---

### Pitfall 7: Static Export + Lenis Creates Flash of Native Scroll Before Smooth Scroll Initializes

**What goes wrong:**
With `output: 'export'`, the HTML is static. When the page loads, the browser uses native scroll behavior until JavaScript hydrates and Lenis initializes. If the user starts scrolling before Lenis is ready (which is likely on slower connections), they experience native scroll for 200-500ms, then a jarring "snap" as Lenis takes over and applies its smooth interpolation. On a minimalist portfolio where smooth scroll is a key design element, this jank is very noticeable.

Combined with the preloader, this creates a timing nightmare: preloader runs (no scroll possible), preloader completes, Lenis initializes, ScrollTrigger refreshes -- each of these happens asynchronously and the order matters.

**Why it happens:**
Static HTML has no JavaScript influence on scroll behavior. Lenis is a JavaScript-only solution. The gap between HTML render and JS execution is the "uncanny valley."

**How to avoid:**
Lock scroll during the preloader and only enable Lenis after the preloader completes:

```css
/* Prevent scroll until preloader is done */
html.preloader-active {
  overflow: hidden;
}
```

```tsx
// Lenis initialization happens AFTER preloader
function SmoothScrollProvider() {
  const preloaderComplete = useAppStore((s) => s.preloaderComplete);

  useEffect(() => {
    if (!preloaderComplete) return;

    document.documentElement.classList.remove("preloader-active");
    // Now init Lenis
    const lenis = new Lenis({ /* options */ });
    // ... sync with ScrollTrigger
    return () => lenis.destroy();
  }, [preloaderComplete]);
}
```

This way, native scroll never happens (overflow: hidden during preloader), and Lenis takes control from the start of scrollable interaction. The user never experiences the native -> smooth transition.

**Warning signs:**
- Scroll feels different in first 500ms vs. after
- Visible "jump" in scroll position when Lenis initializes
- ScrollTrigger triggers fire during the transition window

**Phase to address:**
Animation system setup phase. The initialization sequence (preloader -> Lenis -> ScrollTrigger.refresh) must be architecturally defined before any animations are written.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `useEffect` + `gsap.to()` instead of `useGSAP` hook | Faster to write, no new dependency | Memory leaks, zombie ScrollTriggers on navigation | Never -- `@gsap/react` is 2KB and prevents the #1 GSAP+React bug |
| Inline ScrollTrigger configs instead of shared constants | Fast prototyping | When sections reorder or new sections added, every trigger offset breaks | Only during initial prototyping; refactor before phase completion |
| Hardcoding preloader duration instead of timeline callbacks | Simple timing | If any animation asset loads slower than the hardcoded time, preloader dismisses too early or too late | Never -- always use `onComplete` callbacks |
| Using `transform: translateY()` for Lenis scroll wrapper | Native-feeling smooth scroll | Breaks `position: fixed` elements (header, chat bar) inside the wrapper | Never for this project -- the chat bar and header are fixed-position |
| Keeping Framer Motion AnimatePresence for sections that GSAP should own | Avoid rewriting working code | Two animation libraries fighting on the same elements | Only for components that GSAP never touches (chat, mobile menu) |
| Separate Lenis and GSAP ticker loops | Each library manages its own RAF | Double RAF overhead, scroll position desync | Never -- always drive Lenis from GSAP's ticker |

## Integration Gotchas

Common mistakes when connecting these specific technologies.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GSAP + Next.js App Router | Registering plugins (`gsap.registerPlugin(ScrollTrigger)`) inside components, causing re-registration | Register plugins once at app entry point (e.g., in a top-level provider or layout-level `useEffect`) |
| Lenis + `position: fixed` elements | Wrapping fixed elements (header, chat bar) inside Lenis scroll container, causing them to scroll instead of stay fixed | Only wrap scrollable content in the Lenis container; fixed elements must be siblings, not children |
| GSAP + Tailwind CSS v4 | Using GSAP to animate Tailwind utility classes (e.g., `gsap.to(el, { className: "opacity-100" })`) -- Tailwind classes are not animatable | Use GSAP to animate CSS properties directly (`gsap.to(el, { opacity: 1 })`). Tailwind for static states, GSAP for animation values |
| R3F Canvas + white background | Canvas defaults to transparent but alpha compositing with a white page background makes 3D objects look washed out | Set Canvas `gl={{ alpha: true }}` and ensure the Canvas container has `background: transparent`. Adjust 3D lighting for white surroundings instead of dark |
| Lenis + mobile touch scroll | Lenis on mobile adds input lag compared to native scroll, making the site feel sluggish | Disable Lenis on mobile/touch devices: `new Lenis({ gestureOrientation: 'vertical', touchMultiplier: 0 })` or check `window.matchMedia('(pointer: coarse)')` to skip Lenis entirely |
| GSAP ScrollTrigger + dynamic content (i18n) | ScrollTrigger positions calculated with English text lengths become wrong when user switches to Vietnamese (different text lengths) | Call `ScrollTrigger.refresh()` after language switch. Connect to `next-intl` locale change event |
| Preloader + `useGLTF.preload()` | Preloader finishes before 3D model is downloaded, user sees empty canvas for seconds | Preloader should wait for BOTH its animation sequence AND the model load (use drei's `useProgress` to track) |

## Performance Traps

Patterns that work in development but fail in production or on target devices.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Too many ScrollTrigger instances (one per animated element) | Scroll feels janky, FPS drops below 30 | Batch animations: one ScrollTrigger per section, use `gsap.utils.toArray()` to animate all children in a single timeline | More than 20-30 active ScrollTriggers on page |
| Lenis smooth scroll on low-end mobile | Touch scroll input lag >100ms, feels unresponsive | Disable Lenis on devices with `(pointer: coarse)` or below a performance threshold | Any mobile device with <4GB RAM |
| GSAP + R3F both running RAF loops | Double requestAnimationFrame overhead, GPU contention | Share a single RAF: use `gsap.ticker.add()` to drive R3F's render loop, or vice versa. R3F's `<Canvas frameloop="demand">` + manual invalidation | Noticeable on mobile, especially during scroll animations + 3D rendering simultaneously |
| Unoptimized text reveal animations (clip-path on large text) | Text reveal animation causes layout thrashing, CLS issues | Use `will-change: transform` on animated elements. Prefer `transform` + `overflow: hidden` over `clip-path` for text reveals | Pages with 10+ text reveal animations |
| Loading GSAP, Lenis, Three.js, Framer Motion all eagerly | Initial JS bundle exceeds 500KB, TTI >3s on 3G | Code-split: GSAP + Lenis load with the main page. Three.js loads on intersection (already done via `ssr: false` dynamic import). Framer Motion loads with chat/menu (already lazy via component code-splitting) | First visit on slow connection |

## UX Pitfalls

Common user experience mistakes in animation-heavy portfolio redesigns.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Preloader too long (>3s) | Recruiters bounce before seeing content. Portfolio preloaders are not like Awwwards showcase sites -- the audience has low patience | Keep preloader under 2 seconds. If 3D model isn't loaded, show page without robot and load it in background |
| Smooth scroll disables browser "find on page" (Ctrl+F) | Users cannot search for keywords on the page | Lenis v1.1+ supports native browser search. Verify this works after integration |
| Text reveal animations block content reading | User scrolls to a section and has to wait 800ms for text to reveal before reading | Keep reveal durations under 400ms. Use `stagger` (50-100ms between elements) not sequential timelines |
| Scroll-jacking (overriding scroll speed/direction) | Feels broken, not premium. Users try to scroll past a section and get stuck | Never use `scrollTrigger: { scrub: true, pin: true }` on content sections. Pins are acceptable only for hero parallax effects |
| Chat bar animation competes with page transition animation | Two things animate simultaneously, feels chaotic | Chat bar should be static (no entrance animation) during page transitions. Use a coordination flag in Zustand |
| White theme makes 3D robot look flat | Robot loses depth and visual impact against white background | Use dramatic directional lighting, subtle shadows, and a very slight off-white or gradient background behind the robot section |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Lenis integration:** Smooth scroll works on desktop -- but verify mobile touch scroll isn't laggy. Test on real iPhone/Android.
- [ ] **ScrollTrigger animations:** Animations play on scroll -- but verify they recalculate correctly after window resize and orientation change. Call `ScrollTrigger.refresh()` on resize.
- [ ] **Preloader sequence:** Preloader plays beautifully -- but verify it doesn't replay on browser back-navigation (use `sessionStorage` flag to skip on revisit).
- [ ] **Text reveals:** Text reveals look great in English -- but verify Vietnamese text (often longer) doesn't overflow or clip incorrectly mid-animation.
- [ ] **GSAP cleanup:** Animations work in production -- but verify no memory leaks by navigating between pages 10+ times in Chrome DevTools Performance monitor.
- [ ] **White theme + Canvas:** Robot renders on white background -- but verify it looks correct on different monitors (white vs warm-white calibration varies). Test on both sRGB and wide-gamut displays.
- [ ] **Chat redesign:** New centered floating chat bar looks perfect -- but verify `useChatStore` persistence still works (messages survive page reload, streaming state resets correctly).
- [ ] **Preloader + 3D model:** Preloader waits for model load -- but verify behavior when model fails to load (network error). Preloader should still complete with a graceful fallback.
- [ ] **i18n + animations:** Language switch works -- but verify `ScrollTrigger.refresh()` is called after locale change (text length differences shift element positions).
- [ ] **Static export:** `npm run build` succeeds -- but verify GSAP does not reference `window` or `document` at import time. Use dynamic import or `typeof window !== 'undefined'` guards.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| ScrollTrigger zombie instances | LOW | Add `ScrollTrigger.killAll()` in route change cleanup. Refactor to `useGSAP` hook. Takes 1-2 hours per component. |
| Lenis + ScrollTrigger desync | MEDIUM | Requires rewriting the initialization sequence. Add the `lenis.on('scroll', ScrollTrigger.update)` sync. ~4 hours to retrofit. |
| Hydration mismatch from preloader | MEDIUM | Refactor from React-state-based visibility to CSS-class-based visibility. ~2-4 hours. |
| GSAP/Framer Motion transform conflict | HIGH | Requires identifying every conflicting element and either migrating to GSAP-only or restructuring the DOM to isolate Framer Motion components. Can take 1-2 days if spread across many components. |
| R3F Canvas remount issues | HIGH | Requires architectural change to Canvas mount strategy. Moving from per-section Canvas to layout-level Canvas affects component structure. ~1 day refactor. |
| ScrollTrigger wrong positions after preloader | LOW | Add `ScrollTrigger.refresh()` call after preloader completes. 15 minutes if the preloader has an `onComplete` callback. |
| Flash of native scroll before Lenis | LOW | Add `overflow: hidden` on `html` during preloader. 30 minutes. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| P1: ScrollTrigger zombie instances | Animation system setup | Navigate to blog and back 5 times. Check `ScrollTrigger.getAll().length` stays constant. |
| P2: Lenis + ScrollTrigger desync | Animation system setup | Scroll slowly through all sections. Verify triggers fire at visually correct positions. No jitter on pinned elements. |
| P3: Preloader hydration mismatch | Preloader implementation | Load page on slow 3G throttle. No flash of content before preloader. No React hydration warnings in console. |
| P4: GSAP/Framer Motion transform conflict | Animation system setup | Open ChatPanel while a GSAP page animation is playing. Both animate correctly without interference. |
| P5: R3F Canvas remount | Layout restructuring | Scroll to robot section, away, and back 10 times. No re-download of .glb model. No WebGL context warnings. Robot maintains emotion state. |
| P6: ScrollTrigger.refresh after preloader | Preloader + animation integration | Full page load with preloader. All scroll animations fire at correct positions on first scroll. |
| P7: Flash of native scroll | Animation system setup | Load page. Scroll is locked during preloader. First scroll after preloader feels smooth (Lenis). |
| Lenis mobile performance | Animation system + responsive testing | Test on real iPhone SE. Scroll should feel native-smooth, not laggy. |
| GSAP static export compatibility | Animation system setup | `npm run build` succeeds. No `window is not defined` errors. |
| i18n + ScrollTrigger refresh | i18n + animation integration | Switch language. Scroll animations still fire at correct positions for new text lengths. |

## Sources

- Existing codebase analysis: `src/components/robot/RobotCanvas.tsx` (dynamic import pattern), `src/components/chat/ChatBar.tsx` (Framer Motion usage), `src/app/[lang]/layout.tsx` (layout structure), `next.config.ts` (`output: 'export'`)
- GSAP official React guide: gsap.com/resources/React/ -- `useGSAP` hook, `gsap.context()` pattern (HIGH confidence)
- GSAP ScrollTrigger documentation: gsap.com/docs/v3/Plugins/ScrollTrigger/ -- trigger lifecycle, refresh(), kill() (HIGH confidence)
- Lenis GitHub repository: github.com/darkroomengineering/lenis -- ScrollTrigger integration pattern (HIGH confidence)
- React Three Fiber documentation: docs.pmnd.rs -- Canvas lifecycle, WebGL context management (HIGH confidence)
- Next.js static export documentation: nextjs.org/docs/app/building-your-application/deploying/static-exports (HIGH confidence)
- Domain experience: GSAP + Framer Motion coexistence patterns, preloader timing sequences, white-theme 3D rendering considerations (MEDIUM confidence -- training data, verified against codebase architecture)

---
*Pitfalls research for: v2.0 redesign -- GSAP/Lenis animation system, preloader, minimalist redesign on existing Next.js 16 + R3F portfolio*
*Researched: 2026-03-15*
