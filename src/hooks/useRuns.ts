"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { LogEvent, ParserDebugInfo } from "@/types/events";

export type RunSummary = {
  runId: string;
  agentId: string;
  status: string;
  eventCount: number;
  durationMs: number | null;
  totalTokens: number | null;
  mainError: string | null;
  endedAt: number | null;
};

export type RefreshState =
  | { status: "idle" }
  | { status: "refreshing" }
  | { status: "success"; at: Date }
  | { status: "error"; message: string };

export type UseRunsResult = {
  runs: RunSummary[];
  loading: boolean;
  debug: ParserDebugInfo | null;
  refreshState: RefreshState;
  refresh: () => Promise<void>;
};

const AUTO_REFRESH_MS = 45_000;

// ─── Small safe-fetch helper ──────────────────────────────

type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

/**
 * Fetch + parse JSON safely.
 * Checks response.ok, handles HTTP errors with status codes,
 * and catches JSON parse failures with a clear message.
 */
async function safeFetch<T>(url: string, init?: RequestInit): Promise<FetchResult<T>> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}`, status: res.status };
    }
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return { ok: false, error: "Invalid server response" };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ─── useRuns ──────────────────────────────────────────────

export function useRuns(): UseRunsResult {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<ParserDebugInfo | null>(null);
  const [refreshState, setRefreshState] = useState<RefreshState>({ status: "idle" });
  const refreshing = useRef(false);

  const fetchRuns = useCallback(async () => {
    try {
      const result = await safeFetch<{ runs: RunSummary[]; debug: ParserDebugInfo }>("/api/runs");
      if (!result.ok) {
        if (!loading) {
          setRefreshState({ status: "error", message: `Failed to load runs: ${result.error}` });
        }
        return;
      }
      const sorted = result.data.runs.sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0));
      setRuns(sorted);
      setDebug(result.data.debug ?? null);
      if (!loading) {
        setRefreshState({ status: "success", at: new Date() });
      }
    } catch {
      if (!loading) {
        setRefreshState({ status: "error", message: "Unexpected error loading runs" });
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    setRefreshState({ status: "refreshing" });

    try {
      const result = await safeFetch<{ success: boolean; error?: string }>("/api/refresh", {
        method: "POST",
      });

      if (!result.ok) {
        setRefreshState({
          status: "error",
          message: result.status === 409 ? "Refresh already in progress" : `Refresh failed: ${result.error}`,
        });
        return;
      }

      if (result.data.success) {
        await fetchRuns();
      } else {
        setRefreshState({
          status: "error",
          message: result.data.error ?? "Refresh failed",
        });
      }
    } catch {
      setRefreshState({ status: "error", message: "Unexpected error during refresh" });
    } finally {
      refreshing.current = false;
    }
  }, [fetchRuns]);

  // Initial load
  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(fetchRuns, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchRuns]);

  return { runs, loading, debug, refreshState, refresh };
}

// ─── useRunEvents ─────────────────────────────────────────

export function useRunEvents(runId: string | null) {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    safeFetch<{ events: LogEvent[] }>(`/api/runs/${encodeURIComponent(runId)}/events`)
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          const msg = result.status === 404
            ? "Run not found"
            : `Failed to load events (${result.error})`;
          setError(msg);
          setLoading(false);
          return;
        }
        setEvents(result.data.events ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unexpected error loading events");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [runId]);

  return { events, loading, error };
}
