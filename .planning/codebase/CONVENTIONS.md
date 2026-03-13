# Coding Conventions

**Analysis Date:** 2026-03-13

## Naming Patterns

**Files:**
- React components: PascalCase, e.g., `AnimatedText.tsx`, `ButtonRedirect.tsx`, `LoadingScreen.tsx`
- Section components: PascalCase with `Section` suffix, e.g., `HeroSection.tsx`, `ProjectSection.tsx`
- Config files: kebab-case, e.g., `next-sitemap.config.js`, `next.config.ts`
- CSS files: kebab-case, e.g., `globals.css`

**Functions / Components:**
- React components: PascalCase function declarations returned as default exports
- Arrow function components: `const ComponentName = () => { ... }`
- Event handlers: camelCase with `handle` prefix, e.g., `handleScroll`, `handleDownload`, `handleClickOutside`
- Boolean state variables: camelCase adjectives/past-tense, e.g., `isOpen`, `isLoaded`, `animateOut`, `showLoader`

**Variables:**
- State hooks: camelCase descriptive nouns, e.g., `activeSection`, `logoColor`, `initialScale`
- Ref hooks: camelCase with `Ref` suffix, e.g., `sectionRef`, `textRef`, `menuRef`, `bottomViewRef`, `infoRef`
- Motion values: camelCase, e.g., `mouseX`, `mouseY`, `smoothX`, `smoothY`
- Transform values: camelCase, e.g., `scaleX`, `scaleY`, `translateY`, `borderRadius`, `backgroundGradient`

**Types / Interfaces:**
- PascalCase interfaces with descriptive names, e.g., `AnimatedTextProps`, `BaseImageProps`, `ButtonRedirectProps`, `Project`
- Prop types follow the pattern `ComponentNameProps`
- Inline type annotations for simple props, e.g., `{ label: string; value: string }`

**Constants / Data:**
- Module-level data arrays: camelCase plurals, e.g., `menuItems`, `projects`, `infoItems`
- Environment-based constants: camelCase, e.g., `isProd`, `prefix`, `basePath`

## Code Style

**Formatting:**
- No dedicated Prettier config detected; relies on editor defaults
- Indentation: 2 spaces throughout
- Single quotes used in some files (`'use client'`), double quotes in others (`"use client"`); no enforced consistency
- Trailing commas present in multi-line arrays/objects
- Semicolons omitted in some files, present in others (mixed)

**Linting:**
- ESLint via `eslint.config.mjs`
- Extends `next/core-web-vitals` and `next/typescript`
- Config file: `eslint.config.mjs`
- Run: `npm run lint`

**TypeScript:**
- `strict: true` in `tsconfig.json`
- `skipLibCheck: true`
- Target: `ES2017`
- No explicit `any` observed in source

## Import Organization

**Order (observed pattern):**
1. React built-ins / directives (`"use client"`)
2. Third-party libraries (`framer-motion`, `lucide-react`, `next/*`, `ldrs`)
3. Internal components via `@/` alias (`@/components/...`)
4. Relative imports (`./AnimatedText`, `../ButtonRedirect`)
5. CSS imports last (e.g., `import "ldrs/react/Bouncy.css"`)

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)
- Usage: `import AnimatedText from "@/components/AnimatedText"`

**Directive Placement:**
- `"use client"` is placed at the very top of files that require browser APIs or interactivity
- Server components (layout with metadata) do NOT carry `"use client"`
- Most components are client components due to animation/scroll/state usage

## Error Handling

**Patterns:**
- Minimal error handling in the codebase
- `try/catch` used only in `LoadingScreen.tsx` for asset loading, with a fallback: on error, `setIsLoaded(true)` to prevent infinite loading state
- `console.error` used for logging errors (`src/components/LoadingScreen.tsx`)
- No global error boundaries present
- No error page (`error.tsx`) defined

## Logging

**Framework:** `console` (native)

**Patterns:**
- `console.error` used sparingly, only in `LoadingScreen.tsx`
- No structured logging or log levels in use

## Comments

**When to Comment:**
- Vietnamese-language inline comments used for developer notes, e.g., `// Đảm bảo tất cả assets được load xong`, `// Lớp grain (tuỳ chọn)`
- Comments used to explain intent of async asset-loading steps
- Large blocks of commented-out code present (e.g., disabled logo overlay in `Header.tsx`, disabled contact header in `Footer.tsx`)

**JSDoc/TSDoc:**
- Not used. No JSDoc comments on any component or function.

## Function Design

**Size:**
- Components are medium-length; sections with complex scroll animation (`HeroSection.tsx`, `IntroduceSection.tsx`) are 80-120 lines
- Simple presentational components (`BaseImage.tsx`, `BaseVideo.tsx`, `ButtonRedirect.tsx`) are 20-35 lines

**Parameters:**
- Props are always destructured in the function signature
- Optional props use `= ""` or `= false` defaults inline
- Example:
  ```tsx
  const AnimatedDiv = ({
    children,
    className = "",
    delay = 0,
    withRotate = true,
    initialScale = 1,
    finalScale = 1
  }: AnimatedDivProps) => { ... }
  ```

**Return Values:**
- Components always return JSX
- Early returns used for conditional rendering (e.g., `if (!showLoader) return null` in `LoadingScreen.tsx`)
- Fragment shorthand `<>...</>` used when wrapping without semantic element

## Module Design

**Exports:**
- All components use `export default ComponentName` at the bottom of the file
- Exception: `LoadingScreen.tsx` uses `export default function LoadingScreen()` inline
- No named exports for components
- No barrel (`index.ts`) files detected

**Prop Interfaces:**
- Defined locally in each component file
- Not shared across components; each file is self-contained

## Animation Conventions

**Framer Motion Usage:**
- Scroll-driven animations use `useScroll` + `useTransform` from `framer-motion`
- Viewport-triggered animations use `useInView` or `whileInView` on `motion.*` elements
- Reusable animation wrappers: `AnimatedText` (`src/components/AnimatedText.tsx`) and `AnimatedDiv` (`src/components/AnimatedDiv.tsx`)
- Spring transitions are the standard: `{ type: "spring", stiffness: 100, damping: 10 }`
- Standard entry animation: `{ y: 20, opacity: 0 }` → `{ y: 0, opacity: 1 }`
- Rotation on enter/exit: `rotate: 5` initial, `rotate: 0` animated (via `withRotate` prop)

## Tailwind CSS Conventions

**Approach:**
- Utility-first via Tailwind v4 classes applied directly in JSX `className`
- Responsive prefixes: `md:`, `lg:`, `xl:` for breakpoints
- State variants: `group`, `group-hover:`, `hover:`, `hidden`, `block`
- No custom component classes (`@apply`) defined beyond `:root` CSS variables in `globals.css`
- CSS variables defined in `:root` for background/foreground colors and custom fonts

---

*Convention analysis: 2026-03-13*
