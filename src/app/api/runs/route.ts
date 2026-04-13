import { NextResponse } from "next/server";
import { initSchema, getAllRuns, getParserDebug } from "@/server/db";

export async function GET() {
  initSchema();

  const runsFromDb = getAllRuns();
  const debug = getParserDebug();

  const runList = runsFromDb.map((row) => ({
    runId: row.run_id,
    agentId: row.agent_id,
    status: row.status,
    eventCount: row.event_count,
    durationMs: row.duration_ms,
    totalTokens: row.total_tokens,
    mainError: row.main_error,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  }));

  return NextResponse.json({ runs: runList, debug });
}
