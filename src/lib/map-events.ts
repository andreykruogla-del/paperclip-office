import type { AgentEvent } from "@/types/events";
import type { ActivityEvent } from "@/types/dashboard";

const typeLabels: Record<AgentEvent["eventType"], string> = {
  agent_started: "Agent started",
  task_started: "Agent started task",
  task_completed: "Task completed",
  task_failed: "Task failed",
  handoff: "Task handed off",
  heartbeat: "Agent heartbeat",
};

function mapStatus(eventType: AgentEvent["eventType"]): ActivityEvent["status"] {
  if (eventType === "task_failed") return "error";
  if (eventType === "heartbeat") return "ok";
  return "ok";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
}

export function mapEvents(events: AgentEvent[]): ActivityEvent[] {
  return events.map((e) => ({
    id: e.eventId,
    time: formatTime(e.timestamp),
    title: `${typeLabels[e.eventType]}${e.agentId ? ` — ${e.agentId}` : ""}`,
    status: mapStatus(e.eventType),
  }));
}
