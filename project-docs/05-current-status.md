# 05 — Current Status

**Last updated**: 2026-04-10

## Product Phase

**Live Data Usability**

The product has moved beyond publication readiness into real live-data operation:

- Live Paperclip ingest works on large datasets (thousands of runs)
- 50/50 vertical split layout is the current operator baseline
- Identity mapping for unknown agents is honest and practical
- Failed-agent investigation flow works end-to-end

Remaining focus:
- Operator readability on noisy real datasets
- Practical identity mapping for new live agents
- No return to fake names or generated roles

## What Is Working

### Core
- **Run Debugger (RunView)** — full event timeline, raw data inspection, error display. Working against real remote Paperclip data.
- **RunList** — filtering, search, failure grouping. Operators can find problematic runs quickly.
- **SQLite persistence** — NDJSON parsed once, stored locally, read instantly.
- **Runs/events separation** — summaries load independently; events fetched on-demand per run.
- **Auto-select run on agent click** — clicking an agent auto-selects its latest failed run (or most recent if none failed).
- **50/50 vertical split** — operations map and investigation area each get half the viewport, neither can collapse the other.

### Operations Map
- **OfficeOverview** — spatial view of agents with status tabs (All/Failed/Stale/Active/Idle) and counts. Height-bounded so investigation area always remains visible.
- **Tools & Services layer** — secondary zone with semantic placeholder nodes. No live telemetry — seed examples anyone can customize.
- **Status tabs** — filter agents by status, default to Failed if any exist.
- **Auto-refresh** — 45s polling + manual refresh button (↻).

### Live Agent Identity
- **Honest fallback** — unknown agents show as `Agent abc12345` (short UUID), not fake generated names like "Executor 14".
- **Unmapped hints** — `(unmapped)` indicator shown in RunView and AgentSummary for agents without a profile.
- **Copyable UUID** — short ID becomes a clickable button for unmapped agents, copying the full UUID to clipboard for profile mapping.
- **Local mapping** — `src/data/agent-profiles.local.ts` is the single place to map live agent UUIDs to readable profiles. Updates are immediate, no restart needed.

## What Is Intentionally Deferred

- True streaming (SSE/webhook) — polling is sufficient until we have real operator feedback
- Live telemetry for tools/services — Phase 3, semantic placeholders first
- Operator copilot — Phase 4, need validated workflows first
- Production deployment — needs to happen before real operator access
- Auth layer — needed for production but premature for development validation

## What's Next (Priority Order)

1. **Operator readability on noisy datasets** — improve focus and signal on maps with 50+ agents
2. **First external showing** — get the tool in front of someone who actually runs Paperclip agents
3. **Production deployment** — host on a subdomain for real operator access
4. **True streaming ingest** — only after polling-based workflow is validated with real usage

## Local Paperclip Environment

- **Remote server**: Paperclip instance on remote host (SSH accessible)
- **Paperclip**: `paperclip-paperclip-1` (healthy), port 3110
- **Database**: `paperclip-paperclip-db-1` (PostgreSQL 17)
- **Confirmed team**: CEO, CTO, Coder, QA, Observer (5 agents)
- **All agents currently failed**: ChatGPT Codex credits exhausted (April 2026)

> **To map a live agent:** click an unmapped agent → click short ID to copy UUID → paste into `src/data/agent-profiles.local.ts`
>
> **To refresh data:** click ↻ in the header, or run `npm run import:paperclip`
