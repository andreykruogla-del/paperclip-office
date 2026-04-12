# 05 — Current Status

**Last updated**: 2026-04-10

## Product Phase

**Phase 1 — Operations Map** (transitioning from Phase 0)

Phase 0 (Forensic Run Viewer) is functionally complete. We are now in Phase 1, making the operations map the primary daily surface for operators.

## What Is Working

### Core
- **Run Debugger (RunView)** — full event timeline, raw data inspection, error display. Working against real remote Paperclip data.
- **RunList** — filtering, search, failure grouping. Operators can find problematic runs quickly.
- **SQLite persistence** — NDJSON parsed once, stored locally, read instantly.

### Operations Map
- **OfficeOverview** — isometric spatial view of the real 5-agent team (CEO, CTO, Coder, QA, Observer). Statuses, roles, runtime badges.
- **Tools & Services layer** — secondary zone showing configured infrastructure nodes (Scraper, Media Factory, WordPress, Mail Processor, Chatwoot, Hermes, OpenAI/Codex). No live telemetry — semantic placeholders based on known topology.
- **Relation hints** — light topology showing how agents and tools connect (e.g. Coder → Media Factory → WordPress).
- **Team Context Panel** — shows team name (Simfi-Mebel-AI) and bounded cycle flow (CEO → CTO → Coder → QA → Observer).
- **Agent Summary** — selected agent shows profile, status, latest error, run counts.
- **Operations Node Summary** — selected tool/service shows label, kind, category, description, and honest "no live telemetry" notice.
- **Auto-refresh** — 45s polling + manual refresh button (↻).

### Identity Layer
- **Real agent profiles** applied from `src/data/agent-profiles.local.ts` — grounded in NDJSON log evidence from remote server.
- **Orphaned agents** handled with lower visual priority (subdued, labeled "unknown").
- **Deterministic fallback** for any new unknown agents.

## What Is Intentionally Deferred

- True streaming (SSE/webhook) — polling is sufficient until we have real operator feedback
- Live telemetry for tools/services — Phase 3, semantic placeholders first
- Operator copilot — Phase 4, need validated workflows first
- Production deployment — needs to happen before real operator usage
- Auth layer — needed for production but premature for development validation

## What's Next (Priority Order)

1. **Production deployment** — host on a subdomain for real operator access
2. **First operator usage loop** — watch how the team actually uses the debugger + operations map
3. **True streaming ingest** — only after we validate the polling-based workflow
4. **Live tool/service telemetry** — health checks for non-agent nodes

## Local Paperclip Environment

- **Remote server**: `simfi-mebel-ai` at `5.129.223.47`
- **Paperclip**: `paperclip-paperclip-1` (healthy), port 3110
- **Database**: `paperclip-paperclip-db-1` (PostgreSQL 17)
- **Confirmed team**: CEO, CTO, Coder, QA, Observer (5 agents, 144 NDJSON run files)
- **All agents currently failed**: ChatGPT Codex credits exhausted (April 2026)

> **To edit agent profiles:** open `src/data/agent-profiles.local.ts`
>
> **To refresh data:** click ↻ in the header, or run `npm run import:paperclip`
