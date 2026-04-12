# 06 — Event Schema v0

## What Is an Event

An event is an immutable record of something that happened in a Paperclip agent system at a specific point in time.

## Why Events, Not State

- State is derived from events, not the other way around
- Events give you full audit history for free
- Events enable replay, debugging, and analytics
- State snapshots lie or go stale — events never do

This is why Paperclip Office is **event-first**.

## Required Fields

| Field | Type | Description |
|---|---|---|
| `event_id` | string | Unique identifier |
| `timestamp` | number | Unix timestamp (ms) |
| `agent_id` | string | Which agent produced this event |
| `event_type` | string | What happened |
| `task_id` | string? | Optional — related task |
| `payload` | object? | Optional — extra context |

## Event Types

| Type | Meaning |
|---|---|
| `agent_started` | Agent came online |
| `task_started` | Agent began working on a task |
| `task_completed` | Task finished successfully |
| `task_failed` | Task failed with error |
| `handoff` | Task transferred between agents |
| `heartbeat` | Agent is alive (periodic) |

## Example

```json
{
  "event_id": "evt_abc123",
  "timestamp": 1744300800000,
  "agent_id": "agent_planner_01",
  "event_type": "handoff",
  "task_id": "task_42",
  "payload": {
    "target_agent": "agent_researcher_03",
    "reason": "need_context_gathering"
  }
}
```
