# 01 — Goals and Non-Goals

## Goals

1. **Visual operations map** — show the full team state at a glance: who is active, idle, stale, or failed
2. **Deep run investigation** — forensic inspection of individual runs with full event timelines, raw data access, and error context
3. **Operator attention localization** — surface which agent or run needs attention first, with clear "why" information
4. **Real agent identities** — every agent shown by its real role (CEO, CTO, Coder, QA, Observer), not generated labels
5. **Flow awareness** — make the team's bounded cycle (CEO → CTO → Coder → QA → Observer) visually explicit
6. **Future: tools & services map** — extend the operations map to show external dependencies, APIs, and tools as nodes
7. **Future: operator copilot** — assistive suggestions for attention priorities and recurring failure patterns
8. **Self-hosted, local-first** — fully self-hostable, editable profiles, no vendor lock-in

## Non-Goals

1. **Not a Paperclip replacement** — we observe and debug; Paperclip remains the orchestrator and execution engine
2. **Not a governance clone** — we don't replicate Paperclip's ticket system, issue tracker, or permission model
3. **Not a generic dashboard** — we solve one specific problem, not every possible monitoring need
4. **Not a game or simulation** — visual clarity over decorative complexity; operators need answers, not rooms
5. **Not an autonomous fixing system** — we surface problems; we don't auto-remediate them
6. **Not a metrics-first tool** — events and runs are primary; aggregated metrics are secondary
7. **Not a multi-tenant SaaS (yet)** — the OSS version is single-tenant/self-hosted; SaaS is a future phase
