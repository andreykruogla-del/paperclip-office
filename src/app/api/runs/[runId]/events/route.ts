import { NextResponse } from "next/server";
import { initSchema, getEventsForRun } from "@/server/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  initSchema();

  const { runId } = await params;
  const events = getEventsForRun(runId);

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

  return NextResponse.json({ events: parsedEvents });
}
