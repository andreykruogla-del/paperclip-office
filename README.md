# Paperclip Office

Visual operations map and forensic run debugger for Paperclip teams.

> This project is independent and not affiliated with the official Paperclip project.

## What It Is

Paperclip Office is a local-first operator surface for real Paperclip multi-agent systems. It gives you:

- **Operations map** — a spatial view of your team: who is active, idle, stale, or failed
- **Run forensics** — deep investigation of individual runs with full event timelines and raw data access
- **Flow awareness** — visibility into how work is supposed to move through your team

It complements Paperclip. It does not replace Paperclip.

## Why It Exists

Running multi-agent systems with Paperclip is powerful but opaque. When something fails, operators are left reading raw NDJSON logs and guessing what went wrong.

Paperclip Office turns those logs into:

- an immediate visual overview of team state
- a fast way to drill into any failed run and see exactly why it broke
- a structured understanding of agent identities, roles, and handoff flow

## Current Product Shape

### What already works

| Area | Status |
|---|---|
| NDJSON log parser for Paperclip run-logs | ✅ |
| Event normalization and type mapping | ✅ |
| SQLite persistence (parse once, read fast) | ✅ |
| RunList with filtering, search, failure grouping | ✅ |
| RunView — full event timeline, raw data, errors | ✅ |
| OfficeOverview — spatial team view with statuses | ✅ |
| Tools/services zone in operations map | ✅ |
| Relation hints (agent ↔ tool topology) | ✅ |
| Real agent identities (CEO, CTO, Coder, QA, Observer) | ✅ |
| Local editable profile layer | ✅ |
| Auto-refresh (45s polling) + manual refresh | ✅ |
| Bounded cycle flow visualization | ✅ |

### What is intentionally not built yet

| Area | Reason |
|---|---|
| True streaming (SSE/webhook) | Polling is sufficient until we have real operator feedback |
| Live tool/service telemetry | Phase 3 — semantic placeholders first, health checks later |
| Operator copilot | Phase 4 — need validated workflows before assistive AI |
| Multi-team support | Phase 5 — single-team is enough for validation |
| Auth / production deployment | Needed before real operator access, premature during development |

## How It Works

1. **Import** — Paperclip NDJSON run-logs are parsed once and stored in local SQLite
2. **Inspect** — Operations map shows team state; RunView shows individual run timelines
3. **Refresh** — Auto-refresh pulls latest data every 45s; manual refresh (↻) available on demand

```
Paperclip NDJSON logs → Parser → SQLite → Operations Map + Run Debugger
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Import Paperclip logs (requires local Docker Paperclip instance)
npm run import:paperclip

# 3. Start the app
npm run dev
```

Open `http://localhost:3000` to see the operations map.

## Agent Profiles

Agent identities are defined in `src/data/agent-profiles.local.ts`. The file includes confirmed profiles for the Simfi-Mebel-AI team and can be extended for any Paperclip setup.

```ts
export const LOCAL_AGENT_PROFILES = {
  "your-agent-uuid": {
    displayName: "Agent Name",
    role: "orchestration",
    runtime: "paperclip",
    description: "What this agent does",
    owner: "your-team",
  },
};
```

## Project Docs

| Doc | Purpose |
|---|---|
| [00 — Project Overview](project-docs/00-project-overview.md) | What this product is and where it's going |
| [01 — Goals & Non-Goals](project-docs/01-goals-and-non-goals.md) | What we build and what we don't |
| [03 — Roadmap](project-docs/03-roadmap.md) | Phase-by-phase plan |
| [04 — Decisions Log](project-docs/04-decisions-log.md) | Key architectural and product decisions |
| [05 — Current Status](project-docs/05-current-status.md) | What works now, what's deferred, what's next |
| [06 — Event Schema v0](project-docs/06-event-schema-v0.md) | Event model for Paperclip run-logs |
| [07 — Positioning & Distribution](project-docs/07-positioning-and-distribution.md) | Product boundary and future distribution path |

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- better-sqlite3 (local persistence)

## License

See [LICENSE](LICENSE).
