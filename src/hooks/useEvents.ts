"use client";

import { useState, useEffect } from "react";
import type { AgentEvent } from "@/types/events";

export function useEvents() {
  const [events, setEvents] = useState<AgentEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data);
      } catch {
        // keep existing state on error
      }
    };

    fetchEvents();
    const id = setInterval(fetchEvents, 2000);
    return () => clearInterval(id);
  }, []);

  return events;
}
