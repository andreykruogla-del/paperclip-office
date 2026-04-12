import { NextResponse } from "next/server";
import { initSchema, getAllRuns, getEventsForRun, getParserDebug, type DbRun } from "@/server/db";

export async function GET() {
  initSchema();

  const runsFromDb = getAllRuns();
  const debug = getParserDebug();

  const runList = runsFromDb.map((row: DbRun) => {
    const events = getEventsForRun(row.run_id);
    const parsedEvents = events.map((e) => ({
      id: e.id,
      runId: e.run_id,
      agentId: e.agent_id,
      timestamp: e.timestamp,
      eventType: e.event_type,
      normalizedType: e.normalized_type,
      level: e.level,
      message: e.message,
      tokens: e.tokens,
      durationMs: e.duration_ms,
      error: e.error,
      raw: e.raw_json ? JSON.parse(e.raw_json) : undefined,
    }));
    return {
      runId: row.run_id,
      events: parsedEvents,
    };
  });

  return NextResponse.json({ runs: runList, debug });
}
