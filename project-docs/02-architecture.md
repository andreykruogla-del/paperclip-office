# 02 — Architecture

## High-Level Overview

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Paperclip   │─────▶│  Paperclip       │─────▶│   Paperclip     │
│  (local)     │      │  Office Backend  │      │  Office UI      │
│              │      │  (API + Ingest)  │      │  (Next.js)      │
└─────────────┘      └──────────────────┘      └─────────────────┘
┌─────────────┐      ┌──────────────────┐
│  Paperclip   │─────▶│  Storage         │
│  (Docker)    │      │  (SQLite / DB)   │
└─────────────┘      └──────────────────┘
┌─────────────┐
│  Paperclip   │─────▶  (remote via API)
│  (remote)    │
└─────────────┘
```

## Components

### Frontend (Next.js App)

- **Framework**: Next.js (App Router) with React Server Components
- **Styling**: Tailwind CSS v4
- **Real-time**: WebSocket or Server-Sent Events for live updates
- **Rendering**: Client components for interactive panels, server components for initial data

### Backend / API

- **Approach**: Next.js Route Handlers (API routes within the same app)
- **Responsibilities**:
  - Ingest agent events from Paperclip (push or poll)
  - Store and query agent/task/handoff/cost data
  - Push real-time updates to the frontend
  - Expose REST endpoints for operator actions (pause, resume, etc.)

### Storage

- **MVP**: SQLite (via better-sqlite3 or Drizzle ORM) — zero-config, self-hosted friendly
- **Future**: Pluggable — PostgreSQL for SaaS multi-tenant phase

### Paperclip Integration Layer

- **Adapter pattern** — each Paperclip deployment type (local, Docker, remote) has a connector
- **Local**: Direct file/socket or localhost API polling
- **Docker**: Docker API or sidecar container emitting events
- **Remote**: HTTP webhook or polling against remote Paperclip API

## Key Design Decisions

- **Monorepo-style single app** — frontend and backend in one Next.js app for simplicity
- **No separate backend service for MVP** — keep deployment friction minimal
- **Event-driven ingestion** — prefer push (webhooks) over polling where possible
- **SQLite-first** — works out of the box, swappable later
