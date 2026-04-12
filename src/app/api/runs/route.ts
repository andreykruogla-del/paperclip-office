import { NextResponse } from "next/server";
import { initSchema, getAllRuns, getParserDebug, type DbRun } from "@/server/db";

export type RunSummary = {
  runId: string;
  agentId: string;
  status: string;
  eventCount: number;
  durationMs: number | null;
  totalTokens: number | null;
  startedAt: number | null;
  endedAt: number | null;
  mainError: string | null;
};

export async function GET() {
  initSchema();

  const runsFromDb = getAllRuns();
  const debug = getParserDebug();

  const summaries: RunSummary[] = runsFromDb.map((row: DbRun) => ({
    runId: row.run_id,
    agentId: row.agent_id,
    status: row.status,
    eventCount: row.event_count,
    durationMs: row.duration_ms,
    totalTokens: row.total_tokens,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    mainError: row.main_error,
  }));

  return NextResponse.json({ runs: summaries, debug });
}
