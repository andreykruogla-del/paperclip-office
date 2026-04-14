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

## Prerequisites

Before installing, ensure your environment meets these minimum requirements:

- **Node.js 20+** (LTS recommended)
- **npm 9+**
- **Python 3 + C++ build tools** (required by `better-sqlite3` native module)
  - On Debian/Ubuntu: `sudo apt install build-essential python3`
  - On Windows: Visual Studio Build Tools with C++ workload
  - On macOS: Xcode Command Line Tools (`xcode-select --install`)

### Environment Check

Run these quick checks to verify readiness:

```bash
node -v  # Expected: v20.x.x or higher
npm -v   # Expected: 9.x.x or higher
```

## Quick Start: Live Mode (Recommended for real usage)

Paperclip Office reads real Paperclip run-logs to build the operations map. It does not auto-discover running agents; you must point it to your Paperclip data.

### 1. Install dependencies

```bash
npm install
```

### 2. Import real logs

```bash
npm run import:paperclip
```

**What this does:** Connects to a running Paperclip Docker container (`paperclip-paperclip-1`) and reads NDJSON run-logs directly from its filesystem. Parsed data is stored locally in SQLite.

**Requirements:**
- Paperclip must be running in Docker
- Container name must be `paperclip-paperclip-1` (or update the script)
- You must have Docker CLI access

### 3. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`. You will see your real agents. Unknown agents will appear as `Agent abc12345` with an `(unmapped)` indicator. This is expected — see [Agent Identity Mapping](#agent-identity-mapping) below.

---

## Demo Mode (Preview Only)

Use this only to quickly preview the UI without a real Paperclip instance. **Not for production or real investigation.**

```bash
npm install
npm run import:sample  # Loads 11 synthetic sample runs
npm run dev
```

---

## What Success Looks Like

After `npm run dev`:

1. Open `http://localhost:3000`
2. You should see:
   - **Top half**: Operations map with agent stations and status tabs (All/Failed/Stale/Active/Idle)
   - **Bottom half**: Investigation panel (RunList + Run Inspector)
3. **If you ran `import:sample`**: You'll see 5 demo agents (CEO, CTO, Coder, QA, Observer) with realistic failure/recovery scenarios.
4. **If you ran `import:paperclip`**: You'll see your real agents. Unknown agents show as short UUIDs. This is normal.
5. Click any failed agent → the Run Inspector opens with a full event timeline and error messages.

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `better-sqlite3` build fails | Missing native build tools | Install Python 3 + C++ compiler, then `npm rebuild` |
| `import:paperclip` fails / "no logs found" | Paperclip not running or container name mismatch | Check `docker ps`, ensure `paperclip-paperclip-1` is running |
| Port 3000 already in use | Another process bound to 3000 | Set `PORT=3001 npm run dev` |
| Demo mode shows wrong data | Stale SQLite DB | Delete `paperclip-office.db` and re-run import |
| Live mode shows `Agent abc12345` | Real agents not yet mapped | Click short ID → copy UUID → add to `src/data/agent-profiles.local.ts` |

---

## Where Data Comes From

Paperclip Office **does not connect to agents directly** and **does not intercept traffic**. It works by reading Paperclip's output logs:

- **Demo mode**: Loads synthetic sample data bundled with the project.
- **Live mode**: Reads NDJSON run-logs from your Paperclip Docker volume, parses them, and stores them in local SQLite. The app then renders this parsed data.

If you install Paperclip Office on a fresh server, it will **not** automatically see your system. You must run `npm run import:paperclip` with access to your Paperclip logs.

---

## Agent Identity Mapping

Real agents initially appear as `Agent abc12345` (short UUID). This is intentional:

1. Click the unmapped agent card
2. In the Run Inspector header, click the short ID to copy the full UUID
3. Open `src/data/agent-profiles.local.ts` and add an entry:
   ```ts
   "full-uuid-here": {
     displayName: "ReadableName",
     role: "orchestration | implementation | verification | monitoring | unknown",
     runtime: "paperclip",
     description: "What this agent does",
     owner: "your-team",
   }
   ```
4. The UI updates immediately. No restart needed.

---

## How It Works

```
Paperclip NDJSON logs → Parser → SQLite → Operations Map + Run Debugger
```

1. **Import** — Logs are parsed once and stored locally
2. **Inspect** — Operations map shows team state; Run Inspector shows timelines
3. **Refresh** — Auto-refresh polls for new data every 45s; manual refresh available

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

Paperclip Office is exploring:

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
