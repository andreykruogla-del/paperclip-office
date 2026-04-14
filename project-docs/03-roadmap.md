# 03 — Roadmap

## Now — Current Baseline

**Goal**: Operator-grade operations map + forensic run debugging

The product already provides real investigative value on live Paperclip data.

- [x] NDJSON log parser for Paperclip run-logs
- [x] Event normalization and type mapping
- [x] SQLite persistence (parse once, read fast)
- [x] Runs/events separation — summaries load independently, events lazy-loaded on demand
- [x] RunList with filtering, search, and failure grouping
- [x] RunView — full event timeline, raw data access, error display
- [x] OfficeOverview — spatial team view with status tabs (All/Failed/Stale/Active/Idle) and counts
- [x] 50/50 vertical split: map + investigation baseline
- [x] Status tabs with counts, default to Failed if any exist
- [x] Auto-select run on agent click (failed first, then most recent)
- [x] Honest short-ID fallback for unknown agents (no fake generated names)
- [x] Unmapped hints + copyable UUID in RunView for live agent mapping
- [x] Local editable profile layer (`src/data/agent-profiles.local.ts`)
- [x] Tools/services contextual layer (seed examples)
- [x] Relation hints (agent ↔ tool topology)
- [x] Auto-refresh (45s polling) + manual refresh
- [x] Sample/demo path for first external showing
- [x] Live data import on real Paperclip instances
- [x] Unit tests on core derivation logic
- [x] CI workflow (lint + test + build)

---

## Next — Near-Term Direction

**Goal**: Improve investigation depth and operator readability on noisy real datasets

These are the next practical improvements, not distant ideas.

- [ ] **Handoff chain reconstruction** — seeing the sequence of work transfers between agents, not just isolated runs
- [ ] **Recurring failure grouping** — understanding when a failure is a pattern, not a one-off
- [ ] **Incident/evidence packet** — assembling a failed run, related runs, involved agents, and raw evidence into an exportable investigation packet (markdown/JSON)
- [ ] **Better operator attention model** — surfacing what needs attention first when the map has 50+ agents
- [ ] **Live tool/service telemetry** — moving from semantic placeholders to actual health signals
- [ ] **First production deployment** — hosting for real operator access and external feedback

---

## Later — Structured Future Direction

**Goal**: Deeper system understanding and assistive investigation

These are acknowledged future directions, not current commitments.

- [ ] **Failure propagation view** — showing where the circuit broke and what downstream effects followed across agents and services
- [ ] **Tool/service evidence model** — distinguishing agent fault vs external system fault
- [ ] **Cross-run pattern intelligence** — grouping related failures, identifying systemic issues
- [ ] **Richer ingest/correlation pipeline** — handoff detection, tool/service event linking, evidence confidence scoring
- [ ] **Advisory copilot layer** — summaries, likely root-cause hints, suggested next checks (assistive only, never autonomous)

---

## Hypotheses — Working Questions

These are open questions that may or may not become product features.

- **Not all "agents" in the data are equal participants**: some may be ephemeral subtask workers. If so, the operations map needs to distinguish stable team members from transient workers.
- **Agent-consumable observability**: Paperclip Office may later become useful not only to human operators, but also to assisting agents, as a structured observability context layer.
- **Shared context layer**: a future version could provide structured investigation context for both humans and agents, not just visual surfaces.

---

## What We Will NOT Build

To stay focused, we explicitly exclude:

- Decorative/cozy office aesthetics (pixel art, animated workers, room editors)
- Generic metrics dashboards
- Agent orchestration or control-plane replacement
- Autonomous execution systems
- SaaS before validated operator demand
