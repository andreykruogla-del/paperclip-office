export type AgentEvent = {
  eventId: string;
  timestamp: number;
  agentId: string;
  eventType:
    | "agent_started"
    | "task_started"
    | "task_completed"
    | "task_failed"
    | "handoff"
    | "heartbeat";
  taskId?: string;
  payload?: Record<string, unknown>;
};

export type NormalizedEventType =
  | "activity"
  | "input"
  | "result_success"
  | "result_error"
  | "unknown";

/**
 * Parsed event from Paperclip NDJSON run-logs.
 */
export type LogEvent = {
  id: string;
  timestamp: number;
  agentId: string;
  runId: string;
  eventType: string;
  normalizedType: NormalizedEventType;
  level: "info" | "warning" | "error";
  message: string;
  tokens?: number;
  durationMs?: number;
  error?: string;
  raw?: unknown;
};

export type ParserDebugInfo = {
  parserVersion: string;
  totalRuns: number;
  totalEvents: number;
  unparsedCount: number;
};

export type LogAnalysis = {
  events: LogEvent[];
  runs: Map<string, LogEvent[]>;
  debug: ParserDebugInfo;
};
