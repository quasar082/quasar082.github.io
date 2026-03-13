# Technology Stack

**Analysis Date:** 2026-03-13

## Languages

**Primary:**
- TypeScript 5.8.3 - All source files in `src/`
- CSS - `src/app/globals.css` (Tailwind v4 directives + CSS variables)

**Secondary:**
- JavaScript - Config files (`next.config.ts`, `next-sitemap.config.js`, `postcss.config.mjs`, `eslint.config.mjs`)

## Runtime

**Environment:**
- Node.js 20 (pinned in CI via `actions/setup-node@v4` with `node-version: "20"`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (lockfileVersion 3, present and committed)

## Frameworks

**Core:**
- Next.js 15.3.1 - App Router, static export (`output: 'export'`), React Server/Client components
- React 19.1.0 - UI rendering, hooks
- React DOM 19.1.0 - DOM mounting

**Styling:**
- Tailwind CSS 4.1.4 - Utility-first CSS via `@import "tailwindcss"` in `src/app/globals.css`
- `@tailwindcss/postcss` ^4 - PostCSS integration via `postcss.config.mjs`

**Animation:**
- Framer Motion 12.7.4 - Component animations, scroll-based `useInView`, `AnimatePresence`, spring transitions
  - Used in: `src/components/AnimatedDiv.tsx`, `src/components/AnimatedText.tsx`, `src/components/Header.tsx`, `src/components/ButtonDownloadCV.tsx`, and all section components

**Build/Dev:**
- Turbopack - Dev server (`next dev --turbopack` in `package.json` scripts)
- next-sitemap 4.2.3 - Generates `sitemap.xml` and `robots.txt` at `./out/` post-build, configured in `next-sitemap.config.js`

## Key Dependencies

**Critical:**
- `framer-motion` 12.7.4 - Drives all scroll-triggered and entrance animations site-wide
- `zustand` 5.0.3 - Client-side state management (present as dependency, used for global state)
- `ldrs` 1.1.7 - Web component loading spinners (`Bouncy`, `Reuleaux`) in `src/components/LoadingScreen.tsx`
- `lucide-react` 0.488.0 - Icon library (`ArrowUpRight`, `Download`) in `src/components/Header.tsx`, `src/components/ButtonDownloadCV.tsx`

**Infrastructure:**
- `next-sitemap` 4.2.3 - SEO sitemap generation, runs via `postbuild` script
- `gh-pages` - Manual deploy alternative via `npm run deploy` (deploys `./out` to GitHub Pages)

## Configuration

**Environment:**
- `.env.local` - Contains `NEXT_PUBLIC_BASE_PATH=` (empty value for local dev)
- `.env.production` - Contains `NEXT_PUBLIC_BASE_PATH=` (empty value; basePath injected by GitHub Actions via `actions/configure-pages@v5`)
- Only one env var: `NEXT_PUBLIC_BASE_PATH` (controls `assetPrefix` and `basePath` in production)

**Build:**
- `next.config.ts` - Static export (`output: 'export'`), `trailingSlash: true`, `images.unoptimized: true`, conditional `assetPrefix`/`basePath` for production
- `tsconfig.json` - Strict TypeScript, target `ES2017`, path alias `@/*` → `./src/*`, `moduleResolution: bundler`
- `postcss.config.mjs` - Single plugin: `@tailwindcss/postcss`
- `eslint.config.mjs` - Extends `next/core-web-vitals` and `next/typescript` (ESLint flat config)

**Fonts:**
- Google Font: `Geist_Mono` loaded via `next/font/google` in `src/app/layout.tsx`
- Local fonts in `src/app/fonts/`: `MarlinGeoSQ-Regular.woff`, `MarlinGeoSQ-Medium.woff`, `Saprona-Light.woff`, `Saprona-Medium.woff`, `Saprona-Regular.woff`

## Platform Requirements

**Development:**
- Node.js 20+
- npm (package-lock.json present)
- Run: `npm run dev` (starts Next.js with Turbopack)

**Production:**
- GitHub Pages (static hosting)
- Output: `./out/` directory (static HTML export via `next build`)
- Deploy: GitHub Actions workflow at `.github/workflows/nextjs.yml` (triggers on push to `master`)
- Build produces static files including `sitemap.xml`, `robots.txt`, `.nojekyll`

---

*Stack analysis: 2026-03-13*
