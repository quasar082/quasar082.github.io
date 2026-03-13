# Testing Patterns

**Analysis Date:** 2026-03-13

## Test Framework

**Runner:**
- Not configured. No `jest.config.*`, `vitest.config.*`, or any test runner detected in the project.

**Assertion Library:**
- None installed or configured.

**Run Commands:**
```bash
# No test commands defined in package.json scripts
# Available scripts:
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run deploy    # Build and deploy to GitHub Pages
```

## Test File Organization

**Location:**
- No test files exist in the codebase. No `*.test.*` or `*.spec.*` files found.

**Naming:**
- No convention established.

**Structure:**
- No test directory exists (no `__tests__/`, `tests/`, or `test/` directories).

## Test Structure

**Suite Organization:**
- Not applicable. No tests are written.

**Patterns:**
- None observed.

## Mocking

**Framework:** None

**Patterns:**
- Not applicable.

**What to Mock (recommendations for future test setup):**
- `process.env.NEXT_PUBLIC_BASE_PATH` — used in `BaseImage.tsx` and `BaseVideo.tsx` to prefix asset paths
- `window.addEventListener` / `IntersectionObserver` — used in `AnimatedText.tsx` for scroll visibility
- `framer-motion` animation hooks (`useInView`, `useScroll`) — to isolate component rendering from animation state

**What NOT to Mock (recommendations):**
- Tailwind className rendering — test via visual regression or snapshot instead
- Next.js `Image` and `Link` — use actual next/jest config to handle them

## Fixtures and Factories

**Test Data:**
- Not applicable. No fixtures exist.

**Location:**
- No fixture directory established.

## Coverage

**Requirements:** None enforced

**Configuration:**
- No coverage thresholds set (no jest/vitest config present)

**View Coverage:**
```bash
# No coverage command defined
# If vitest is added:
npx vitest run --coverage
# If jest is added:
npx jest --coverage
```

## Test Types

**Unit Tests:**
- Not implemented. Recommended targets:
  - `src/components/AnimatedText.tsx` — prop rendering, `once` toggle behavior
  - `src/components/AnimatedDiv.tsx` — initial/final scale prop behavior
  - `src/components/BaseImage.tsx` — `NEXT_PUBLIC_BASE_PATH` prefix logic
  - `src/components/BaseVideo.tsx` — `NEXT_PUBLIC_BASE_PATH` prefix logic
  - `src/components/InfoItem.tsx` — hover/click toggle state

**Integration Tests:**
- Not implemented. Recommended targets:
  - `src/components/Header.tsx` — scroll detection, active section tracking, menu open/close, click outside behavior
  - `src/components/LoadingScreen.tsx` — asset load lifecycle, timeout behavior, animate-out sequence

**E2E Tests:**
- Not used. No Playwright or Cypress configuration detected.

## Common Patterns

**Async Testing (recommended if added):**
```typescript
// For LoadingScreen asset-load flow
it('hides loader after assets load and timeout', async () => {
  jest.useFakeTimers()
  render(<LoadingScreen />)
  act(() => { jest.advanceTimersByTime(3000) })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
```

**Error Testing (recommended if added):**
```typescript
// For BaseImage basePath prefix
it('prepends NEXT_PUBLIC_BASE_PATH to src', () => {
  process.env.NEXT_PUBLIC_BASE_PATH = '/myapp'
  render(<BaseImage src="/avatar.jpg" alt="test" />)
  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', expect.stringContaining('/myapp/avatar.jpg'))
})
```

## Recommended Setup (if tests are introduced)

**Suggested stack:**
- Runner: Vitest (compatible with Next.js + Vite ecosystem) or Jest with `jest-environment-jsdom`
- Assertions: `@testing-library/react` + `@testing-library/jest-dom`
- Mocking: `vi.mock` (Vitest) or `jest.mock` (Jest)

**Suggested config file:** `vitest.config.ts` co-located at project root

**Suggested test directory structure:**
```
src/
  components/
    AnimatedText.tsx
    AnimatedText.test.tsx    # co-located unit tests
    BaseImage.tsx
    BaseImage.test.tsx
  app/
    page.tsx
    page.test.tsx
```

---

*Testing analysis: 2026-03-13*
