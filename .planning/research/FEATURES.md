# Feature Landscape

**Domain:** Minimalist portfolio redesign (v2.0) -- white aesthetic, GSAP/Lenis animation system, Dennis Snellenberg-inspired design
**Researched:** 2026-03-15
**Project:** RayQuasar / QuanMofii Portfolio v2.0

---

## Table Stakes

Features that award-winning minimalist portfolios universally implement. Missing any one of these makes the redesign feel like a template, not a crafted experience. These are what visitors to sites like dennissnellenberg.com, judithlechner.com, or samuelkraft.com expect.

| Feature | Why Expected | Complexity | Dependencies on Existing Infra | Notes |
|---------|--------------|------------|-------------------------------|-------|
| **Smooth scroll (Lenis)** | Buttery scroll is the hallmark of premium portfolios. Without it, GSAP ScrollTrigger animations feel jerky. Every Awwwards-tier portfolio uses Lenis or equivalent. | Low | None -- wraps native scroll. Must coordinate with R3F Canvas (disable Lenis on Canvas pointer events). | Lenis 1.3.x, MIT license, built-in React wrapper `<ReactLenis>`. |
| **Scroll-triggered text reveals** | Text that clips/fades/slides in on scroll is the single most common animation pattern in minimalist portfolios. Static text on a white background feels like a Word doc. | Med | Requires GSAP + ScrollTrigger. Must NOT apply inside R3F Canvas -- DOM only. | Use `clip-path: inset()` or `overflow: hidden` with child translateY. Line-by-line split for headings. |
| **Full-viewport hero section** | Dennis Snellenberg pattern: hero takes 100vh, centers the identity (photo + name + role). Scroll indicator at bottom. This is the universal entry point for minimalist portfolios. | Med | Photo (placeholder OK). Oversized typography needs custom font sizing system. Must integrate with Lenis scroll indicator. | `h-screen` or `100dvh`. Photo centered, text overlaid or adjacent. |
| **Oversized display typography** | Massive sans-serif headings (120px-200px+ on desktop, fluid down to mobile) signal design confidence. Dennis Snellenberg uses ~15vw for the name. This is non-negotiable for the aesthetic. | Low-Med | Tailwind `clamp()` fluid sizing or CSS custom properties. Existing `marlinGeo`/`saprona` fonts may need evaluation for display use. | Use `clamp(48px, 12vw, 200px)` pattern. Weight contrast (thin body, bold display). |
| **Minimal navigation** | 3-5 nav items max, no dropdowns, no mega-menus. Often just text links. Possibly hidden behind a hamburger that reveals a full-screen overlay. Dennis Snellenberg uses a simple top-right nav. | Low | Existing Header component needs full redesign -- current dark lab nav is incompatible with white minimalist. Language switcher preserved. | Nav on white bg, dark text, no visible borders. Possible: magnetic hover effect on links. |
| **White/neutral background** | The defining visual characteristic. Pure white (#FFFFFF) or warm white (#FAFAFA-#F5F0EB). All content sections share this. Dark accents come from typography and media only. | Low | Major CSS variable overhaul -- all existing dark theme tokens (`bg-surface-elevated`, `border-border`, etc.) must flip to light values. ChatBar and ChatPanel need complete restyling. | Consider warm white (#F5F0EB) over pure white -- less clinical, more Dennis Snellenberg. |
| **Generous whitespace** | Large padding/margins between sections (150-300px). Content doesn't crowd. White space IS the design element. | Low | Section components need spacing redesign. Current sections likely have tighter spacing from dark theme. | Padding: `py-[20vh]` or `py-40` between sections. |
| **Responsive design** | Must work flawlessly mobile-desktop. Oversized typography scales down. Animations reduce on mobile (prefers-reduced-motion). Touch scroll replaces hover states. | Med | All new features need mobile variants. Marquee speed adjusts. R3F Canvas already exists and lazy-loads. | Test on real devices. `clamp()` handles most type scaling. Disable some animations on mobile. |
| **Loading/preloader** | Some form of entrance gate before the site reveals. At minimum a brief loading state. Dennis Snellenberg has a minimal preloader. This sets the "experience" tone. | Med | Must coordinate with existing R3F model preloading. The preloader should gate both DOM readiness and 3D asset loading. | Can be simple (logo + progress) or elaborate (text sequence). Connected to the intro sequence feature below. |
| **Cursor-following interactions** | Custom cursor or subtle mouse-follow effects on interactive elements. Not mandatory, but expected in the Dennis Snellenberg tier. Common on links and project cards. | Med | Purely additive -- no dependencies on existing infra. | Magnetic buttons, custom cursor dot, hover scaling. Optional but strongly expected. |

---

## Differentiators

Features that separate this portfolio from other minimalist sites. The combination of 3D robot + chatbot + these design features creates something no other portfolio has.

| Feature | Value Proposition | Complexity | Dependencies on Existing Infra | Notes |
|---------|-------------------|------------|-------------------------------|-------|
| **Intro preloader sequence (text fade then curtain reveal)** | The "Welcome to party" then "Quasar" text sequence followed by a curtain wipe to the hero sets an emotional tone before any content appears. This is a narrative entrance, not just a loading spinner. Creates a memorable first impression. | High | Must gate on: (1) DOM fonts loaded, (2) hero assets ready, (3) optionally R3F model preloaded. GSAP timeline controls the sequence. Lenis must be disabled during preloader (no scroll). | **Expected behavior:** Black screen appears. "Welcome to party" fades in (letter-by-letter or word-by-word, 1-2s). Holds briefly. Fades out. "Quasar" appears, larger, centered (0.5-1s). Then a curtain/wipe transition (vertical split or slide-up) reveals the hero section beneath. Total duration: 3-5 seconds. GSAP `timeline()` is the right tool -- not CSS keyframes (need precise sequencing and easing control). |
| **Marquee name scroll in hero** | Continuously scrolling oversized text with the name ("QUASAR" or "QUANMOFII") creates visual rhythm and energy. Dennis Snellenberg uses this exact pattern -- the name scrolls horizontally in a loop behind/around the portrait. | Med | Purely CSS + GSAP. No dependency on existing infra. Must coexist with centered photo and role text in hero viewport. | **Expected behavior:** Text is ~15-20vw font size. Scrolls horizontally in an infinite loop (CSS `@keyframes` or GSAP `to` with `repeat: -1`). Two copies of the text side by side for seamless wrap. Speed: slow and steady, ~30-60s for one full cycle. On hover over hero, speed may change. Can use GSAP `ticker` for scroll-velocity-linked speed (marquee speeds up when user scrolls faster). |
| **3D robot in dedicated Section 2 (not hero)** | Moving the robot out of the hero into its own section gives it a "stage" -- the user scrolls past the clean typographic hero and discovers the interactive robot. This creates a surprise moment. The hero stays minimal, the robot gets proper showcase space. | Med | R3F Canvas, RobotScene, RobotModel, EmotionController all exist. Need to remount/reposition Canvas from hero into Section 2. Lazy-load with `IntersectionObserver` or Suspense. | **Expected behavior:** Section 2 has a split layout or centered robot Canvas (~60-80vh height). Background may be slightly different shade. "Talk to my robot" CTA text. Robot idle-animates until user interacts via ChatBar. Scroll-triggered entrance: robot fades/slides in as section enters viewport. |
| **Centered floating transparent chat bar** | Instead of the current right-anchored chat widget, a slim transparent bar centered at the bottom of the viewport. Always visible, never obstructive. Reads as part of the design, not a support widget. | Med | Existing ChatBar component (`src/components/chat/ChatBar.tsx`) needs full redesign. ChatPanel expansion behavior changes -- currently slides up from right corner, needs to expand from center. `useChatStore` stays as-is. | **Expected behavior:** Collapsed: horizontal bar, ~500px wide, centered, semi-transparent/glassmorphism background (`backdrop-blur-sm bg-white/60` or `bg-black/5`), no visible border or very subtle one. Placeholder text: "Ask my robot anything...". Expanded: ChatPanel grows upward from center bottom, maintains transparency aesthetic, messages readable but panel feels integrated with the page, not a separate overlay. On mobile: full-width, docked to bottom. |
| **Page transitions (GSAP-driven)** | Smooth transitions between routes (home -> blog, home -> project detail) with GSAP exit/enter animations. Not instant jumps. Creates the "app-like" feel that Dennis Snellenberg has. | High | Next.js App Router does NOT natively support page transitions (no `<AnimatePresence>` around route changes without a wrapper). Requires a custom `TransitionProvider` that intercepts navigation, plays exit animation, navigates, plays enter animation. Complex with static export. | **Expected behavior:** User clicks a link. Current page content fades/slides out (300-500ms). Brief transition state (optional: color/shape wipe). New page content fades/slides in (300-500ms). Total: under 1s. Common patterns: crossfade, slide-up, curtain wipe. **Warning:** This is the hardest feature to implement with Next.js App Router. Consider Framer Motion's `AnimatePresence` with `layout` or a custom solution. May need to intercept `router.push` and delay actual navigation. |
| **Scroll-velocity-linked animations** | Animation speed responds to how fast the user scrolls. Marquee speeds up, parallax increases, elements stretch/compress. Creates the "alive" feeling. | Med | Requires Lenis velocity data piped to GSAP. Lenis exposes `scroll.velocity` in its RAF callback. | **Expected behavior:** Slow scroll = gentle, smooth animations. Fast scroll = marquee whips by, parallax exaggerates, slight skew on sections. Implementation: `lenis.on('scroll', ({velocity}) => ...)` updates GSAP variables. |
| **Section dividers with animated shapes/lines** | Thin animated lines, subtle geometric elements, or SVG paths between sections. Dennis Snellenberg uses a rounded rectangular divider that morphs. Adds visual rhythm between content blocks. | Low-Med | SVG + GSAP morphing or CSS border-radius animation. No dependency on existing infra. | Simple version: animated horizontal line that draws itself on scroll. Advanced: SVG shape that morphs as it enters viewport. |
| **Magnetic hover effects on buttons/links** | Interactive elements subtly follow the cursor when nearby, then snap back on leave. Dennis Snellenberg signature interaction. | Med | Purely additive JS. Needs mouse position tracking per element. | **Expected behavior:** Cursor enters ~50px radius of button. Button translates 5-15px toward cursor. On leave, springs back. Use GSAP `quickTo()` for smooth, performant tracking. |

---

## Anti-Features

Features to explicitly NOT build for the v2.0 redesign. Each has a reason rooted in the minimalist design philosophy or complexity budget.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Dark theme / theme toggle** | White minimalist IS the brand identity for v2. A toggle contradicts the design commitment and doubles the CSS surface area. Dennis Snellenberg does not offer a dark mode. | Commit to white/warm-white. Ensure contrast meets WCAG AA on light backgrounds. |
| **Parallax scrolling on hero background image** | Competes with the marquee text and clean typography. Parallax is a 2015 pattern that feels dated in 2026 minimalist design. Dennis Snellenberg does NOT use parallax on images. | Use scroll-linked opacity or subtle scale. Keep hero photo static or with minimal GSAP-driven entrance. |
| **Three.js background effects (particles, waves)** | WebGL backgrounds compete with the 3D robot for GPU resources and visual attention. The robot IS the 3D experience. Adding particles makes it feel like a template. | Keep backgrounds pure color/white. Reserve all 3D for the robot Canvas in Section 2. |
| **Scroll-hijacking (scrolljacking)** | Forcing scroll to snap to sections or preventing free scroll is hostile UX. Users hate it. Lenis provides smooth scroll WITHOUT hijacking -- this is the correct approach. | Use Lenis for smooth scroll. Use ScrollTrigger `pin` only for brief pinned sections (intro text reveals), never for full-page snap. |
| **Heavy entrance animations on every element** | Animating every paragraph, every image, every card on scroll-in creates "animation fatigue." The user focuses on dodging animations instead of reading content. | Animate ONLY: section headings, key stats, hero elements, and the robot entrance. Body text appears statically or with a simple fade. Less is more. |
| **Video hero background** | Adds loading weight, competes with typography, mobile autoplay issues. Dennis Snellenberg uses a static photo in the hero. | Static high-quality photo, CSS-only treatments (grain overlay, subtle vignette if desired). |
| **Complex multi-step page transitions** | Elaborate page transitions (3D rotations, morphing shapes, multi-layer wipes) are impressive but fragile with Next.js App Router and add 2+ days of implementation for diminishing returns. | Simple crossfade or slide-up transition. 300-500ms max. One animation layer, not three. |
| **Infinite scroll for blog/projects** | Premature optimization. With under 10 projects and under 20 blog posts, pagination or "load more" is unnecessary complexity. | Show all items. Add pagination only when content exceeds ~20 items. |
| **Custom scrollbar styling** | Lenis handles the scroll feel. Custom scrollbar visuals are fiddly across browsers (Firefox vs Chrome), distract from content, and often look worse than native. | Let the browser show its native scrollbar. On macOS it auto-hides anyway. |
| **Skeleton loading screens for each section** | With static export, all HTML is pre-built. Sections load instantly from the HTML. Skeletons are for data-fetching delays. The only thing needing a loading state is the 3D model. | Use the intro preloader to gate initial load. Individual section skeletons are unnecessary. |

---

## Feature Dependencies

```
Intro Preloader Sequence
  |-- requires: GSAP timeline (gsap + @gsap/react)
  |-- requires: Custom fonts loaded (document.fonts.ready)
  |-- requires: Lenis disabled during sequence (enable after curtain reveal)
  |-- blocks: Hero visibility (hero is hidden until preloader completes)
  |-- optionally gates: R3F model preload (useGLTF.preload)

Smooth Scroll (Lenis)
  |-- requires: lenis npm package
  |-- requires: <ReactLenis> wrapper in layout or root
  |-- enables: GSAP ScrollTrigger integration (lenis.on('scroll', ScrollTrigger.update))
  |-- enables: Scroll-velocity-linked animations
  |-- warning: Must set Lenis to ignore R3F Canvas area (pointer-events)
  |-- warning: Disable during preloader, re-enable after curtain reveal

GSAP + ScrollTrigger Animation System
  |-- requires: gsap + @gsap/react npm packages
  |-- requires: Lenis integration (ScrollTrigger.scrollerProxy or Lenis ScrollTrigger sync)
  |-- enables: Text reveal animations (clip-path, translateY split text)
  |-- enables: Section entrance animations
  |-- enables: Pinned sections
  |-- enables: Intro preloader timeline
  |-- enables: Page transitions
  |-- warning: Must NOT animate inside R3F Canvas -- DOM elements only

Full-Viewport Hero
  |-- requires: Smooth scroll (for scroll indicator behavior)
  |-- requires: Oversized typography system (font sizing)
  |-- requires: Marquee component
  |-- requires: White theme CSS variables applied
  |-- depends on: Intro preloader (hero hidden until preloader completes)

Marquee Name Scroll
  |-- requires: GSAP (for velocity-linked speed) OR pure CSS @keyframes
  |-- requires: Oversized font system
  |-- optionally linked to: Lenis scroll velocity (marquee speeds up on scroll)
  |-- contained within: Hero section

Scroll-Triggered Text Reveals
  |-- requires: GSAP + ScrollTrigger
  |-- requires: Lenis integration (for accurate scroll position)
  |-- used in: Section headings, About section, key stats
  |-- implementation: Split text into spans, animate each with clip-path or overflow+translateY

Centered Floating Chat Bar (redesign)
  |-- requires: Existing ChatBar/ChatPanel/ChatInput/useChatStore
  |-- requires: White theme CSS variables (current dark tokens incompatible)
  |-- requires: Glassmorphism/transparency styling (backdrop-blur, bg-white/60)
  |-- independent of: GSAP system (uses Framer Motion for expand/collapse, same as current)
  |-- warning: z-index must stay above all GSAP-animated elements

3D Robot in Section 2
  |-- requires: Existing RobotCanvas, RobotScene, RobotModel, EmotionController
  |-- requires: Section 2 container with proper sizing
  |-- requires: Lazy-loading strategy (IntersectionObserver or React.lazy + Suspense)
  |-- integrates with: ChatBar (emotion state via useRobotStore unchanged)
  |-- requires: GSAP ScrollTrigger for entrance animation (optional)

Page Transitions
  |-- requires: GSAP for exit/enter animations
  |-- requires: Custom TransitionProvider wrapping App Router
  |-- requires: Navigation interception (delay router.push until exit animation completes)
  |-- warning: Hardest feature -- Next.js App Router has no built-in transition API
  |-- warning: Must preserve scroll position management (Lenis vs. native)
  |-- optional: Can use Framer Motion AnimatePresence instead of GSAP
  |-- deferrable: Can ship v2.0 without this and add later

White Theme CSS System
  |-- requires: Complete CSS variable overhaul
  |-- blocks: Every visual component (Header, sections, ChatBar, Footer)
  |-- requires: WCAG AA contrast validation on light backgrounds
  |-- requires: Typography color decisions (black-on-white base, gray accents)
```

---

## Detailed Feature Specifications

### 1. Intro Preloader Sequence

**Expected behavior step-by-step:**

1. Page loads. Entire viewport is covered by a black (or dark) overlay at `z-index: 9999`.
2. All scrolling is disabled (Lenis not yet initialized, or `overflow: hidden` on body).
3. Text appears on the dark overlay:
   - "Welcome to party" fades in, letter-by-letter or word-by-word, using GSAP `timeline` with staggered opacity/translateY on each character.
   - Holds for 0.5-1s.
   - Fades out (opacity 0, or translateY upward).
4. "Quasar" appears, larger font, centered. Same stagger-in animation but bolder.
   - Holds for 0.5-1s.
5. Curtain transition: The dark overlay splits (vertical wipe, horizontal wipe, or diagonal) to reveal the hero section underneath.
   - Implementation: Two divs that translateY apart (top half goes up, bottom half goes down), or a single div with `clip-path` animation, or CSS `scaleY(0)` from center.
   - Duration: 800ms-1.2s with a custom GSAP ease (`power4.inOut` or `expo.inOut`).
6. Hero section is now visible. Lenis smooth scroll activates. Hero elements animate in (name marquee starts, photo fades in).

**GSAP implementation pattern:**
```typescript
const tl = gsap.timeline({ onComplete: () => enableLenis() });
tl.from('.preloader-text-1 .char', { opacity: 0, y: 20, stagger: 0.03 })
  .to('.preloader-text-1', { opacity: 0, delay: 0.5 })
  .from('.preloader-text-2 .char', { opacity: 0, y: 30, stagger: 0.05 })
  .to('.preloader-text-2', { opacity: 0, delay: 0.5 })
  .to('.preloader-curtain-top', { yPercent: -100, duration: 1, ease: 'power4.inOut' }, 'reveal')
  .to('.preloader-curtain-bottom', { yPercent: 100, duration: 1, ease: 'power4.inOut' }, 'reveal')
  .set('.preloader', { display: 'none' });
```

**Complexity:** High. Requires: text splitting utility, GSAP timeline orchestration, curtain DOM structure, coordination with Lenis init, font-load gating.

---

### 2. Full-Viewport Hero with Marquee Typography

**Expected behavior:**

- Hero fills `100dvh` (dynamic viewport height for mobile).
- Centered professional photo (placeholder initially), roughly 40-50% of viewport width on desktop, smaller on mobile.
- Name in oversized marquee: "QUASAR" or full name scrolls horizontally behind or around the photo in a continuous loop.
- Role text below/beside photo: "AI Engineer" or similar, smaller but still large display type.
- Minimal nav at top (logo left, nav links right).
- Scroll indicator at bottom (animated arrow or "scroll" text).

**Marquee implementation:**

The marquee is NOT the deprecated HTML `<marquee>` tag. It is a div containing two identical text sequences side by side, animated with CSS `translateX` or GSAP:

```
[QUASAR -- QUASAR -- ][QUASAR -- QUASAR -- ]
<-- scrolls left continuously, when first copy exits, second is already in view -->
```

The div is `display: flex; width: fit-content` and translates by `-50%` to loop seamlessly.

**Font sizing:** `font-size: clamp(60px, 15vw, 240px)` for the marquee. `font-weight: 900` or `800`. Letter-spacing: tight (`-0.05em`).

**Scroll-velocity link (optional differentiator):** Marquee base speed is ~0.5px/frame. When Lenis reports `velocity > 0`, multiply speed. Formula: `speed = baseSpeed + Math.abs(velocity) * multiplier`. This makes the marquee "react" to scrolling.

**Complexity:** Medium. The marquee loop is a well-established CSS/GSAP pattern. The tricky part is responsive sizing and photo integration.

---

### 3. Smooth Scroll with Lenis

**Expected behavior:**

- Native scroll is intercepted by Lenis. Scroll feels "smooth" with inertia/momentum.
- Trackpad swipes and mouse wheel both feel smooth.
- Mobile touch scroll remains native-feeling (Lenis handles this).
- GSAP ScrollTrigger is synced to Lenis's scroll position (not the native scroll).
- Keyboard arrow keys and Page Up/Down still work.
- Anchor links (nav clicking "About") scroll smoothly to the target section.

**Integration with GSAP ScrollTrigger:**

Lenis and ScrollTrigger must share scroll state. The standard pattern:

```typescript
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
```

This replaces Lenis's own RAF with GSAP's ticker, ensuring both systems are perfectly synced on the same frame.

**React integration:**

Lenis provides `<ReactLenis>` component or `useLenis` hook. Wrap in the root layout:

```tsx
<ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
  {children}
</ReactLenis>
```

**R3F Canvas coordination:** The R3F Canvas handles its own scroll internally (Three.js orbit controls, if any). Lenis should NOT interfere with pointer events inside the Canvas. Set `data-lenis-prevent` on the Canvas container if needed.

**Complexity:** Low. Lenis is a drop-in. The GSAP sync is ~5 lines. The main risk is edge cases (modals, chat panel scroll, R3F canvas).

---

### 4. Scroll-Triggered Text Reveals

**Expected behavior:**

There are two main patterns used in minimalist portfolios:

**Pattern A: Clip-path reveal (preferred for headings)**
- Text starts with `clip-path: inset(0 0 100% 0)` (fully clipped from bottom).
- On scroll into viewport, `clip-path` animates to `inset(0 0 0% 0)` (fully revealed).
- Combined with `translateY(100%)` to `translateY(0)` on the text inside the clip container.
- Result: text appears to "rise" into view from behind a mask.

**Pattern B: Character stagger (for hero text, section titles)**
- Text is split into individual `<span>` elements per character or word.
- Each span animates `opacity: 0, y: 30` to `opacity: 1, y: 0` with GSAP stagger.
- Creates a typewriter/cascade effect.
- Requires a text-splitting utility (custom or SplitType library).

**Pattern C: Line-by-line reveal (for paragraphs)**
- Each line of text is wrapped in an `overflow: hidden` container.
- The text inside translates from `translateY(100%)` to `translateY(0)`.
- Triggered by ScrollTrigger when the line enters the viewport.

**ScrollTrigger configuration:**
```typescript
gsap.from('.reveal-text', {
  scrollTrigger: {
    trigger: '.reveal-text',
    start: 'top 80%',    // starts when top of element hits 80% of viewport
    end: 'top 20%',
    toggleActions: 'play none none none',  // play on enter, don't reverse
  },
  clipPath: 'inset(0 0 100% 0)',
  y: 50,
  duration: 1,
  ease: 'power4.out',
  stagger: 0.1,
});
```

**Where to use:**
- Section headings: Pattern A or B
- Hero name/role: Pattern B (character stagger, via preloader timeline)
- About section text: Pattern C (line by line)
- Stats/numbers: Pattern A with counter animation
- Project cards: Simple fade-up (`opacity: 0, y: 30` to visible)

**Complexity:** Medium. The GSAP code is straightforward. The complexity is in: (1) the text-splitting utility for character/line splitting, (2) applying it consistently across i18n content (Vietnamese characters need special handling), (3) ensuring it works with Lenis's scroll position.

---

### 5. Page Transitions

**Expected behavior:**

- User clicks internal link (nav, project card, blog post link).
- Current page content fades out or slides out (300-500ms).
- Optional: brief transition overlay (color wipe, shape morph).
- New page content fades in or slides in (300-500ms).
- Total transition time: 600ms-1000ms.

**The Next.js App Router problem:**

Next.js App Router does NOT provide a built-in page transition API. When `router.push('/new-route')` is called, the old page unmounts and the new page mounts immediately. There is no "exit animation" hook.

**Solution approaches (ranked by feasibility):**

1. **Framer Motion `AnimatePresence` with `layout` prop** -- Requires wrapping the page content in a keyed `motion.div` in the layout. The `key` must change on route change. Framer Motion then handles exit/enter. This is the simplest approach but has limitations with deeply nested layouts.

2. **Custom GSAP TransitionProvider** -- Intercepts link clicks, plays GSAP exit timeline, calls `router.push()` on complete, plays GSAP enter timeline on mount. More control but more code.

3. **View Transitions API** (native browser) -- `document.startViewTransition()` is supported in Chrome/Edge (2024+) and Safari 18+. Next.js experimental support exists. This is the lowest-code approach but browser support is not universal yet.

4. **Defer entirely** -- Ship v2.0 without page transitions. The site is mostly a single-page scrolling experience. Blog and project detail pages are the only real "page changes." Add transitions in a polish phase.

**Recommendation:** Start with approach 4 (defer), then add approach 1 (Framer Motion) in a later phase. Page transitions are high complexity for moderate visual impact, and they are the most fragile feature to maintain across Next.js updates.

**Complexity:** High (approach 2), Medium (approach 1), Low (approach 4).

---

### 6. Centered Floating Transparent Chat Bar

**Expected behavior:**

**Collapsed state:**
- Horizontal bar, ~480-520px wide on desktop, centered horizontally, fixed to bottom with ~16-24px margin.
- Semi-transparent: `backdrop-blur-md bg-white/70` with subtle border (`border border-black/5`).
- Left side: small robot icon or message icon.
- Center: placeholder text "Ask my robot anything..." in muted gray.
- Right side: subtle send arrow or nothing.
- Rounded corners: `rounded-full` or `rounded-2xl`.
- Shadow: very subtle, `shadow-sm` or none.
- On hover: slight background opacity increase, subtle scale.
- On mobile: full width minus padding, same centered bottom position.

**Expanded state:**
- ChatPanel grows upward from the bar position.
- Panel width matches bar width on desktop (~500px centered), full width on mobile.
- Panel has the same transparency/glassmorphism treatment.
- Messages are readable: use slightly more opaque background for message bubbles.
- Max height: ~60vh so it never covers the full screen.
- Close button returns to collapsed state with smooth animation.

**Transition between states:**
- Currently uses Framer Motion spring animation (`y: '100%'` to `y: 0`). This can stay.
- Add: bar morphs into panel header (the collapsed bar becomes the top of the expanded panel).

**Changes from current implementation:**
- Current: right-aligned (`md:right-4 md:bottom-4 md:w-[400px]`), dark theme, opaque background.
- New: center-aligned, transparent/glass, wider, warm-white theme.
- `ChatBar.tsx`: positioning changes from `right-0` to `left-1/2 -translate-x-1/2`, width from `md:w-[400px]` to `md:w-[500px]`.
- `ChatPanel.tsx`: background from `bg-surface-elevated` to `backdrop-blur-md bg-white/80`.
- Color tokens: all `text-text-primary`, `text-text-muted`, `border-border` must work on light/glass background.

**Complexity:** Medium. The ChatBar/ChatPanel/ChatInput/useChatStore infrastructure is solid. This is primarily a CSS/positioning redesign, not a logic rewrite.

---

### 7. Dennis Snellenberg-Style Design Patterns (Aggregate)

These are the micro-interactions and visual details that collectively create the Dennis Snellenberg "feel":

| Pattern | Description | Implementation | Priority |
|---------|-------------|----------------|----------|
| **Rounded image masks** | Photos use `border-radius: 20px-40px`, never square corners, never circles | CSS `rounded-3xl` | High -- easy, high impact |
| **Text weight contrast** | Thin weights (300-400) for body, heavy (700-900) for display. Creates rhythm. | Tailwind font-weight classes | High -- easy |
| **Monospace accent text** | Small labels, dates, section numbers in monospace. Dennis Snellenberg uses this for metadata. | `font-mono` on specific elements, existing `geistMono` font | Medium |
| **Section numbering** | Sections labeled "01", "02", "03" in small monospace text at the top-left of each section | Simple counter, static text | Low -- easy |
| **Hover state underline animations** | Nav links and text links: underline slides in from left on hover, slides out on unhover | CSS `::after` pseudo-element with `scaleX` transition | High -- signature interaction |
| **Image reveal on scroll** | Images start with `clip-path: inset(0 0 100% 0)` or `scale(1.2)` inside `overflow: hidden`, revealed on scroll | GSAP ScrollTrigger | Medium |
| **Footer with large typography** | Footer is not small print. Large "Let's work together" or contact CTA in display type. Social links in a row. | Layout change, oversized footer text | Medium |
| **Grain/noise texture overlay** | Very subtle CSS noise texture over the white background adds warmth and texture. Prevents the "sterile white" look. | CSS `background-image` with noise SVG or data URI, low opacity (`0.03-0.05`) | Low -- subtle but noticed |
| **Smooth color transitions** | When scrolling between sections of slightly different background shades, the color transition is smooth, not a hard edge | Gradient between sections or ScrollTrigger-driven background color | Low |

---

## MVP Recommendation

Given the v2.0 is a redesign milestone on an existing working portfolio, the MVP should ship features in dependency order, with the most impactful visual changes first.

**Priority 1 -- Foundation (must ship, everything depends on this):**
1. White theme CSS system (all variables, all components restyled)
2. Lenis smooth scroll + GSAP + ScrollTrigger integration
3. Oversized typography system (clamp-based fluid sizing)

**Priority 2 -- Hero + First Impression (the "wow" moment):**
4. Intro preloader sequence (text fade + curtain reveal)
5. Full-viewport hero with centered photo and marquee name
6. Minimal navigation redesign (white theme, hover animations)

**Priority 3 -- Content + Interaction (depth and engagement):**
7. Scroll-triggered text reveals on all section headings
8. 3D robot relocated to Section 2 with scroll-triggered entrance
9. Centered floating transparent chat bar redesign
10. About/Projects/Footer sections redesigned for light theme

**Priority 4 -- Polish (ship without, add later):**
11. Page transitions (defer to post-launch)
12. Magnetic hover effects on buttons
13. Scroll-velocity-linked marquee speed
14. Custom cursor
15. Section dividers with animated shapes
16. Grain texture overlay

**Defer entirely:**
- Page transitions: High complexity, moderate impact. Ship without.
- Custom cursor: Nice but not essential. Add in polish phase.
- Scroll-velocity marquee: Enhancement on top of basic marquee. Add after marquee works.

---

## Feature Complexity Reference

| Feature | Est. Effort | Key Risk | Depends On Existing Infra? |
|---------|-------------|----------|---------------------------|
| White theme CSS system | 2-3 days | Every component needs restyling; easy to miss edge cases | All existing components affected |
| Lenis + GSAP + ScrollTrigger setup | 0.5-1 day | Sync between Lenis and ScrollTrigger; R3F canvas conflicts | Must coordinate with R3F Canvas |
| Oversized typography system | 0.5 day | Font choice, clamp values, testing at all breakpoints | Uses existing font variables |
| Intro preloader sequence | 1.5-2 days | GSAP timeline timing; font-load gating; curtain CSS; mobile testing | Blocks hero reveal |
| Full-viewport hero + marquee | 1.5-2 days | Responsive photo + marquee layout; marquee loop seamlessness | None |
| Minimal nav redesign | 0.5-1 day | Language switcher integration; mobile menu rethink | Existing Header, LanguageSwitcher |
| Scroll-triggered text reveals | 1-2 days | Text splitting for i18n; consistent application across sections | GSAP + ScrollTrigger |
| 3D robot in Section 2 | 1-1.5 days | Canvas remounting; lazy-load timing; scroll-triggered entrance | R3F Canvas, RobotScene, RobotModel |
| Centered floating chat bar | 1-1.5 days | Glassmorphism on different backgrounds; mobile full-width; expand animation | ChatBar, ChatPanel, useChatStore |
| Page transitions | 2-3 days | Next.js App Router has no transition API; fragile across updates | Requires custom TransitionProvider |
| Magnetic hover effects | 0.5 day | Performance (many elements); mobile fallback | GSAP quickTo |
| Custom cursor | 0.5 day | Touch device detection; performance | GSAP or CSS |

**Total estimated effort for Priority 1-3:** 10-15 days
**Total with Priority 4:** 15-20 days

---

## Sources

- GSAP npm registry: v3.14.2, license verified as "Standard no-charge" (free for personal/portfolio sites) -- npm info, 2026-03-15
- @gsap/react npm registry: v2.1.2, peer requires `gsap ^3.12.5` and `react >=17` -- npm info, 2026-03-15
- Lenis npm registry: v1.3.18, MIT license, peer requires `react >=17.0.0` (optional) -- npm info, 2026-03-15
- Dennis Snellenberg design reference: dennissnellenberg.com (Awwwards SOTD, design patterns from training data -- HIGH confidence, widely documented portfolio)
- GSAP ScrollTrigger documentation: gsap.com/docs/v3/Plugins/ScrollTrigger (training data, HIGH confidence -- core GSAP feature since v3.0)
- Lenis + GSAP integration: Standard pattern from Lenis GitHub README and GSAP community docs (training data, HIGH confidence -- widely adopted pattern)
- Next.js page transitions limitation: Known App Router constraint -- no built-in exit animation API (training data, HIGH confidence -- documented community pain point)
- Text reveal / clip-path animation patterns: Standard GSAP community techniques (training data, HIGH confidence -- hundreds of CodePen examples, Awwwards sites)
- Glassmorphism chat UI: Established CSS pattern using backdrop-filter (training data, HIGH confidence -- supported in all modern browsers since 2022)
- Marquee infinite scroll pattern: Standard CSS/GSAP technique (training data, HIGH confidence -- CSS-only version works with `@keyframes`, GSAP adds velocity control)
- Existing codebase: ChatBar.tsx, ChatPanel.tsx, useChatStore.ts, layout.tsx (read from repo, 2026-03-15)
- Project requirements: .planning/PROJECT.md (authoritative, owner-defined)
- Confidence: HIGH for table stakes (industry standard patterns), HIGH for differentiators (well-established techniques applied to unique context), HIGH for anti-features (explicitly scoped in PROJECT.md)
