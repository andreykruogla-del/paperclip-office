# 06 — Positioning and Distribution

## What Paperclip Office Is

Paperclip Office is a visual operations map and forensic run debugger for Paperclip multi-agent teams.

It is an **observer and investigator**, not an orchestrator. It helps operators understand team state and investigate failures — it does not run agents, schedule tasks, or manage permissions.

## What Paperclip Office Is Not

- Not a replacement for Paperclip
- Not a governance or control-plane clone
- Not a generic dashboard for all monitoring needs
- Not an autonomous agent system

## How It Complements Paperclip

Paperclip is the orchestrator. It runs agents, manages tasks, handles handoffs, and maintains the execution control plane.

Paperclip Office sits beside Paperclip as an **operator surface**:

```
Paperclip (orchestrator)  →  runs agents, manages tasks, handles handoffs
Paperclip Office (observer) →  shows team state, investigates failures, surfaces attention
```

The relationship is complementary:

- Paperclip produces events and run-logs
- Paperclip Office reads, parses, and visualizes them
- Paperclip Office never modifies Paperclip's execution state

## Why Operations Map + Run Forensics Is the Core

Operators of multi-agent systems face two fundamental questions:

1. **"Who needs my attention right now?"** — answered by the operations map
2. **"Why did this specific run fail?"** — answered by run forensics

Neither question can be answered cleanly by Paperclip's native interface alone, because Paperclip is built for execution, not observation. Paperclip Office fills this gap.

## Why Plugin / Distribution Path Matters

Paperclip Office is currently a standalone local-first application. This is intentional — it keeps development simple and validates the product shape before adding deployment complexity.

In the future, Paperclip Office could distribute as:

- A standalone desktop or web application (current form)
- A Paperclip plugin that adds an operations panel to the Paperclip interface
- A hosted service for teams that don't want to self-host

The plugin path is particularly important because it would make Paperclip Office a natural extension of Paperclip rather than a separate tool. This is a future direction, not a current implementation.

## Why Current Standalone Local-First Form Is a Bridge Step

The current form exists for three reasons:

1. **Validation** — we can iterate quickly on the operations map + forensics concept without deployment constraints
2. **Real data access** — direct NDJSON log parsing requires filesystem access that a hosted version would complicate
3. **Simplicity** — one Next.js app, one SQLite file, zero infrastructure

Once the product shape is validated with real operator usage, the distribution path becomes a product decision rather than a technical one.
