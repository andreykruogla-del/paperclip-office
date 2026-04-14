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

### 10. Operator control room, not a dashboard

- **Decision**: Paperclip Office is defined as an operator control room, not a dashboard
- **Why**:
  - dashboards show data
  - operators need clarity and actionability
  - focus must be on real-time understanding and intervention
- **Consequence**:
  - prioritize event interpretation over visualization
  - avoid feature creep
  - avoid UI-first thinking
- **Date**: 2026-04-10
- **Status**: Guiding principle

### 11. SQLite for parsed data, not reparsing on every request

- **Decision**: Parse Paperclip NDJSON logs once, store in local SQLite, read from DB
- **Why**:
  - Reparsing 9K+ events on every page load is too slow (300s+)
  - NDJSON logs are append-only — parse once, query many
  - Direct SQL with `better-sqlite3` keeps it simple — no ORM, no migrations framework
- **Consequence**:
  - Workflow: `import:paperclip` → open app → instant response
  - Re-import is safe (ON CONFLICT / INSERT OR IGNORE)
  - DB file is gitignored — no shared state
- **Date**: 2026-04-10
- **Status**: Implemented

### 12. Real agent identities grounded in remote evidence

- **Decision**: Agent display names in the UI are resolved through local profile mapping grounded in real runtime evidence, not synthetic generation
- **Why**:
  - Operators debugging real agent systems need to see "CEO" and "Coder", not "Planner 42"
  - Real identities (confirmed via NDJSON log evidence from remote Paperclip) improve operational clarity dramatically
  - Deterministic fallback is fine for unknown agents, but known agents should feel real
- **Consequence**:
  - `src/data/agent-profiles.local.ts` is the primary source of truth for agent identity
  - New teams require manual profile entries after inspecting their logs
  - Unknown agents remain visible but visually subordinate to known team members
- **Date**: 2026-04-10
- **Status**: Implemented

### 13. Polling-based refresh before true streaming

- **Decision**: Use periodic polling (45s) as the bridge between static snapshots and real-time streaming
- **Why**:
  - Full SSE/websocket infrastructure is premature before validating operator workflows
  - Polling is simple, reliable, and gives operators "fresh enough" data
  - Reuses existing import pipeline — no new infrastructure needed
  - Manual refresh (↻ button) gives explicit control when needed
- **Consequence**:
  - Data freshness has a delay (up to 45s)
  - Server load from periodic Docker reads
  - Acceptable trade-off for Phase 0 — streaming comes when we have real operator feedback
- **Date**: 2026-04-10
- **Status**: Implemented

### 14. Paperclip Office is an operations map + run forensics product

- **Decision**: The product's strongest form is a visual operations map (orientation layer) combined with deep forensic run debugging (investigation layer)
- **Why**:
  - Operators need both a quick team-state overview and the ability to drill into failures
  - Neither surface alone is sufficient — the map surfaces attention, the debugger explains why
  - This is different from a generic dashboard (which aggregates) or from Paperclip itself (which orchestrates)
- **Consequence**:
  - OfficeOverview is the orientation layer — must answer "who needs attention?"
  - RunView is the debugging core — must answer "why did this fail?"
  - Future tools/services visualization extends the operations map naturally
  - Copilot, if built, remains assistive — it suggests, never executes
- **Date**: 2026-04-10
- **Status**: Guiding principle

### 15. Reject fake generated agent names, use honest short-ID fallback

- **Decision**: Unknown agents show as `Agent abc12345` (short UUID), not fake generated names like "Executor 14" or "Planner 42"
- **Why**:
  - Fake names look like real agents but are meaningless — they confuse operators
  - Short UUID is honest, referenceable, and consistent
  - Operators can recognize unknowns and decide whether to map them
- **Consequence**:
  - Unknown agents are clearly labeled as `(unmapped)`
  - Clickable short ID copies full UUID for profile mapping
  - Manual mapping via `src/data/agent-profiles.local.ts` is the practical workflow
- **Date**: 2026-04-10
- **Status**: Implemented

### 16. 50/50 vertical split as main screen baseline

- **Decision**: Operations map and investigation area each get ~50% of viewport height, with internal scroll for overflow
- **Why**:
  - Previous layout let map grow unbounded and collapse investigation area
  - Fixed-height map (`max-h-64`) made map too narrow and lost value
  - 50/50 split keeps both surfaces visible and usable on any tab
- **Consequence**:
  - Map section has internal scroll for large agent counts
  - Investigation area always has sufficient space
  - Neither section can steal height from the other
- **Date**: 2026-04-10
- **Status**: Implemented
