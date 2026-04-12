"use client";

import { useState, useMemo } from "react";
import type { LogEvent } from "@/types/events";
import type { RunEntry } from "@/hooks/useRuns";
import { getAgentProfile, getAgentShortId } from "@/lib/agent-profiles";

function shortId(id: string) {
  return id.substring(0, 8);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRunStatus(events: LogEvent[]): "success" | "failed" {
  const lastResult = [...events].reverse().find(
    (e) => e.eventType === "task_completed" || e.eventType === "task_failed"
  );
  return lastResult?.eventType === "task_completed" ? "success" : "failed";
}

function getDuration(events: LogEvent[]): number | null {
  const result = events.find((e) => e.durationMs !== undefined);
  return result?.durationMs ?? null;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/** Group failed runs by identical error message */
type FailureGroup = {
  error: string;
  count: number;
  runIds: string[];
};

function buildFailureGroups(runs: RunEntry[]): FailureGroup[] {
  const errorMap = new Map<string, string[]>();
  for (const run of runs) {
    if (getRunStatus(run.events) !== "failed") continue;
    const errorEvent = run.events.find((e) => e.eventType === "task_failed" && e.error);
    if (errorEvent?.error) {
      const existing = errorMap.get(errorEvent.error) ?? [];
      existing.push(run.runId);
      errorMap.set(errorEvent.error, existing);
    }
  }
  return Array.from(errorMap.entries())
    .filter(([, ids]) => ids.length >= 2)
    .map(([error, runIds]) => ({ error, count: runIds.length, runIds }));
}

const runtimeBadge: Record<string, string> = {
  paperclip: "bg-blue-500/15 text-blue-300/80",
  hermes: "bg-purple-500/15 text-purple-300/80",
  openclaw: "bg-teal-500/15 text-teal-300/80",
  unknown: "bg-zinc-600/20 text-zinc-500",
};

export default function RunList({
  runs,
  selectedRunId,
  onSelect,
}: {
  runs: RunEntry[];
  selectedRunId: string | null;
  onSelect: (runId: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "failed" | "completed">("all");
  const [search, setSearch] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const failureGroups = useMemo(() => buildFailureGroups(runs), [runs]);
  const groupedRunIds = useMemo(
    () => new Set(failureGroups.flatMap((g) => g.runIds)),
    [failureGroups]
  );

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      if (groupedRunIds.has(run.runId)) return false;
      if (filter === "failed" && getRunStatus(run.events) !== "failed") return false;
      if (filter === "completed" && getRunStatus(run.events) !== "success") return false;
      if (search) {
        const q = search.toLowerCase();
        const agentId = run.events[0]?.agentId ?? "";
        const profile = getAgentProfile(agentId);
        if (
          !run.runId.toLowerCase().includes(q) &&
          !agentId.toLowerCase().includes(q) &&
          !profile.displayName.toLowerCase().includes(q) &&
          !profile.role.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [runs, filter, search, groupedRunIds]);

  if (runs.length === 0) {
    return <div className="p-4 text-sm text-zinc-400">No runs found</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header + controls */}
      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Runs ({runs.length})
          </h2>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search run, agent, role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(["all", "failed", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                filter === f
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {f === "all" ? `All` : f === "failed" ? `Failed` : `Done`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ul className="flex-1 overflow-y-auto">
        {/* Failure groups */}
        {failureGroups.map((group) => {
          const isExpanded = expandedGroup === group.error;
          return (
            <li key={group.error} className="border-b border-zinc-100 dark:border-zinc-800/50">
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.error)}
                className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-red-600 dark:text-red-400 truncate">
                    {group.error.length > 60 ? group.error.substring(0, 60) + "…" : group.error}
                  </span>
                  <span className="shrink-0 text-xs font-mono text-zinc-400">
                    {group.count} runs {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <ul className="bg-zinc-50 dark:bg-zinc-900/50">
                  {group.runIds.map((rid) => {
                    const run = runs.find((r) => r.runId === rid);
                    if (!run) return null;
                    const isSelected = rid === selectedRunId;
                    const lastEvent = run.events[run.events.length - 1];
                    const profile = getAgentProfile(run.events[0]?.agentId ?? "");
                    return (
                      <li key={rid}>
                        <button
                          onClick={() => onSelect(rid)}
                          className={`w-full text-left pl-5 pr-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800/30 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                            isSelected ? "bg-zinc-200 dark:bg-zinc-700" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-200 dark:text-zinc-300 font-medium">
                              {profile.displayName}
                            </span>
                            <span className="font-mono text-zinc-400 dark:text-zinc-500">
                              {shortId(rid)}
                            </span>
                          </div>
                          {lastEvent && (
                            <span className="text-zinc-400 dark:text-zinc-500">
                              {formatTime(lastEvent.timestamp)}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}

        {/* Individual runs */}
        {filteredRuns.map((run) => {
          const status = getRunStatus(run.events);
          const duration = getDuration(run.events);
          const lastEvent = run.events[run.events.length - 1];
          const isSelected = run.runId === selectedRunId;
          const agentId = run.events[0]?.agentId ?? "unknown";
          const profile = getAgentProfile(agentId);

          return (
            <li key={run.runId}>
              <button
                onClick={() => onSelect(run.runId)}
                className={`w-full text-left px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/50 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                  isSelected ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-200 dark:text-zinc-300 font-medium truncate">
                    {profile.displayName}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      status === "success"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                  <span className="font-mono truncate">
                    {getAgentShortId(agentId)}
                  </span>
                  <span className={`px-1 py-0.5 rounded text-xs ${runtimeBadge[profile.runtime] ?? runtimeBadge.unknown}`}>
                    {profile.runtime}
                  </span>
                  {profile.owner && (
                    <span className="text-zinc-600 dark:text-zinc-500">
                      {profile.owner}
                    </span>
                  )}
                  {duration !== null && <span>{formatDuration(duration)}</span>}
                </div>
                {lastEvent && (
                  <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {formatTime(lastEvent.timestamp)}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
