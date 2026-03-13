# Codebase Structure

**Analysis Date:** 2026-03-13

## Directory Layout

```
rayquasar18.github.io/
├── .github/
│   └── workflows/
│       └── nextjs.yml          # CI/CD: build and deploy to GitHub Pages
├── .planning/
│   └── codebase/               # GSD planning documents
├── public/
│   ├── hero/
│   │   └── video1.webm         # Hero section background video
│   ├── introduce/
│   │   └── video.mp4           # Introduce section video
│   ├── projects/
│   │   ├── project1.png        # Project card images
│   │   ├── project2.png
│   │   ├── project3.png
│   │   └── project4.png
│   ├── contract/
│   │   └── avatar.jpg          # Footer avatar image
│   ├── avatar.jpg              # General profile image
│   ├── share_img.png           # OG/Twitter card image
│   ├── HaMinhQuan_CV.pdf       # Downloadable CV
│   └── favicon.ico             # Site favicon
├── src/
│   ├── app/
│   │   ├── fonts/              # Local woff font files
│   │   │   ├── MarlinGeoSQ-Regular.woff
│   │   │   ├── MarlinGeoSQ-Medium.woff
│   │   │   ├── Saprona-Light.woff
│   │   │   ├── Saprona-Medium.woff
│   │   │   └── Saprona-Regular.woff
│   │   ├── _config.yml         # Jekyll config (GitHub Pages fallback)
│   │   ├── globals.css         # Tailwind import + CSS custom properties
│   │   ├── layout.tsx          # Root layout: HTML shell, fonts, metadata, persistent chrome
│   │   └── page.tsx            # Home page: section composition
│   └── components/
│       ├── sections/
│       │   ├── HeroSection.tsx       # Scroll-driven video reveal + quote zoom
│       │   ├── IntroduceSection.tsx  # Bio, video, info items
│       │   ├── AboutSection.tsx      # Placeholder section (stub)
│       │   └── ProjectSection.tsx    # Project grid with gradient background
│       ├── AnimatedDiv.tsx           # In-view scroll reveal wrapper
│       ├── AnimatedText.tsx          # Word-staggered text entrance animation
│       ├── BaseImage.tsx             # Next.js Image with base-path prefix
│       ├── BaseVideo.tsx             # Autoplay video with base-path prefix
│       ├── ButtonDownloadCV.tsx      # Animated CV download button
│       ├── ButtonRedirect.tsx        # Animated external link button
│       ├── Footer.tsx                # Contact info, social links, copyright
│       ├── GradientBackground.tsx    # Mouse-tracking radial gradient canvas
│       ├── Header.tsx                # Fixed nav with scroll-aware active state
│       ├── InfoItem.tsx              # Hover-flip label/value display row
│       └── LoadingScreen.tsx         # Full-screen loading overlay with ldrs spinners
├── .gitignore
├── next-sitemap.config.js            # Sitemap/robots.txt generation config
├── next.config.ts                    # Next.js build config: static export, base path
├── postcss.config.mjs                # PostCSS config for Tailwind v4
└── tsconfig.json                     # TypeScript config with @/* path alias
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router root — defines the single route, HTML shell, and global styles
- Contains: `layout.tsx`, `page.tsx`, `globals.css`, font files, `_config.yml`
- Key files: `src/app/layout.tsx` (metadata, fonts, chrome), `src/app/page.tsx` (page composition)

**`src/components/sections/`:**
- Purpose: Full-viewport scroll chapters. Each file is one visual section of the page.
- Contains: One `.tsx` file per section, each self-contained with its own animation logic
- Key files: `src/components/sections/HeroSection.tsx` (most complex, scroll-driven), `src/components/sections/ProjectSection.tsx` (data-driven grid)

**`src/components/`:**
- Purpose: Shared, reusable UI primitives used across sections
- Contains: Animation wrappers, media wrappers, buttons, layout chrome, visual effects
- Key files: `src/components/AnimatedText.tsx`, `src/components/AnimatedDiv.tsx`, `src/components/BaseImage.tsx`, `src/components/BaseVideo.tsx`

**`public/`:**
- Purpose: Static assets served at the root URL
- Contains: Images, videos, PDF, favicon. Organized into subdirectories by usage context.
- Key files: `public/HaMinhQuan_CV.pdf` (linked from `ButtonDownloadCV`), `public/share_img.png` (OG image)

**`.github/workflows/`:**
- Purpose: CI/CD pipeline for GitHub Pages deployment
- Contains: `nextjs.yml` — builds on push to `master`, runs `next build` + `next-sitemap`, uploads `./out` to GitHub Pages

**`src/app/fonts/`:**
- Purpose: Woff font files loaded via Next.js `localFont`
- Contains: MarlinGeoSQ (Regular, Medium) and Saprona (Light, Regular, Medium) — only MarlinGeoSQ variants are actively used in `layout.tsx`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell, all SEO metadata, font loading, persistent chrome (Header, Footer, LoadingScreen)
- `src/app/page.tsx`: Home page — only route, assembles sections

**Configuration:**
- `next.config.ts`: Static export mode, base path, asset prefix, image optimization disabled
- `tsconfig.json`: `@/*` alias maps to `src/*`
- `next-sitemap.config.js`: Sitemap generation targeting `https://rayquasar18.github.io`
- `postcss.config.mjs`: Tailwind v4 PostCSS plugin
- `.github/workflows/nextjs.yml`: Full CI/CD build and deploy pipeline

**Core Logic:**
- `src/components/sections/HeroSection.tsx`: Most architecturally complex component — scroll-driven animations using `useScroll`/`useTransform`
- `src/components/Header.tsx`: Active section tracking, logo color state, scroll listener
- `src/components/LoadingScreen.tsx`: Asset load gate, timed exit animation

**Static Assets:**
- `public/hero/video1.webm`: Hero background video
- `public/introduce/video.mp4`: Introduce section video
- `public/projects/`: Project card images (`project1.png` through `project4.png`)
- `public/HaMinhQuan_CV.pdf`: Downloadable CV

## Naming Conventions

**Files:**
- React components: PascalCase matching the exported component name — `AnimatedText.tsx`, `HeroSection.tsx`
- Config files: lowercase with extension convention — `next.config.ts`, `postcss.config.mjs`
- Public assets: lowercase with hyphens or camelCase — `video1.webm`, `share_img.png`, `HaMinhQuan_CV.pdf`

**Directories:**
- `sections/`: Grouping subdirectory for page-level section components
- `fonts/`: Grouping subdirectory for local font files within `app/`
- `public/` subdirectories: Named by content type/context (`hero/`, `projects/`, `contract/`, `introduce/`)

**Components:**
- Section components: Named `[Name]Section` — `HeroSection`, `ProjectSection`
- Animation wrappers: Named `Animated[Type]` — `AnimatedDiv`, `AnimatedText`
- Media wrappers: Named `Base[Type]` — `BaseImage`, `BaseVideo`
- Buttons: Named `Button[Action]` — `ButtonDownloadCV`, `ButtonRedirect`

## Where to Add New Code

**New Page Section:**
- Implementation: `src/components/sections/[Name]Section.tsx`
- Register in: `src/app/page.tsx` — add `<[Name]Section />` to the `<main>` block in the desired order
- Add nav entry: `src/components/Header.tsx` — add object to the `menuItems` array with `name` and `href`

**New Shared Component:**
- Implementation: `src/components/[ComponentName].tsx`
- Import via alias: `import ComponentName from "@/components/ComponentName"`

**New Static Asset:**
- Images/videos: `public/[context-dir]/[filename]`
- Reference via `BaseImage` or `BaseVideo` using path starting with `/` (base path prepended automatically)

**New Font:**
- Add `.woff`/`.woff2` file to `src/app/fonts/`
- Register with `localFont` in `src/app/layout.tsx` and apply the CSS variable to `<body>` className

## Special Directories

**`.planning/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: No — written by GSD map-codebase agents
- Committed: Yes

**`out/` (generated, not committed):**
- Purpose: Next.js static export output directory
- Generated: Yes — by `next build`
- Committed: No (in `.gitignore`) — uploaded as GitHub Pages artifact by CI

**`.next/` (generated, not committed):**
- Purpose: Next.js build cache and type generation
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-03-13*
