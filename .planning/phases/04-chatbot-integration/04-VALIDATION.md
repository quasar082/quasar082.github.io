---
phase: 4
slug: chatbot-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None detected — no test runner configured |
| **Config file** | None — Wave 0 note below |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual browser verification
- **Before `/gsd:verify-work`:** Full build must be green + all 6 manual scenarios pass
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | CHAT-01 | manual-only | Visual: sticky bar at bottom | N/A | ⬜ pending |
| TBD | 01 | 1 | CHAT-06 | manual-only | Refresh page, verify messages | N/A | ⬜ pending |
| TBD | 02 | 1 | CHAT-02 | smoke | `npm run build` (compilation) | N/A | ⬜ pending |
| TBD | 02 | 1 | CHAT-03 | manual-only | Send message, observe robot | N/A | ⬜ pending |
| TBD | 02 | 1 | CHAT-04 | manual-only | Visual: typing indicator | N/A | ⬜ pending |
| TBD | 02 | 1 | CHAT-05 | smoke | Disconnect network, verify fallback | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- No test framework installed — defer to a future testing phase
- Build verification (`npm run build`) is the only automated check available
- Manual test scenarios documented below serve as the verification plan

*Existing infrastructure (build check) covers compilation verification. No new test framework needed for this phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sticky input bar visible at bottom | CHAT-01 | Visual/layout verification | Open page, scroll up/down, verify bar stays at bottom of viewport |
| POST to LLM endpoint, response appears | CHAT-02 | Requires running API or mock mode | Type message, submit, verify response appears in chat |
| Robot emotion changes on response | CHAT-03 | Requires visual 3D model observation | Send message, observe robot animation changes to match emotion |
| Typing indicator during streaming | CHAT-04 | Visual animation verification | Submit message, verify bouncing dots + robot thinking animation |
| Fallback on API failure | CHAT-05 | Requires network manipulation | Disconnect network or use invalid endpoint, verify fallback message + robot idle |
| Chat history persists in localStorage | CHAT-06 | Requires page refresh cycle | Send messages, refresh page, verify messages still shown |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
