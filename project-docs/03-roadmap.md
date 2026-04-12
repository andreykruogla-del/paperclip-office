# 03 — Roadmap

## Phase 0 — Forensic Run Viewer ✅ Working

**Goal**: Deep run inspection from real Paperclip data

- [x] NDJSON log parser for Paperclip run-logs
- [x] Event normalization (`activity`, `input`, `result_success`, `result_error`)
- [x] SQLite persistence (parse once, read fast)
- [x] RunList with filtering, search, and failure grouping
- [x] RunView with full event timeline, raw data access, error display
- [x] Real agent identities confirmed and applied (Simfi-Mebel-AI: CEO, CTO, Coder, QA, Observer)
- [x] Auto-refresh (45s polling) + manual refresh control
- [x] Orphaned/unknown agents handled with lower visual priority

**Deliverable**: Working forensic debugger connected to real remote Paperclip data

---

## Phase 1 — Operations Map 🔄 In Progress

**Goal**: The office becomes the primary orientation layer for a real team

- [x] OfficeOverview with real agent identities, roles, and runtime badges
- [x] Team context panel (team name + bounded cycle visualization)
- [x] Agent summary strip with description, owner, status, latest error
- [x] Core team stabilized in consistent visual order
- [x] Local editable profile layer (`src/data/agent-profiles.local.ts`)
- [x] Bounded cycle flow strip with live status dots
- [x] Tools/services zone in operations map (Scraper, Media Factory, WordPress, Mail, Chatwoot, Hermes, OpenAI)
- [x] Relation hints (agent ↔ tool topology)
- [x] Operations node detail panel (honest "no live telemetry" notice)
- [ ] Agent-to-agent handoff awareness between runs
- [ ] First production deployment for real operator access

**Deliverable**: Operations map that a real operator uses daily to understand team state

---

## Phase 2 — Live Operations

**Goal**: Move from polling to true streaming with alerting

- [ ] SSE or webhook-based event ingestion
- [ ] Live agent status updates without page reload
- [ ] Failure alerting (in-app + optional email/webhook)
- [ ] Agent health timeline (not just current state)
- [ ] Cross-run correlation (detect recurring failures)
- [ ] Cost tracking per agent per cycle

**Deliverable**: Real-time operational view with alerting for critical failures

---

## Phase 3 — Tools & Services Map

**Goal**: Extend the operations map beyond agents

- [ ] Tool/service node model (APIs, databases, external services)
- [ ] Visual map showing agent ↔ tool dependencies
- [ ] Service health monitoring
- [ ] Failure propagation visualization (agent → tool → downstream)
- [ ] Operations map zoom levels (team → tools → infrastructure)

**Deliverable**: Full operations map showing agents + tools + services as an interconnected system

---

## Phase 4 — Operator Copilot

**Goal**: Assistive intelligence layer

- [ ] Pattern detection (recurring failures, timing anomalies)
- [ ] Attention prioritization (rank agents/runs by urgency)
- [ ] Action suggestions ("rerun Coder", "check API key", "review CTO scope")
- [ ] Run similarity matching ("this failure looks like run #42")
- [ ] All suggestions are advisory — operator decides and acts

**Deliverable**: Copilot that reduces operator cognitive load without taking control

---

## Phase 5 — Distribution

**Goal**: Make Paperclip Office deployable and extensible

- [ ] Plugin system for custom adapters (new Paperclip setups, new runtimes)
- [ ] Deployment guides (Docker compose, single binary, cloud)
- [ ] Multi-team support (multiple Paperclip instances)
- [ ] Profile sharing/export (agent identities as config)
- [ ] Documentation site / getting-started guide

**Deliverable**: Production-ready OSS with clear deployment paths
