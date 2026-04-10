# 01 — Goals and Non-Goals

## Goals

1. **Real-time agent visibility** — show all agents, their status (alive/idle/working/failed), and current task
2. **Task and handoff tracking** — visualize task lifecycle and inter-agent handoffs as a readable timeline or graph
3. **Failure detection and surfacing** — highlight errors, stuck agents, and retry loops prominently
4. **Cost visibility** — display token usage and compute cost per agent and per task in real time
5. **Operator intervention** — allow operators to pause, resume, reroute, or kill agents from the UI
6. **Broad setup support** — work with local Paperclip installs, Docker-compose setups, and remote/cloud deployments
7. **Open-source first** — fully self-hostable, no vendor lock-in for the core dashboard

## Non-Goals (for now)

1. **Replacing Paperclip** — Paperclip Office observes and controls; it does not run agents itself
2. **Full agent orchestration** — we expose intervention points, but we don't build a competing orchestrator
3. **Game-like simulation environments** — visual complexity for its own sake is not a goal; clarity is
4. **Enterprise SSO/RBAC in v1** — nice to have for SaaS phase, not for OSS MVP
5. **Long-term analytics/ML** — cost and performance analytics come in SaaS phase; we don't over-build early
6. **Multi-tenant SaaS in OSS** — the OSS version is single-tenant/self-hosted; multi-tenancy is a SaaS concern
