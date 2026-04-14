/**
 * Shared Paperclip log import logic.
 * Used by both CLI script and refresh API.
 *
 * Server-only — imports better-sqlite3 and node:child_process.
 */

import { readPaperclipLogs } from "@/adapters/read-paperclip-logs";
import { initSchema, importRun } from "@/server/db";

export type ImportResult = {
  success: boolean;
  runsImported: number;
  eventsImported: number;
  completedRuns: number;
  failedRuns: number;
  diagnostics?: {
    linesRead: number;
    eventsParsed: number;
    linesDropped: number;
    dropReasons: Record<string, number>;
  };
  error?: string;
  timestamp: number;
};

export function importAllLogs(): ImportResult {
  initSchema();

  const { runs, debug } = readPaperclipLogs();

  let importedRuns = 0;
  let importedEvents = 0;
  let completedRuns = 0;
  let failedRuns = 0;

  for (const [runId, events] of runs) {
    importRun(runId, events, debug.parserVersion);
    importedRuns++;
    importedEvents += events.length;

    const status = events.some((e) => e.normalizedType === "result_error") ? "failed" : "completed";
    if (status === "completed") completedRuns++;
    else failedRuns++;
  }

  return {
    success: true,
    runsImported: importedRuns,
    eventsImported: importedEvents,
    completedRuns,
    failedRuns,
    diagnostics: debug._diagnostics,
    timestamp: Date.now(),
  };
}
