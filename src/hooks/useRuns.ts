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
  startedAt: number | null;
  endedAt: number | null;
  mainError: string | null;
};

export type RunEntry = {
  runId: string;
  events: LogEvent[];
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

const AUTO_REFRESH_MS = 45_000; // 45 seconds

export function useRuns(): UseRunsResult {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<ParserDebugInfo | null>(null);
  const [refreshState, setRefreshState] = useState<RefreshState>({ status: "idle" });
  const refreshing = useRef(false);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/runs");
      const data = await res.json();
      const sorted = (data.runs as RunSummary[]).sort((a, b) => {
        const aTime = a.endedAt ?? a.startedAt ?? 0;
        const bTime = b.endedAt ?? b.startedAt ?? 0;
        return bTime - aTime;
      });
      setRuns(sorted);
      setDebug(data.debug ?? null);
      if (!loading) {
        setRefreshState({ status: "success", at: new Date() });
      }
    } catch {
      if (!loading) {
        setRefreshState({ status: "error", message: "Failed to fetch runs" });
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
      const res = await fetch("/api/refresh", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        await fetchRuns();
      } else {
        setRefreshState({
          status: "error",
          message: data.error ?? "Refresh failed",
        });
      }
    } catch (err) {
      setRefreshState({
        status: "error",
        message: err instanceof Error ? err.message : "Refresh failed",
      });
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
