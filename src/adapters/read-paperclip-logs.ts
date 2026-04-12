import { execSync } from "node:child_process";
import type { LogEvent, LogAnalysis, NormalizedEventType } from "@/types/events";

const LOG_BASE = "/paperclip/instances/default/data/run-logs";
const PARSER_VERSION = "paperclip-ndjson-v1";

/**
 * Reads Paperclip NDJSON run-logs, extracts agentId/runId from file paths,
 * normalizes events, and returns grouped data with debug metadata.
 */
export function readPaperclipLogs(): LogAnalysis {
  const output = execSync(
    `docker exec paperclip-paperclip-1 sh -lc "find ${LOG_BASE} -type f -name '*.ndjson' | sort | while read f; do echo FILE:"$f"; cat "$f"; done"`,
    { encoding: "utf-8", maxBuffer: 500 * 1024 * 1024 }
  );

  const events: LogEvent[] = [];
  const runs = new Map<string, LogEvent[]>();
  let unparsedCount = 0;
  let currentFilePath = "";

  for (const line of output.split("\n")) {
    if (line.startsWith("FILE:")) {
      currentFilePath = line.slice(5);
      continue;
    }
    if (!currentFilePath || !line.trim()) continue;

    const { agentId, runId } = parsePath(currentFilePath);

    try {
      const entry = JSON.parse(line);
      const ts = entry.ts;
      const chunkStr = entry.chunk;

      if (!ts || !chunkStr) {
        unparsedCount++;
        continue;
      }

      let chunk: Record<string, unknown>;
      try {
        chunk = JSON.parse(chunkStr);
      } catch {
        unparsedCount++;
        continue;
      }

      const eventType = mapEventType(chunk);
      if (!eventType) {
        unparsedCount++;
        continue;
      }

      const normalizedType = normalizeEventType(chunk, eventType);
      const level = mapLevel(chunk, eventType);
      const message = buildMessage(chunk, eventType);
      const error = extractError(chunk, eventType);
      const tokens = extractTokens(chunk);
      const durationMs = extractDuration(chunk);

      const event: LogEvent = {
        id: (typeof chunk.uuid === "string" && chunk.uuid) || `${runId}-${events.length}`,
        timestamp: new Date(ts).getTime(),
        agentId,
        runId,
        eventType,
        normalizedType,
        level,
        message,
        tokens,
        durationMs,
        error,
      };

      events.push(event);

      if (!runs.has(runId)) runs.set(runId, []);
      runs.get(runId)!.push(event);
    } catch {
      unparsedCount++;
      continue;
    }
  }

  events.sort((a, b) => a.timestamp - b.timestamp);

  return {
    events,
    runs,
    debug: {
      parserVersion: PARSER_VERSION,
      totalRuns: runs.size,
      totalEvents: events.length,
      unparsedCount,
    },
  };
}

function parsePath(filePath: string): { agentId: string; runId: string } {
  const parts = filePath.split("/");
  const filename = parts[parts.length - 1];
  const agentId = parts[parts.length - 2];
  const runId = filename.replace(/\.ndjson$/, "");
  return { agentId, runId };
}

// --- Raw event type mapping ---

function mapEventType(chunk: Record<string, unknown>): string | null {
  const type = chunk.type as string | undefined;
  if (type === "result") return (chunk.is_error as boolean) ? "task_failed" : "task_completed";
  if (type === "assistant") return "agent_activity";
  if (type === "user") return "user_input";
  return null;
}

// --- Normalized type ---

function normalizeEventType(chunk: Record<string, unknown>, rawEventType: string): NormalizedEventType {
  if (rawEventType === "agent_activity") return "activity";
  if (rawEventType === "user_input") return "input";
  if (rawEventType === "task_completed") return "result_success";
  if (rawEventType === "task_failed") return "result_error";
  return "unknown";
}

// --- Helpers ---

function mapLevel(chunk: Record<string, unknown>, eventType: string): "info" | "warning" | "error" {
  if (eventType === "task_failed") return "error";
  if (chunk.is_error === true) return "error";
  return "info";
}

function buildMessage(chunk: Record<string, unknown>, eventType: string): string {
  if (eventType === "task_completed") {
    const result = chunk.result as string | undefined;
    if (result) return result.substring(0, 120);
    return "Task completed";
  }
  if (eventType === "task_failed") {
    const err = chunk.error as Record<string, unknown> | undefined;
    if (err?.message) return (err.message as string).substring(0, 120);
    const result = chunk.result as string | undefined;
    if (result) return result.substring(0, 120);
    return "Task failed";
  }
  if (eventType === "agent_activity") {
    const content = chunk.message as Record<string, unknown> | undefined;
    const blocks = content?.content as unknown[] | undefined;
    if (Array.isArray(blocks)) {
      const textBlock = blocks.find(
        (b) => typeof b === "object" && b !== null && (b as Record<string, unknown>).type === "text"
      ) as Record<string, unknown> | undefined;
      if (textBlock?.text) return (textBlock.text as string).substring(0, 120);
      const thinking = blocks.find(
        (b) => typeof b === "object" && b !== null && (b as Record<string, unknown>).type === "thinking"
      ) as Record<string, unknown> | undefined;
      if (thinking?.thinking) return `[thinking] ${(thinking.thinking as string).substring(0, 120)}`;
    }
    return "Agent activity";
  }
  if (eventType === "user_input") return "User input received";
  return "Unknown event";
}

function extractError(chunk: Record<string, unknown>, eventType: string): string | undefined {
  if (eventType !== "task_failed") return undefined;
  const err = chunk.error as Record<string, unknown> | undefined;
  return (err?.message as string) || undefined;
}

function extractTokens(chunk: Record<string, unknown>): number | undefined {
  const usage = chunk.usage as Record<string, unknown> | undefined;
  if (usage && typeof usage.total_tokens === "number") return usage.total_tokens;
  return undefined;
}

function extractDuration(chunk: Record<string, unknown>): number | undefined {
  if (typeof chunk.duration_ms === "number") return chunk.duration_ms;
  return undefined;
}
