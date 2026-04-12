"use client";

import { useState, useCallback } from "react";
import type { LogEvent } from "@/types/events";

export type EventsLoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; events: LogEvent[] }
  | { status: "error"; message: string };

export function useRunEvents() {
  const [state, setState] = useState<EventsLoadState>({ status: "idle" });

  const loadEvents = useCallback(async (runId: string) => {
    setState({ status: "loading" });
    
    try {
      const res = await fetch(`/api/runs/${encodeURIComponent(runId)}/events`);
      const data = await res.json();
      
      if (!res.ok) {
        setState({ status: "error", message: data.error ?? "Failed to load events" });
        return;
      }
      
      setState({ status: "success", events: data.events ?? [] });
    } catch (err) {
      setState({ 
        status: "error", 
        message: err instanceof Error ? err.message : "Failed to load events" 
      });
    }
  }, []);

  const clearEvents = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, loadEvents, clearEvents };
}
