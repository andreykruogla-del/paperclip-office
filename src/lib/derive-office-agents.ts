import type { RunEntry } from "@/hooks/useRuns";
import type { AgentProfile } from "@/types/agents";
import { getAgentProfile } from "@/lib/agent-profiles";

export type OfficeAgent = {
  id: string;
  profile: AgentProfile;
  displayName: string;
  role: string;
  runtime: string;
  status: "active" | "idle" | "stale" | "failed";
  lastSeen: number;
  latestRunId: string;
  latestRunStatus: "completed" | "failed";
  latestError: string | null;
  runCount: number;
  failedRunCount: number;
  attentionInfo: string;
};

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24h

function timeAgoLabel(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function deriveOfficeAgents(runs: RunEntry[]): OfficeAgent[] {
  const agentMap = new Map<string, {
    lastSeen: number;
    latestRunId: string;
    latestRunStatus: "completed" | "failed";
    latestError: string | null;
    runCount: number;
    failedRunCount: number;
  }>();

  for (const run of runs) {
    const agentId = run.events[0]?.agentId;
    if (!agentId) continue;

    const lastEvent = run.events[run.events.length - 1];
    const timestamp = lastEvent?.timestamp ?? 0;

    const isFailed = run.events.some((e) => e.normalizedType === "result_error");
    const runStatus: "completed" | "failed" = isFailed ? "failed" : "completed";
    const errorEvent = run.events.find((e) => e.eventType === "task_failed" && e.error);

    const existing = agentMap.get(agentId);
    if (!existing || timestamp > existing.lastSeen) {
      agentMap.set(agentId, {
        lastSeen: timestamp,
        latestRunId: run.runId,
        latestRunStatus: runStatus,
        latestError: errorEvent?.error ?? existing?.latestError ?? null,
        runCount: (existing?.runCount ?? 0) + 1,
        failedRunCount: (existing?.failedRunCount ?? 0) + (isFailed ? 1 : 0),
      });
    } else {
      existing.runCount++;
      if (isFailed) existing.failedRunCount++;
    }
  }

  const now = Date.now();

  return Array.from(agentMap.entries()).map(([id, data]) => {
    const profile = getAgentProfile(id);
    const age = now - data.lastSeen;

    let status: OfficeAgent["status"];
    if (data.latestRunStatus === "failed") {
      status = "failed";
    } else if (age > STALE_THRESHOLD_MS) {
      status = "stale";
    } else {
      status = "active";
    }

    let attentionInfo: string;
    if (status === "failed" && data.latestError) {
      const short = data.latestError.length > 40 ? data.latestError.substring(0, 40) + "…" : data.latestError;
      attentionInfo = short;
    } else if (status === "failed" && data.failedRunCount > 1) {
      attentionInfo = `${data.failedRunCount} failed runs`;
    } else if (status === "stale") {
      attentionInfo = `last seen ${timeAgoLabel(age)}`;
    } else if (status === "active") {
      attentionInfo = `${data.runCount} ${data.runCount === 1 ? "run" : "runs"} · ${timeAgoLabel(age)}`;
    } else {
      attentionInfo = `last seen ${timeAgoLabel(age)}`;
    }

    return {
      id,
      profile,
      displayName: profile.displayName,
      role: profile.role,
      runtime: profile.runtime,
      status,
      lastSeen: data.lastSeen,
      latestRunId: data.latestRunId,
      latestRunStatus: data.latestRunStatus,
      latestError: data.latestError,
      runCount: data.runCount,
      failedRunCount: data.failedRunCount,
      attentionInfo,
    };
  }).sort((a, b) => {
    const order: Record<string, number> = { failed: 0, stale: 1, active: 2, idle: 3 };
    const statusDiff = (order[a.status] ?? 2) - (order[b.status] ?? 2);
    if (statusDiff !== 0) return statusDiff;
    if (a.failedRunCount !== b.failedRunCount) {
      return b.failedRunCount - a.failedRunCount;
    }
    return b.lastSeen - a.lastSeen;
  });
}
