import { NextResponse } from "next/server";
import { initSchema, getEventsForRun, type DbEvent } from "@/server/db";

export type ApiEvent = {
  id: string;
  runId: string;
  agentId: string;
  timestamp: number;
  eventType: string;
  normalizedType: string;
  level: string;
  message: string;
  tokens: number | null;
  durationMs: number | null;
  error: string | null;
  raw?: unknown;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  initSchema();
  
  const { runId } = await params;
  
  if (!runId) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  const dbEvents = getEventsForRun(runId);
  
  if (dbEvents.length === 0) {
    return NextResponse.json({ events: [], runId });
  }

  const events: ApiEvent[] = dbEvents.map((e: DbEvent) => ({
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

  return NextResponse.json({ events, runId });
}
