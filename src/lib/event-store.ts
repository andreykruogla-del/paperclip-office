import type { AgentEvent } from "@/types/events";

const MAX_EVENTS = 100;
let events: AgentEvent[] = [];

export function addEvent(event: AgentEvent) {
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }
}

export function getEvents(): AgentEvent[] {
  return [...events];
}
