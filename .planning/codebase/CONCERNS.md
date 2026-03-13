# Codebase Concerns

**Analysis Date:** 2026-03-13

## Tech Debt

**Empty AboutSection stub:**
- Issue: `AboutSection` is a shell component with a `sectionRef` and empty layout div. No content is rendered. The section still occupies a full viewport height (`h-screen`) and is included in the page.
- Files: `src/components/sections/AboutSection.tsx`
- Impact: A blank full-screen section appears between IntroduceSection and ProjectSection. The `id="introduce"` on this stub also conflicts with IntroduceSection's `id="introduct"` (see Duplicate IDs below).
- Fix approach: Either implement the section content or remove the component from `src/app/page.tsx` until ready.

**`zustand` dependency installed but never used:**
- Issue: `zustand` v5 is listed in `package.json` dependencies but no store file exists anywhere in the repository (`src/` has no `store/`, `state/`, or `*.store.*` files).
- Files: `package.json`
- Impact: Increases bundle size unnecessarily and signals incomplete refactor or abandoned implementation.
- Fix approach: Either implement state management with Zustand (e.g., for loading screen or header state) or remove the package from `dependencies`.

**Saprona font family shipped but never loaded or used:**
- Issue: Three font files (`Saprona-Light.woff`, `Saprona-Medium.woff`, `Saprona-Regular.woff`) are committed in `src/app/fonts/` but are never referenced in `src/app/layout.tsx`, `src/app/globals.css`, or any component.
- Files: `src/app/fonts/Saprona-Light.woff`, `src/app/fonts/Saprona-Medium.woff`, `src/app/fonts/Saprona-Regular.woff`
- Impact: Dead binary assets bloat the repository and deployment bundle.
- Fix approach: Remove the three files if not planned for use, or register them via `localFont` in `src/app/layout.tsx`.

**Default Next.js scaffold assets never cleaned up:**
- Issue: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg` are committed but not referenced in any source file.
- Files: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`
- Impact: Clutters the `public/` directory; slightly increases deployment artifact size.
- Fix approach: Delete all five files.

**`ButtonDownloadCV` ignores `NEXT_PUBLIC_BASE_PATH`:**
- Issue: The download link is hardcoded as `/HaMinhQuan_CV.pdf` via `document.createElement('a')`, bypassing the `basePath` prefix used by every other asset component (`BaseVideo`, `BaseImage`).
- Files: `src/components/ButtonDownloadCV.tsx`
- Impact: The CV download breaks in production when deployed to a sub-path (e.g., `https://quanmofii.github.io/`), returning a 404 because the request goes to the root path rather than the prefixed path.
- Fix approach: Apply the same pattern as `BaseVideo`/`BaseImage`: `const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''; link.href = \`${basePath}/HaMinhQuan_CV.pdf\``.

**Scroll-driven animation relies on undocumented magic numbers:**
- Issue: `HeroSection` uses raw numeric scroll progress offsets (`0.07`, `0.02`, `0.15`, `0.6`, `1.0`) and hardcoded pixel subtractions (`- 95`) to calibrate the video expand animation. The `95` constant approximates the header height but will break if the header height changes.
- Files: `src/components/sections/HeroSection.tsx`
- Impact: Any layout change (header resize, padding change) desynchronises the animation. The total section height of `h-[1100vh]` is also a raw guess that may not be correct on all screen sizes.
- Fix approach: Replace `95` with a measured header element height via `useRef`. Extract scroll offset constants to named variables with comments explaining their purpose.

**Header GitHub dropdown link positioned with fixed `mt-68`:**
- Issue: The GitHub link card in the header dropdown uses `mt-68` (Tailwind arbitrary offset) to position itself below the nav items. This assumes exactly 4 menu items at a fixed height.
- Files: `src/components/Header.tsx` (line 181)
- Impact: Adding or removing menu items will misalign the GitHub link card visually.
- Fix approach: Replace the fixed offset with a dynamic layout (e.g., flexbox column on the dropdown container) so the GitHub card naturally follows the last nav item.

**`_config.yml` contains stale identity:**
- Issue: `src/app/_config.yml` is a Jekyll config file with `title: Hà Minh Quân (DuckMofii)` — an old username. The site now uses the identity "QuanMofii". This file serves no purpose in a Next.js static export.
- Files: `src/app/_config.yml`
- Impact: Misleading artefact; old alias "DuckMofii" could surface in GitHub Pages Jekyll processing.
- Fix approach: Delete the file. `.nojekyll` is already added at build time, so Jekyll is disabled. The config has no effect but is a maintenance hazard.

## Known Bugs

**Metadata `title.template` is misconfigured:**
- Symptoms: In `src/app/layout.tsx`, `metadata.title.template` is set to `"Hà Minh Quân"` (a plain string) instead of a format string like `"%s | Hà Minh Quân"`. This means any child page using a `title` export will render just the name with no separator or page label.
- Files: `src/app/layout.tsx` (line ~28)
- Trigger: Any route that sets its own `metadata.title`.
- Workaround: Currently there is only one route (`/`), so it has no visible impact yet.

**Duplicate `id` attributes on section elements:**
- Symptoms: `AboutSection` has `id="introduce"` and `IntroduceSection` has `id="introduct"`. The header nav item labelled "Introduce" points to `#introduct`. The `id="introduce"` on the empty `AboutSection` is orphaned and creates a duplicate semantic landmark.
- Files: `src/components/sections/AboutSection.tsx`, `src/components/sections/IntroduceSection.tsx`, `src/components/Header.tsx`
- Trigger: Any anchor link targeting `#introduce` (e.g., from external links or bookmarks) lands on the empty stub.
- Workaround: None currently.

**`IntroduceSection` missing `"use client"` directive:**
- Symptoms: `IntroduceSection` uses `useRef`, `useInView` (framer-motion), and `motion` components, all of which require a client boundary. The file has no `"use client"` directive at the top.
- Files: `src/components/sections/IntroduceSection.tsx`
- Trigger: With React Server Components enabled (Next.js 15 default), this can cause hydration errors or a build-time error if the component tree is not already wrapped in a client boundary from `src/app/page.tsx` (which does have `"use client"`).
- Workaround: Currently masked because `src/app/page.tsx` declares `"use client"`, propagating the boundary to children. But this is fragile — if `page.tsx` ever removes `"use client"`, `IntroduceSection` will break.

**`ProjectSection` missing `"use client"` directive:**
- Symptoms: Same as above — `ProjectSection` uses `useRef` and framer-motion `AnimatedDiv`/`AnimatedText` which require client context. No `"use client"` at the top of the file.
- Files: `src/components/sections/ProjectSection.tsx`
- Trigger: Same as `IntroduceSection`.
- Workaround: Same — masked by `page.tsx` `"use client"`.

## Security Considerations

**`.env.local` and `.env.production` committed to git history:**
- Risk: Both env files appear in git history (commits `4f15add`, `e78b60e`, `6414f6b`, `6ae8b12`). While inspection shows the current values are only `NEXT_PUBLIC_BASE_PATH=` (empty), any future secrets added to these files may be accidentally committed if contributors follow the same pattern.
- Files: `.env.local`, `.env.production` (tracked in git — visible via `git ls-tree HEAD`)
- Current mitigation: `.gitignore` includes `.env` but NOT `.env.local` or `.env.production`, which is why these files were committed.
- Recommendations:
  1. Add `.env.local` and `.env.production` to `.gitignore` immediately.
  2. Remove these files from git tracking: `git rm --cached .env.local .env.production`.
  3. Rotate any secrets if real values were ever stored in these files.

**Personal contact information hardcoded in source:**
- Risk: Phone number `+84 0376316144`, email `haminhquan12c7@gmail.com`, and Zalo handle are hardcoded directly in `src/components/Footer.tsx` as visible source strings. These are indexed by search engines and scrapers.
- Files: `src/components/Footer.tsx`
- Current mitigation: Intentional display — but no obfuscation.
- Recommendations: Consider extracting contact data to a config file (non-secret, but centralised for easy rotation). If spam becomes an issue, use email obfuscation or a contact form.

**`dangerouslySetInnerHTML` used in root layout:**
- Risk: The JSON-LD structured data in `src/app/layout.tsx` is injected via `dangerouslySetInnerHTML`. The content is fully static (no user input), so there is no immediate XSS risk. However, the pattern must not be extended to include dynamic/user-supplied data.
- Files: `src/app/layout.tsx`
- Current mitigation: All values are string literals in source code.
- Recommendations: Add a comment flagging that this block must remain static. Alternatively, use a typed JSON-LD library to eliminate the raw HTML injection.

## Performance Bottlenecks

**All `BaseImage` instances use `priority` flag:**
- Problem: Every `BaseImage` component unconditionally sets `priority={true}` on `next/image`, which tells the browser to eagerly preload every image on the page simultaneously regardless of viewport position.
- Files: `src/components/BaseImage.tsx`
- Cause: Priority was hardcoded as a blanket setting rather than being passed as a prop.
- Improvement path: Accept a `priority` prop defaulting to `false`. Only pass `priority={true}` to above-the-fold images (e.g., avatar in Footer is below the fold — should not be priority).

**Two autoplay videos with no lazy loading:**
- Problem: `public/hero/video1.webm` (full-screen hero video) and `public/introduce/video.mp4` both autoplay and are loaded eagerly via `<video src={fullSrc} autoPlay muted loop>`. There is no lazy loading, intersection-observer-gating, or preload strategy.
- Files: `src/components/BaseVideo.tsx`, `public/hero/video1.webm`, `public/introduce/video.mp4`
- Cause: `BaseVideo` sets `src` directly without `preload="none"` or `lazy` loading.
- Improvement path: Add `preload="none"` to videos not in the initial viewport. Set `src` only when the element enters the viewport using `IntersectionObserver` or `useInView`.

**`AnimatedText` creates one `motion.div` per word:**
- Problem: `AnimatedText` splits text into words and wraps each word in a `motion.div`, creating many Framer Motion nodes. For long text strings (e.g., the hero paragraph of ~20 words), this generates 20 separate animation subscriptions.
- Files: `src/components/AnimatedText.tsx`
- Cause: Architectural decision for word-by-word reveal effect.
- Improvement path: Consider using `motion` variants with `staggerChildren` on a single wrapper instead of individual `motion.div` per word, which reduces the number of Framer Motion subscribers.

**`GradientBackground` tracks `mousemove` on every pixel move:**
- Problem: The `mousemove` handler in `GradientBackground` fires on every mouse movement with no throttling or debounce, calling `mouseX.set()` and `mouseY.set()` on each event.
- Files: `src/components/GradientBackground.tsx`
- Cause: Direct event listener without rate limiting.
- Improvement path: Use a `requestAnimationFrame`-based throttle or `useCallback` with a short debounce. Framer Motion's `useSpring` already smooths the visual output but the handler overhead remains.

## Fragile Areas

**`LoadingScreen` timing depends on `setTimeout` + window `load` event race:**
- Files: `src/components/LoadingScreen.tsx`
- Why fragile: The loading screen hides after `2000ms` minimum delay following the `window.load` event, with a `1000ms` animation. If assets load very fast, the delay is artificial and user-perceived. If assets are slow (e.g., large video files on a mobile connection), the loader disappears before assets are ready because the 2-second timer starts from `window.load`, not from video `canplay`. `setIsLoaded(true)` is called both inside the event listener AND after a 1-second `setTimeout` via `await new Promise(...)`, whichever is first — this is a redundant dual-trigger that can cause state updates on unmounted components.
- Safe modification: Replace timer-based logic with actual asset readiness signals (video `canplaythrough`, image `onLoad`). Cancel the `window.addEventListener('load', ...)` listener in cleanup.
- Test coverage: No tests.

**Header logo colour switching is scroll-position brittle:**
- Files: `src/components/Header.tsx`
- Why fragile: Logo colour changes from black to white based on specific `getBoundingClientRect()` threshold comparisons (`Math.abs(heroRect.top) >= windowHeight && < windowHeight * 7`). These thresholds are tied to the `h-[1100vh]` hero section height. Any change to section heights or layout will break colour transitions.
- Safe modification: Tie colour transitions to a data attribute or CSS class on the section element rather than pixel math. Consider using Framer Motion `useInView` with named regions.
- Test coverage: No tests.

**Dropdown GitHub button absolute positioning is content-count-dependent:**
- Files: `src/components/Header.tsx`
- Why fragile: The GitHub link card uses `mt-68` to appear below exactly 4 nav items. If the `menuItems` array grows, the card overlaps with menu items.
- Safe modification: Use `flexbox` column layout on the dropdown container so the card follows naturally.
- Test coverage: No tests.

## Scaling Limits

**Project list is hardcoded as a static array:**
- Current capacity: 4 projects hardcoded in `src/components/sections/ProjectSection.tsx`.
- Limit: Adding more projects requires editing the source file and redeploying. The grid layout uses `md:mt-[16vw]` offset for odd-indexed items, which relies on exactly 2 columns and becomes increasingly awkward with many projects.
- Scaling path: Move project data to a separate data file (e.g., `src/data/projects.ts`) or a CMS. Add pagination or a "show more" mechanism for the grid.

## Dependencies at Risk

**`ldrs` (loading animation library):**
- Risk: `ldrs` v1.1.7 is a niche Web Components-based loader library. It imports CSS side-effects directly (`import "ldrs/react/Bouncy.css"`), which conflicts with Next.js app directory CSS-in-JS conventions and may cause issues with future bundler or RSC changes. The library has minimal community adoption.
- Impact: `LoadingScreen` breaks if the library is abandoned or incompatible with future React/Next versions.
- Migration plan: Replace with a simple CSS/Tailwind keyframe animation or a more widely-adopted library (e.g., `react-spinners`).

**`next-sitemap` run both in `postbuild` script and GitHub Actions workflow:**
- Risk: `package.json` defines `postbuild` as `npx next-sitemap && touch ./out/.nojekyll`. The CI workflow (`nextjs.yml`) also runs `npx next-sitemap` as a separate step AFTER `next build`. This means sitemap generation runs twice in CI.
- Impact: Redundant execution wastes CI time. The `.nojekyll` file is NOT created in the workflow step (only in `postbuild`), which could cause a race condition if the workflow's `next build` does not trigger `postbuild` (it does, since `npm ci && npm run build` runs `postbuild` automatically). The separate workflow step is therefore both redundant and potentially confusing.
- Migration plan: Remove the dedicated "Generate sitemap and robots.txt" step from `.github/workflows/nextjs.yml` and rely solely on the `postbuild` npm hook.

## Missing Critical Features

**No error boundary or fallback UI:**
- Problem: There are no React error boundaries anywhere in the component tree. If any section component throws during render (e.g., Framer Motion issue, missing asset), the entire page goes blank.
- Blocks: Production resilience for a public portfolio site.

**No `<noscript>` fallback:**
- Problem: All animations, section reveals, and loading screen logic depend entirely on JavaScript. There is no `<noscript>` tag or CSS fallback to display any content if JavaScript is disabled or fails to load.
- Blocks: Accessibility and basic content visibility for users/bots with JS disabled.

**Alternate language routes declared but not implemented:**
- Problem: `metadata.alternates.languages` in `src/app/layout.tsx` declares `/vi` and `/en` routes. Neither route exists in the repository. Search engines indexing these alternate URLs will encounter 404s.
- Files: `src/app/layout.tsx`
- Blocks: Correct multilingual SEO signal. Currently sends incorrect hreflang signals to search engines.

## Test Coverage Gaps

**No tests exist:**
- What's not tested: The entire codebase has zero test files. No unit tests for utility logic, no component tests, no integration tests, no E2E tests. No test framework is installed.
- Files: All `src/` files.
- Risk: Regressions in scroll animations, loading screen timing, or link generation cannot be caught automatically. The `ButtonDownloadCV` basePath bug (see Tech Debt) would be caught by a simple unit test.
- Priority: Medium — this is a portfolio site with no business logic, but component smoke tests and basic interaction tests would catch regressions during dependency upgrades.

---

*Concerns audit: 2026-03-13*
