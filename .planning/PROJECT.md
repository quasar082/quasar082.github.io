# RayQuasar Portfolio

## What This Is

A personal portfolio website for an AI Engineer specializing in NLP, LLM, AI architecture design, multi-agent systems, and RAG pipelines. The site features an interactive 3D robot character that users can chat with via a chatbot powered by an LLM backend, showcasing both the owner's personality and technical capabilities. The motto is "Make Wall-E can love again <3".

## Core Value

The interactive 3D robot chatbot experience — a cute robot that responds with emotions and animations based on LLM-generated answers — must work flawlessly. This is the centerpiece that differentiates this portfolio from all others and demonstrates AI engineering skills in action.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Next.js project structure — existing
- ✓ Basic sections layout (Hero, Introduce, Projects, Footer) — existing
- ✓ Animation components (AnimatedDiv, AnimatedText) — existing
- ✓ Video/Image components with loading states — existing
- ✓ CV download functionality — existing
- ✓ SEO setup with next-sitemap — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Interactive 3D robot model in hero section with emotion-based animations
- [ ] Chatbot with sticky bottom input bar, connected to LLM backend API
- [ ] LLM response includes answer + emotion to control robot animations
- [ ] Hero section with static black hole background image + 3D robot foreground
- [ ] Dark-only theme with lab-style grid/caro pattern background
- [ ] Introduce/About section — storytelling format with text + images
- [ ] Projects section — card grid with detail pages per project
- [ ] Blog system — full featured with tags, search, TOC, code highlighting, series (from .md files)
- [ ] Internationalization (i18n) — Vietnamese + English
- [ ] Full SEO — meta tags, OG image, sitemap, structured data
- [ ] Scroll animations — fade/slide effects, tasteful not overwhelming
- [ ] Footer with social links (email, LinkedIn, GitHub)
- [ ] Responsive design — mobile, tablet, desktop
- [ ] Clean, optimized code — demonstrating frontend engineering skills

### Out of Scope

- Light mode / theme toggle — dark-only design, consistent with lab aesthetic
- Contact form — links only, no backend email service needed
- Real-time chat (WebSocket) — standard request/response sufficient
- Mobile app — web only
- CMS / admin panel — blog posts managed as .md files in repo
- User authentication — public portfolio, no login needed
- Animated/video hero background — static image, robot provides the motion

## Context

- **Existing codebase:** Next.js project with basic sections already built (Hero, Introduce, Projects, Footer). Has animation components, video/image handling, and SEO config.
- **3D Model:** Owner will provide .glb/.gltf file of a cute robot character. Needs Three.js/React Three Fiber integration for rendering and emotion-based animations.
- **Backend API:** LLM chatbot API will be provided later. Placeholder endpoint: `test/api/v1/...`. Response format: `{ answer: string, emotion: string }` where emotion controls robot animations.
- **Design references:**
  - Hero: Dark space theme with black hole imagery, 3D robot center stage
  - Other sections: Dark background with grid/caro pattern (lab aesthetic), similar to RAGFlow website style
- **Target audience:** Recruiters and tech companies looking for AI engineers
- **Owner expertise:** AI Engineer — NLP, LLM, AI architecture, multi-agent systems, agentic AI, RAG architect. Builds and designs AI pipelines for applications.

## Constraints

- **Tech stack**: Next.js (latest), React Three Fiber for 3D, TypeScript, Tailwind CSS
- **Performance**: 3D model must load efficiently, lazy load where possible. Page should score well on Lighthouse.
- **Code quality**: Production-grade code — clean architecture, proper typing, optimized bundles. This portfolio IS the resume.
- **3D dependency**: Robot model file (.glb/.gltf) will be provided later — build with placeholder/fallback
- **API dependency**: LLM backend API endpoint TBD — build with mock/placeholder responses
- **i18n**: Vietnamese and English, with language switcher

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark-only theme | Matches lab/tech aesthetic, simpler implementation, consistent brand | — Pending |
| React Three Fiber for 3D | Standard React integration for Three.js, clean component model | — Pending |
| Static blog from .md files | No CMS dependency, version controlled, developer-friendly | — Pending |
| Sticky bottom chat input | Always accessible, doesn't interfere with content, follows user | — Pending |
| Emotion from LLM response | Backend controls robot behavior, cleaner separation of concerns | — Pending |
| Storytelling about section | More engaging than timeline/cards, shows personality | — Pending |

---
*Last updated: 2026-03-13 after initialization*
