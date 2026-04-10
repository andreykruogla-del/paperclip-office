# 04 — Decisions Log

Record of key architectural and product decisions with rationale.

---

## Decisions Made

### 1. Next.js (App Router) as the framework

- **Decision**: Use Next.js 16 with App Router
- **Rationale**: Single codebase for frontend and API routes, React Server Components, strong ecosystem, SSR/SSG flexibility
- **Date**: 2026-04-10
- **Status**: ✅ Implemented

### 2. Tailwind CSS for styling

- **Decision**: Use Tailwind CSS v4
- **Rationale**: Fast iteration, utility-first approach, good defaults, zero runtime config overhead
- **Date**: 2026-04-10
- **Status**: ✅ Implemented

### 3. SQLite for MVP storage

- **Decision**: Use SQLite as the default database
- **Rationale**: Zero-config, self-hosted friendly, sufficient for single-tenant MVP. Pluggable to PostgreSQL later for SaaS phase
- **Date**: 2026-04-10
- **Status**: Planned

### 4. Monolith architecture (no separate backend)

- **Decision**: Keep frontend and backend in one Next.js app
- **Rationale**: Minimizes deployment complexity for MVP. Can extract later if needed
- **Date**: 2026-04-10
- **Status**: Planned

### 5. OSS-first, self-hosted product

- **Decision**: Core dashboard is open-source and fully self-hostable
- **Rationale**: Builds trust, community, and adoption. SaaS adds value on top (hosting, history, alerts, teams) rather than gating core features
- **Date**: 2026-04-10
- **Status**: Guiding principle

### 6. Real-time via WebSocket or SSE

- **Decision**: Use Server-Sent Events (SSE) or WebSocket for live updates
- **Rationale**: Operators need near-real-time visibility without page refreshes. SSE is simpler to implement; WebSocket if bidirectional is needed
- **Date**: 2026-04-10
- **Status**: Planned (SSE preferred initially)

### 7. Adapter pattern for Paperclip connectivity

- **Decision**: Abstract Paperclip connection behind adapter interfaces (local, Docker, remote)
- **Rationale**: Different deployment types have different event ingestion mechanisms. Adapters keep core logic clean and testable
- **Date**: 2026-04-10
- **Status**: Planned

### 8. No game-like complexity in UI

- **Decision**: Avoid gamified or overly visual interfaces unless they demonstrably improve operator control
- **Rationale**: This is an operational tool. Clarity and speed of understanding > visual spectacle
- **Date**: 2026-04-10
- **Status**: Guiding principle

### 9. Every feature must improve observability or control

- **Decision**: Reject features that don't directly help operators see or control their agent systems
- **Rationale**: Focuses development effort on product value. Prevents scope creep
- **Date**: 2026-04-10
- **Status**: Guiding principle
