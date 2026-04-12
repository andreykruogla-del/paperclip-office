import { NextResponse } from "next/server";
import type { AgentEvent } from "@/types/events";
import { addEvent, getEvents } from "@/lib/event-store";

export async function POST(request: Request) {
  const body = await request.json();
  const incoming: AgentEvent[] = Array.isArray(body) ? body : [body];

  for (const event of incoming) {
    addEvent(event);
  }

  console.log(`[events] Received ${incoming.length} event(s), total stored: ${getEvents().length}`);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(getEvents());
}
