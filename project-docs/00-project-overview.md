# 00 — Project Overview

## Name

**Paperclip Office**

## Tagline

Visual operations map and forensic run debugger for Paperclip teams.

## What This Product Is

Paperclip Office is a visual operator surface for real Paperclip multi-agent teams. It gives operators a single place to:

- **see the team** — who is active, idle, stale, or failed
- **investigate failures** — deep forensic inspection of individual runs
- **understand flow** — how work is supposed to move through the team

It has two core layers:

- **Operations Map (OfficeOverview)** — spatial orientation layer showing agent identities, statuses, and roles. Answers "who should I look at?"
- **Run Debugger (RunView)** — detailed event timeline for a single run. Answers "why did this fail?"

Agent identity is first-class: every agent has a display name, role, and runtime — editable locally in `src/data/agent-profiles.local.ts`. Real production identities (e.g. Simfi-Mebel-AI: CEO, CTO, Coder, QA, Observer) have been confirmed via NDJSON log evidence and applied.

## Future Direction

The strongest form we see for Paperclip Office is:

1. **Operations Map** — the current orientation layer, expanded to show not just agents but also tools, services, and external dependencies as nodes in an operational map
2. **Run Forensics** — the current debugging core, deepened with cross-run correlation and pattern detection
3. **Operator Copilot** — a future assistive layer that suggests attention priorities, surfaces recurring failure patterns, and recommends actions — always assistive, never autonomous

## What This Product Is NOT

- **not a Paperclip replacement** — we observe and debug; Paperclip remains the orchestrator
- **not a governance/control-plane clone** — we don't replicate Paperclip's ticket, issue, or permission system
- **not a generic dashboard** — we solve one specific problem: operator attention and failure localization
- **not a game-like simulation** — clarity over spectacle
- **not an autonomous fixing system** — the copilot layer, if built, will suggest, not act

## Problem

Running multi-agent systems with Paperclip is powerful but opaque. Operators lack:

- a quick visual overview of team state
- a way to rapidly investigate why a specific run failed
- visibility into handoff chains and failure propagation
- a surface that surfaces attention needs before they become incidents

Without this, debugging is reactive, slow, and relies on reading raw logs.

## MVP Definition

The MVP is complete when:

- an operator can look at the screen and immediately see which agent needs attention
- an operator can click an agent and understand why its last run failed
- the system reflects the real team (not generated placeholders)
- data refreshes automatically without manual intervention

## Product Trajectory

| Phase | Name | Description |
|---|---|---|
| **Phase 0 — Forensic Run Viewer** | ✅ Working | Import Paperclip NDJSON logs, store in SQLite, deep run inspection. Validated against real remote data. |
| **Phase 1 — Operations Map** | 🔄 In progress | Real agent identities, auto-refresh, team flow awareness. OfficeOverview becomes the primary orientation layer. |
| **Phase 2 — Live Operations** | Planned | True streaming (SSE/webhook), freshness guarantees, alerting for critical failures. |
| **Phase 3 — Tools & Services** | Planned | Extend the operations map beyond agents to show tools, APIs, and external services as nodes. |
| **Phase 4 — Operator Copilot** | Planned | Assistive layer: pattern detection, attention prioritization, action recommendations. |
| **Phase 5 — Distribution** | Planned | Deployment paths, plugin system, multi-team support. |

## Core Principle

Every feature must answer:

> "Does this help the operator understand what is happening or decide where to act?"

If not — it should not be built.

## Principles

- **Operations map + run forensics** — two complementary surfaces: orientation and investigation
- **Complement, don't replace** — we augment Paperclip, we don't compete with it
- **Real identities over generated labels** — operators need "CEO" not "Agent A42"
- **Polling before streaming** — simple and reliable first, real-time when validated
- **Assistive, not autonomous** — copilot suggests; it does not execute
