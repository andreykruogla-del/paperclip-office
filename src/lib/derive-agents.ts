import type { AgentEvent } from "@/types/events";

export type DerivedAgent = {
  id: string;
  lastSeen: number;
  lastEventType: string;
  status: "active" | "idle" | "stale";
};

const STALE_THRESHOLD = 5000;

export function deriveAgents(events: AgentEvent[]): DerivedAgent[] {
  const map = new Map<string, AgentEvent>();

  for (const event of events) {
    const existing = map.get(event.agentId);
    if (!existing || event.timestamp > existing.timestamp) {
      map.set(event.agentId, event);
    }
  }

  const now = Date.now();

  return Array.from(map.values()).map((e) => {
    const age = now - e.timestamp;
    const status =
      age > STALE_THRESHOLD
        ? "stale"
        : e.eventType === "task_started"
          ? "active"
          : "idle";

    return {
      id: e.agentId,
      lastSeen: e.timestamp,
      lastEventType: e.eventType,
      status,
    };
  });
}
