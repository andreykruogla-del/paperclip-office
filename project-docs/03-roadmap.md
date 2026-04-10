# 03 — Roadmap

## Phase 0 — Foundation (Current)

**Goal**: Project scaffolding, tech decisions, dev environment

- [x] Create repo, initialize Next.js app
- [x] Configure Tailwind CSS
- [ ] Set up database (SQLite + Drizzle ORM)
- [ ] Define core data models (Agent, Task, Handoff, Event)
- [ ] Set up dev workflow (linting, formatting)

**Deliverable**: Running dev app with DB schema and seed data

---

## Phase 1 — Core Dashboard (MVP)

**Goal**: See agents, tasks, handoffs, failures, cost in real time

- [ ] Agent list with status indicators (alive/idle/working/failed)
- [ ] Task list with lifecycle state and assigned agent
- [ ] Handoff timeline/graph showing inter-agent task transfers
- [ ] Failure panel surfacing errors, stuck agents, retry loops
- [ ] Cost meter — token/compute usage per agent and per task
- [ ] Paperclip adapter for local setup (ingestion working)
- [ ] Basic operator actions: pause/resume agent

**Deliverable**: Self-hosted dashboard showing live data from a local Paperclip setup

---

## Phase 2 — Connectivity & Reliability

**Goal**: Support Docker and remote setups; improve real-time

- [ ] Docker adapter for Paperclip ingestion
- [ ] Remote/webhook adapter for Paperclip ingestion
- [ ] WebSocket or SSE-based real-time updates
- [ ] Event history with filtering and search
- [ ] Basic alerting (in-app notifications for failures)
- [ ] Error boundaries, loading states, offline fallback

**Deliverable**: Dashboard works with local, Docker, and remote Paperclip setups with real-time updates

---

## Phase 3 — OSS+ (Polish & Depth)

**Goal**: Make it production-ready for self-hosted users

- [ ] Persistent event history with time-range queries
- [ ] Cost trends and reports
- [ ] Agent/task detail pages with full event timeline
- [ ] Operator actions: reroute task, kill agent, retry failed
- [ ] Configuration UI (connection settings, thresholds)
- [ ] Documentation site / getting-started guide

**Deliverable**: Production-quality OSS release

---

## Phase 4 — SaaS Foundation

**Goal**: Multi-tenant, hosted version with premium features

- [ ] Migrate storage to PostgreSQL (multi-tenant)
- [ ] User accounts, teams, roles
- [ ] Alerting: email/webhook/Slack notifications
- [ ] Analytics dashboard (cost trends, agent performance)
- [ ] Billing infrastructure
- [ ] Hosted deployment on a cloud provider

**Deliverable**: Paid SaaS tier with history, alerts, analytics, and team features

---

## Phase 5 — Beyond (Future)

- [ ] API for third-party integrations
- [ ] Custom dashboard widgets
- [ ] Agent performance benchmarking
- [ ] Playbooks/runbooks for common failure patterns
- [ ] Audit logs and compliance features
