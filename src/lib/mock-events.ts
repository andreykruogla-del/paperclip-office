import type { ActivityEvent } from "@/types/dashboard";

export const mockEvents: ActivityEvent[] = [
  { id: "1", time: "12:01", title: "Agent planner started task routing", status: "ok" },
  { id: "2", time: "12:02", title: "Handoff sent to researcher", status: "ok" },
  { id: "3", time: "12:03", title: "Research agent response delayed", status: "warning" },
  { id: "4", time: "12:04", title: "Cost threshold check triggered", status: "ok" },
  { id: "5", time: "12:05", title: "Execution agent failed to parse result", status: "error" },
];
