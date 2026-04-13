# 05 — Current Status

**Last updated**: 2026-04-10

## Product Phase

**Publication Readiness**

Phase 0 (Forensic Run Viewer) is functionally complete. Phase 1 (Operations Map) is implemented with core features. README publication pass is done. The product is now ready for a first external showing.

Remaining focus is publication-oriented:
- First external feedback from operators who actually use Paperclip
- Production deployment for real access
- No return to long internal polishing cycles

## What Is Working

### Core
- **Run Debugger (RunView)** — full event timeline, raw data inspection, error display. Working against real remote Paperclip data.
- **RunList** — filtering, search, failure grouping. Operators can find problematic runs quickly.
- **SQLite persistence** — NDJSON parsed once, stored locally, read instantly.
- **Runs/events separation** — run summaries load independently; events are fetched on-demand when a run is opened. Keeps payload lightweight and forensic flow scalable.

### Operations Map
- **OfficeOverview** — isometric spatial view of the real 5-agent team (CEO, CTO, Coder, QA, Observer). Statuses, roles, runtime badges.
- **Tools & Services layer** — secondary zone with configured semantic placeholder nodes (Scraper, Media Factory, CMS, Mail Intake, LLM API). No live telemetry — these are seed examples that anyone can customize.
- **Relation hints** — light topology hints showing how agents and tools might connect (e.g. Coder → Media Factory → CMS). Symbolic role-based relations, not environment-specific.
- **Team Context Panel** — shows bounded cycle flow (CEO → CTO → Coder → QA → Observer) with role-based action descriptions.
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

1. **First external showing** — get the tool in front of someone who actually runs Paperclip agents
2. **Production deployment** — host on a subdomain for real operator access
3. **Feedback-driven iteration** — fix what operators actually need, not what we imagine they might want
4. **True streaming ingest** — only after polling-based workflow is validated with real usage

## Local Paperclip Environment

- **Remote server**: Paperclip instance on remote host (SSH accessible)
- **Paperclip**: `paperclip-paperclip-1` (healthy), port 3110
- **Database**: `paperclip-paperclip-db-1` (PostgreSQL 17)
- **Confirmed team**: CEO, CTO, Coder, QA, Observer (5 agents)
- **All agents currently failed**: ChatGPT Codex credits exhausted (April 2026)

> **To edit agent profiles:** open `src/data/agent-profiles.local.ts`
>
> **To refresh data:** click ↻ in the header, or run `npm run import:paperclip`
