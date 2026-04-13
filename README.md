# Paperclip Office

Visual operations map and forensic run debugger for Paperclip teams.

> This project is independent and not affiliated with the official Paperclip project.

## What It Is

Paperclip Office is a local-first operator surface for Paperclip multi-agent systems. It gives operators:

- **An operations map** — a spatial view of the team: who is active, idle, stale, or failed
- **Run forensics** — deep investigation of individual runs with full event timelines, raw data, and error context
- **Flow awareness** — visibility into how work is supposed to move through the team

It **complements** Paperclip. It does not replace it.

## Why It Exists

Running multi-agent systems with Paperclip is powerful but opaque. When something fails, operators are left reading raw NDJSON logs and guessing what went wrong.

Paperclip Office turns those logs into:

- an immediate visual overview of team state
- a fast way to drill into any failed run and see exactly why it broke
- a structured understanding of agent identities, roles, and handoff flow

## What You'll See

After launching the app, you get two main surfaces:

- **Operations Map** — a spatial overview showing agents as stations with live statuses, plus a secondary zone for tools and services your agents may depend on
- **Run Inspector** — click any run to see a full event timeline with raw data access, error messages, and token usage

Agent identities are local-first and editable: you define who your agents are in a simple config file. Seed examples are included for common role patterns (CEO, CTO, Coder, QA, Observer).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Import Paperclip logs (requires a local Docker Paperclip instance)
npm run import:paperclip

# 3. Start the app
npm run dev
```

Open `http://localhost:3000` to see the operations map.

## How It Works

```
Paperclip NDJSON logs → Parser → SQLite → Operations Map + Run Debugger
```

1. **Import** — NDJSON run-logs are parsed once and stored in local SQLite
2. **Inspect** — Operations map shows team state; Run Inspector shows individual run timelines
3. **Refresh** — Auto-refresh polls for new data every 45s; manual refresh available on demand

## What Already Works

| Area | Status |
|---|---|
| NDJSON log parser for Paperclip run-logs | ✅ |
| Event normalization and type mapping | ✅ |
| SQLite persistence | ✅ |
| Operations map with agent statuses | ✅ |
| Tools/services contextual layer | ✅ |
| Run inspection with full timeline + raw data | ✅ |
| Agent identity layer (local editable profiles) | ✅ |
| Auto-refresh + manual refresh | ✅ |
| Unit tests on core derivation logic | ✅ |

## Current Limitations

| Area | Status |
|---|---|
| Streaming (SSE/webhook) | Polling-based refresh for now |
| Tool/service telemetry | Semantic placeholders — no live health checks |
| Multi-team support | Single team per instance |
| Auth / production hosting | Not yet |

These are intentional trade-offs for an MVP-first approach, not missing features.

## Project Docs

For deeper technical details, see the project documentation:

| Doc | Purpose |
|---|---|
| [00 — Project Overview](project-docs/00-project-overview.md) | What this product is and where it's going |
| [01 — Goals & Non-Goals](project-docs/01-goals-and-non-goals.md) | What we build and what we don't |
| [03 — Roadmap](project-docs/03-roadmap.md) | Phase-by-phase plan |
| [04 — Decisions Log](project-docs/04-decisions-log.md) | Key architectural and product decisions |
| [05 — Current Status](project-docs/05-current-status.md) | What works now, what's deferred, what's next |
| [07 — Positioning & Distribution](project-docs/07-positioning-and-distribution.md) | Product boundary and future distribution path |

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- better-sqlite3 (local persistence)
- Vitest (unit tests)

## License

See [LICENSE](LICENSE).
