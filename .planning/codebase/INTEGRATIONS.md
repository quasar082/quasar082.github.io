# External Integrations

**Analysis Date:** 2026-03-13

## APIs & External Services

**Search Engine Verification:**
- Google Search Console - Site ownership verification
  - Method: `verification.google` meta tag in `src/app/layout.tsx`
  - Value: `ZZkPNFkZS-d1KtXlcA9ri2j9YP0WepMMkPfCln9Qcik`
- Yandex - Verification slot present but empty in `src/app/layout.tsx`

**Social / Profile Links (outbound links only, no API):**
- GitHub: `https://github.com/QuanMofii` - linked in `src/components/Header.tsx`, `src/components/Footer.tsx`
- LinkedIn: `https://www.linkedin.com/in/ha-minh-quan-b10717294/` - linked in `src/components/Footer.tsx`
- Facebook: `https://www.facebook.com/haminhqquan` - linked in `src/components/Footer.tsx`
- Instagram: `https://www.instagram.com/QuanMofii` - linked in `src/components/Footer.tsx`
- Twitter/X: `@QuanMofii` - referenced in OpenGraph/Twitter card metadata in `src/app/layout.tsx`

**Google Fonts:**
- Service: `fonts.googleapis.com` (via Next.js `next/font/google`)
- Font: `Geist_Mono` loaded in `src/app/layout.tsx`
- Auth: None (public CDN)

## Data Storage

**Databases:**
- None - This is a fully static portfolio site with no backend or database.

**File Storage:**
- Local filesystem only - Assets served from `public/` directory:
  - `public/HaMinhQuan_CV.pdf` - CV download
  - `public/avatar.jpg`, `public/contract/avatar.jpg` - Profile images
  - `public/hero/video1.webm`, `public/introduce/video.mp4` - Section videos
  - `public/projects/project1.png` through `project4.png` - Project screenshots
  - `public/share_img.png` - OpenGraph share image

**Caching:**
- None (server-side) - GitHub Actions build cache via `actions/cache@v4` for `.next/cache` (CI only)

## Authentication & Identity

**Auth Provider:**
- None - No user authentication. Static portfolio with no login functionality.

## Monitoring & Observability

**Error Tracking:**
- None detected. `console.error` used locally in `src/components/LoadingScreen.tsx` for asset load failures.

**Analytics:**
- None detected in source code. No Google Analytics, Plausible, or similar scripts found.

**Logs:**
- Browser console only (`console.error` in `src/components/LoadingScreen.tsx`)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages - Static site hosting at `https://rayquasar18.github.io` (configured in `next-sitemap.config.js`)
- Canonical URL: `https://quanmofii.github.io/` (set in `src/app/layout.tsx` metadata)

**CI Pipeline:**
- GitHub Actions - `.github/workflows/nextjs.yml`
  - Trigger: Push to `master` branch or manual `workflow_dispatch`
  - Runner: `ubuntu-latest`, Node 20
  - Steps: checkout → detect package manager → setup Node → configure Pages → restore cache → install deps → build → generate sitemap → add `.nojekyll` → upload artifact → deploy
  - Deploy action: `actions/deploy-pages@v4`
  - Environment name: `QuanMofii`

**Manual Deploy Alternative:**
- `npm run deploy` - uses `gh-pages` package to push `./out` to GitHub Pages directly

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_BASE_PATH` - Controls `assetPrefix` and `basePath` in `next.config.ts`. Set to empty string for GitHub Pages root deployment. Injected automatically by `actions/configure-pages@v5` in CI.

**Secrets location:**
- `.env.local` - Local development (contains only `NEXT_PUBLIC_BASE_PATH=`)
- `.env.production` - Production environment (contains only `NEXT_PUBLIC_BASE_PATH=`)
- No secret API keys or tokens required - fully static site

## Webhooks & Callbacks

**Incoming:**
- None - Static site, no server to receive webhooks.

**Outgoing:**
- None - No outgoing HTTP calls from application code.

## SEO & Structured Data

**Sitemap:**
- `next-sitemap` 4.2.3 generates `sitemap.xml` and `robots.txt` into `./out/` at post-build
- Config: `next-sitemap.config.js` - siteUrl `https://rayquasar18.github.io`, weekly changefreq, priority 0.7

**Schema.org:**
- JSON-LD `Person` schema injected via `dangerouslySetInnerHTML` in `src/app/layout.tsx`
  - Links to GitHub, LinkedIn, and Twitter/X profiles via `sameAs`

**OpenGraph / Twitter Cards:**
- Fully configured in `src/app/layout.tsx` metadata export
- Share image: `https://quanmofii.github.io/share_img.png`

---

*Integration audit: 2026-03-13*
