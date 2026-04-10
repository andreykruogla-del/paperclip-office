# 00 — Project Overview

## Name

**Paperclip Office**

## Tagline

Visual control room for Paperclip-based multi-agent systems.

## What It Is

Paperclip Office is an open-source dashboard and operator console that gives you real-time visibility into running Paperclip agent systems. It shows who is doing what, what broke, what it cost, and lets you intervene when things go wrong.

## Problem

Running multi-agent systems with Paperclip is powerful but opaque. Operators lack a single place to see:
- Which agents are alive, idle, or failed
- Active tasks and their status
- Handoff chains between agents
- Error states and retry loops
- Token/compute cost in real time

Without observability, debugging multi-agent failures is guesswork.

## Solution

A self-hosted web application that:
1. Connects to a Paperclip setup (local, Docker, or remote)
2. Ingests agent state, task events, and cost metrics
3. Renders them in a clear, actionable dashboard
4. Lets operators pause, reroute, or restart agents

## Product Trajectory

| Stage | Description |
|---|---|
| **Phase 1 — OSS MVP** | Self-hosted dashboard: agents, tasks, handoffs, failures, cost. Real-time or near-real-time. |
| **Phase 2 — OSS+** | History, filtering, search, basic alerts. |
| **Phase 3 — SaaS** | Hosted Paperclip Office with persistent history, alerting (email/webhook), analytics, and team/role features. |

## Principles

- **Observability first** — every feature must improve operator visibility or control
- **Practical MVP** — ship useful subsets, iterate
- **No over-engineering** — simple architecture, proven tools
- **Product value over novelty** — avoid game-like complexity unless it clearly helps operators
