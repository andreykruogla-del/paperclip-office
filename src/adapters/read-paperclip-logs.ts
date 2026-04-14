import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import type { LogEvent, LogAnalysis, NormalizedEventType } from "@/types/events";

const LOG_BASE = "/paperclip/instances/default/data/run-logs";
const PARSER_VERSION = "paperclip-ndjson-v1";

/** Diagnostic counters */
type DropReason = "no_chunk" | "bad_chunk" | "skip_plain_text" | "no_mapping" | "bad_json";

/**
 * Reads Paperclip NDJSON run-logs, extracts agentId/runId from file paths,
 * normalizes events, and returns grouped data with debug metadata.
 *
 * Handles both real Paperclip chunk format (string with multiple JSON objects)
 * and sample format (single JSON object).
 */
export function readPaperclipLogs(): LogAnalysis {
  // Step 1: Get the list of NDJSON files
  const fileList = execSync(
    `docker exec paperclip-paperclip-1 sh -lc "find ${LOG_BASE} -type f -name '*.ndjson' | sort"`,
    { encoding: "utf-8" }
  );
  const files = fileList.trim().split("\n").filter(Boolean);

  // Step 2: Create a temp dir and copy files locally (avoids PTY line-wrapping issues on SSH)
  const tmpDir = join(tmpdir(), `paperclip-logs-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  for (const filePath of files) {
    // Create subdirectory structure locally
    const relPath = filePath.replace(LOG_BASE + "/", "");
    const localPath = join(tmpDir, relPath);
    const localDir = localPath.substring(0, localPath.lastIndexOf("/"));
    mkdirSync(localDir, { recursive: true });

    // Use docker cp to avoid PTY line wrapping
    execSync(
      `docker cp paperclip-paperclip-1:"${filePath}" "${localPath}"`,
      { encoding: "utf-8" }
    );
  }

  // Step 3: Read files from local temp dir
  const events: LogEvent[] = [];
  const runs = new Map<string, LogEvent[]>();
  let linesRead = 0;
  let eventsParsed = 0;
  const dropReasons = new Map<string, number>();

  for (const filePath of files) {
    const { agentId, runId } = parsePath(filePath);
    const relPath = filePath.replace(LOG_BASE + "/", "");
    const localPath = join(tmpDir, relPath);
    const content = readFileSync(localPath, "utf-8");

    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      linesRead++;

      try {
        const entry = JSON.parse(line);
        const ts = entry.ts;
        const chunkStr = entry.chunk;

        if (!chunkStr || typeof chunkStr !== "string") {
          dropReasons.set("no_chunk", (dropReasons.get("no_chunk") || 0) + 1);
          continue;
        }

        // Decode the chunk string
        const decoded = JSON.parse(chunkStr) as unknown;

        // Case 1: decoded is already a JSON object (sample format)
        if (typeof decoded === "object" && decoded !== null && !Array.isArray(decoded)) {
          const event = makeEvent(decoded as Record<string, unknown>, ts, agentId, runId);
          if (event) {
            events.push(event);
            eventsParsed++;
            if (!runs.has(runId)) runs.set(runId, []);
            runs.get(runId)!.push(event);
          } else {
            dropReasons.set("no_mapping", (dropReasons.get("no_mapping") || 0) + 1);
          }
          continue;
        }

        // Case 2: decoded is a string containing multiple JSON objects (real Paperclip format)
        if (typeof decoded === "string") {
          // Skip plain text log lines like "[paperclip] Skipping saved session..."
          if (!decoded.startsWith("{")) {
            dropReasons.set("skip_plain_text", (dropReasons.get("skip_plain_text") || 0) + 1);
            continue;
          }

          // Split by \n and parse each JSON object
          const subLines = decoded.split("\n");
          for (const subLine of subLines) {
            if (!subLine.trim()) continue;
            try {
              const obj = JSON.parse(subLine) as Record<string, unknown>;
              const event = makeEvent(obj, ts, agentId, runId);
              if (event) {
                events.push(event);
                eventsParsed++;
                if (!runs.has(runId)) runs.set(runId, []);
                runs.get(runId)!.push(event);
              } else {
                dropReasons.set("no_mapping", (dropReasons.get("no_mapping") || 0) + 1);
              }
            } catch {
              dropReasons.set("bad_json", (dropReasons.get("bad_json") || 0) + 1);
            }
          }
          continue;
        }

        dropReasons.set("bad_chunk", (dropReasons.get("bad_chunk") || 0) + 1);
      } catch {
        dropReasons.set("bad_chunk", (dropReasons.get("bad_chunk") || 0) + 1);
      }
    }
  }

  events.sort((a, b) => a.timestamp - b.timestamp);

  // Clean up temp files
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }

  const linesDropped = linesRead - eventsParsed;

  return {
    events,
    runs,
    debug: {
      parserVersion: PARSER_VERSION,
      totalRuns: runs.size,
      totalEvents: events.length,
      unparsedCount: linesDropped,
      _diagnostics: {
        linesRead,
        eventsParsed,
        linesDropped,
        dropReasons: Object.fromEntries([...dropReasons.entries()].sort((a, b) => b[1] - a[1])),
      },
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

/**
 * Try to map a parsed JSON object to a LogEvent.
 * Supports both sample format (type: "result"|"assistant"|"user")
 * and real Paperclip format (type: "item.completed"|"turn.completed" etc).
 */
function makeEvent(
  obj: Record<string, unknown>,
  ts: string,
  agentId: string,
  runId: string
): LogEvent | null {
  // --- Real Paperclip format ---
  const objType = obj.type as string | undefined;

  if (objType === "item.completed") {
    const item = obj.item as Record<string, unknown> | undefined;
    if (!item) return null;
    const itemType = item.type as string | undefined;
    if (itemType === "agent_message") {
      return {
        id: (typeof item.id === "string" && item.id) || `${runId}-${ts}`,
        timestamp: new Date(ts).getTime(),
        agentId,
        runId,
        eventType: "agent_activity",
        normalizedType: "activity",
        level: "info",
        message: extractTextFromItem(item),
      };
    }
    if (itemType === "command_execution") {
      const exitCode = item.exit_code as number | null;
      if (exitCode !== null && exitCode !== 0) {
        return {
          id: (typeof item.id === "string" && item.id) || `${runId}-${ts}`,
          timestamp: new Date(ts).getTime(),
          agentId,
          runId,
          eventType: "agent_activity",
          normalizedType: "activity",
          level: "warning",
          message: `Command exited ${exitCode}: ${item.command ?? "unknown"}`,
        };
      }
      // Successful commands — skip to avoid noise
      return null;
    }
    return null;
  }

  if (objType === "turn.completed") {
    const usage = obj.usage as Record<string, unknown> | undefined;
    return {
      id: `turn-${ts}`,
      timestamp: new Date(ts).getTime(),
      agentId,
      runId,
      eventType: "task_completed",
      normalizedType: "result_success",
      level: "info",
      message: "Run completed",
      tokens: typeof usage?.total_tokens === "number" ? usage.total_tokens : undefined,
    };
  }

  if (objType === "turn.error") {
    return {
      id: `turn-error-${ts}`,
      timestamp: new Date(ts).getTime(),
      agentId,
      runId,
      eventType: "task_failed",
      normalizedType: "result_error",
      level: "error",
      message: (obj.error as string) ?? "Turn error",
      error: (obj.error as string) ?? "Turn error",
    };
  }

  // --- Sample format ---
  if (objType === "result") {
    const isError = obj.is_error as boolean;
    return {
      id: (typeof obj.uuid === "string" && obj.uuid) || `${runId}-${ts}`,
      timestamp: new Date(ts).getTime(),
      agentId,
      runId,
      eventType: isError ? "task_failed" : "task_completed",
      normalizedType: isError ? "result_error" : "result_success",
      level: isError ? "error" : "info",
      message: extractSampleMessage(obj, isError),
      error: isError ? extractSampleError(obj) : undefined,
      durationMs: typeof obj.duration_ms === "number" ? obj.duration_ms : undefined,
      tokens: extractSampleTokens(obj),
      raw: obj,
    };
  }

  if (objType === "assistant") {
    return {
      id: (typeof obj.uuid === "string" && obj.uuid) || `${runId}-${ts}`,
      timestamp: new Date(ts).getTime(),
      agentId,
      runId,
      eventType: "agent_activity",
      normalizedType: "activity",
      level: "info",
      message: extractAssistantMessage(obj),
      durationMs: typeof obj.duration_ms === "number" ? obj.duration_ms : undefined,
      tokens: extractSampleTokens(obj),
      raw: obj,
    };
  }

  if (objType === "user") {
    return {
      id: (typeof obj.uuid === "string" && obj.uuid) || `${runId}-${ts}`,
      timestamp: new Date(ts).getTime(),
      agentId,
      runId,
      eventType: "user_input",
      normalizedType: "input",
      level: "info",
      message: "User input received",
      raw: obj,
    };
  }

  // thread.started, turn.started, item.started — skip, not actionable
  return null;
}

// --- Extraction helpers for real Paperclip format ---

function extractTextFromItem(item: Record<string, unknown>): string {
  const text = item.text as string | undefined;
  if (text) return text.substring(0, 120);
  const command = item.command as string | undefined;
  if (command) return `cmd: ${command.substring(0, 80)}`;
  return "Agent activity";
}

// --- Extraction helpers for sample format ---

function extractSampleMessage(obj: Record<string, unknown>, isError: boolean): string {
  if (isError) {
    const err = obj.error as Record<string, unknown> | undefined;
    if (err?.message) return (err.message as string).substring(0, 120);
  }
  const result = obj.result as string | undefined;
  if (result) return result.substring(0, 120);
  return isError ? "Task failed" : "Task completed";
}

function extractSampleError(obj: Record<string, unknown>): string | undefined {
  const err = obj.error as Record<string, unknown> | undefined;
  return (err?.message as string) || undefined;
}

function extractSampleTokens(obj: Record<string, unknown>): number | undefined {
  const usage = obj.usage as Record<string, unknown> | undefined;
  if (usage && typeof usage.total_tokens === "number") return usage.total_tokens;
  return undefined;
}

function extractAssistantMessage(obj: Record<string, unknown>): string {
  const msg = obj.message as Record<string, unknown> | undefined;
  const blocks = msg?.content as unknown[] | undefined;
  if (Array.isArray(blocks)) {
    for (const b of blocks) {
      if (typeof b === "object" && b !== null) {
        const block = b as Record<string, unknown>;
        if (block.type === "text" && typeof block.text === "string") {
          return block.text.substring(0, 120);
        }
        if (block.type === "thinking" && typeof block.thinking === "string") {
          return `[thinking] ${block.thinking.substring(0, 100)}`;
        }
      }
    }
  }
  return "Agent activity";
}
