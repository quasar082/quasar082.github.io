---
phase: 2
slug: i18n-foundation-lab-aesthetic
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Build validation (next build) — no unit test framework for this phase |
| **Config file** | none — Wave 0 adds build verification script |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build && ls out/en/index.html out/vi/index.html out/404.html` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build && ls out/en/index.html out/vi/index.html out/404.html`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | I18N-01 | smoke | `npx next build && test -f out/en/index.html && test -f out/vi/index.html` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | I18N-05 | smoke | `npx next build && ls -la out/en/ out/vi/` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | FNDN-05 | manual | Visual inspection in browser | N/A | ⬜ pending |
| 02-02-02 | 02 | 1 | UX-01 | manual | Visual inspection across all pages | N/A | ⬜ pending |
| 02-03-01 | 03 | 2 | I18N-02 | manual | Click EN/VI in browser, verify URL and text change | N/A | ⬜ pending |
| 02-03-02 | 03 | 2 | I18N-03 | manual | Visual review: no hardcoded strings in components | N/A | ⬜ pending |
| 02-03-03 | 03 | 2 | I18N-04 | manual | Clear localStorage, visit `/`, check redirect matches browser lang | N/A | ⬜ pending |
| 02-04-01 | 04 | 2 | FNDN-03 | smoke | `npx next build && grep -l 'hreflang' out/en/index.html out/vi/index.html` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Add `"test:build": "next build"` to package.json scripts
- [ ] Create `scripts/verify-build.sh` — checks output files exist for both locales
- [ ] No unit test framework needed for this phase — build validation is the primary automated check

*Note: A formal test framework (vitest or playwright) should be introduced in Phase 3+ when testable logic exists.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lab aesthetic grid background visible | FNDN-05, UX-01 | Visual/CSS styling, cannot be automated without visual regression tools | Open dev server, verify dark grid background on all pages |
| Language switcher toggles locale | I18N-02 | Requires browser interaction | Click EN/VI toggle, verify URL changes and text updates |
| All UI text from translation files | I18N-03 | Requires manual review of components | Search for hardcoded strings in components, verify all text uses t() |
| Language detection and persistence | I18N-04 | Requires browser API interaction | Clear localStorage, visit `/`, verify redirect; set language, revisit, verify persistence |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
