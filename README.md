# Paperclip Office

Operator-grade visual control room for Paperclip multi-agent systems.

> This project is independent and not affiliated with the official Paperclip project.

## What It Is

Paperclip Office helps operators **understand where their agent system broke and why**.

It provides:

- **An operations map** — a spatial view of the team: who is active, idle, stale, or failed
- **Run forensics** — deep investigation of individual runs with full event timelines, raw data, and error context
- **Flow awareness** — visibility into how work is supposed to move through the team

It **complements** Paperclip. It does not replace it.

This is not a generic metrics dashboard, a cozy agent office, or a simulation toy. It is an operator-grade operational investigation map.

## Why It Exists

Running multi-agent systems with Paperclip is powerful but opaque. When something fails, operators are left reading raw NDJSON logs and guessing what went wrong.

Paperclip Office turns those logs into:

- an immediate visual overview of team state
- a fast way to drill into any failed run and see exactly why it broke
- a structured understanding of agent identities, roles, and handoff flow

## What You'll See

After launching the app, you get two main surfaces:

- **Operations Map** — agents as stations with statuses, status tabs (All/Failed/Stale/Active/Idle), and a secondary zone for tools/services your agents may depend on
- **Run Inspector** — click any run to see a full event timeline with raw data access, error messages, and token usage

Unknown agents appear honestly as `Agent abc12345` (short UUID) with an `(unmapped)` indicator. Click the short ID to copy the full UUID and map it to a readable profile in one config file.

## Quick Start

### Option A: Demo with sample data (no Paperclip needed)

```bash
# 1. Install dependencies
npm install

# 2. Load sample demo data
npm run import:sample

# 3. Start the app
npm run dev
```

Open `http://localhost:3000` to see the operations map with realistic sample data.

### Option B: Connect to a real Paperclip instance

```bash
npm install

# Import logs from a local Docker Paperclip instance
npm run import:paperclip

npm run dev
```

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
| Operations map with status tabs | ✅ |
| Tools/services contextual layer | ✅ |
| Run inspection with full timeline + raw data | ✅ |
| Agent identity layer (honest fallback + local profiles) | ✅ |
| Auto-refresh + manual refresh | ✅ |
| Unit tests on core derivation logic | ✅ |
| Live data import on real Paperclip instances | ✅ |

## Current Limitations

| Area | Status |
|---|---|
| Streaming (SSE/webhook) | Polling-based refresh for now |
| Tool/service telemetry | Semantic placeholders — no live health checks |
| Multi-team support | Single team per instance |
| Auth / production hosting | Not yet |

These are intentional trade-offs for an MVP-first approach, not missing features.

## Where This Is Going

Paperclip Office is building toward:

- **Handoff-aware investigation** — seeing not just a failed run, but the chain of work handoff between agents
- **Cross-run failure correlation** — understanding when a failure is part of a recurring pattern, not a one-off
- **Failure propagation** — showing where the circuit broke and what downstream effects followed
- **Incident/evidence packets** — assembling a run, related runs, involved agents, and raw evidence into an exportable investigation packet
- **Richer operator attention model** — surfacing what needs attention first on noisy real datasets

These are future directions, not current implementation promises.

## Project Docs

For deeper technical details, see the project documentation:

| Doc | Purpose |
|---|---|
| [00 — Project Overview](project-docs/00-project-overview.md) | What this product is and where it's going |
| [01 — Goals & Non-Goals](project-docs/01-goals-and-non-goals.md) | What we build and what we don't |
| [03 — Roadmap](project-docs/03-roadmap.md) | Structured direction: Now / Next / Later |
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
