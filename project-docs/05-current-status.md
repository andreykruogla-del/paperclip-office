# 05 — Current Status

**Last updated**: 2026-04-10

## Summary

The repo exists and a Next.js application has been initialized. Development is just starting.

## What's Done

- [x] Repository created
- [x] Next.js app initialized (`src/app/` with layout and home page)
- [x] Tailwind CSS v4 configured
- [x] TypeScript set up
- [x] ESLint configured
- [x] Project documentation scaffcreated (this docs folder)

## What's Next

1. Set up database layer (SQLite + Drizzle ORM)
2. Define core data models (Agent, Task, Handoff, Event)
3. Build Paperclip adapter for local setup
4. Start on agent list and status components

## Current Phase

**Phase 0 — Foundation**

## Open Questions / Blockers

| Item | Status |
|---|---|
| Exact Paperclip event format / API | 🔴 Need to investigate Paperclip internals |
| ORM choice (Drizzle vs Prisma vs raw) | 🟡 Leaning Drizzle for simplicity |
| Real-time transport (SSE vs WebSocket) | 🟡 SSE preferred for MVP |
| Design system / component library | 🟡 Will decide before Phase 1 UI work |

## How to Contribute Right Now

1. Clone the repo
2. `npm install`
3. `npm run dev` — see the running app
4. Read the project docs starting with `00-project-overview.md`
