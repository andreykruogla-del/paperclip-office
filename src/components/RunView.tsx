import type { LogEvent } from "@/types/events";
import { getAgentProfile, getAgentShortId } from "@/lib/agent-profiles";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

const normalizedColors: Record<string, string> = {
  activity: "text-zinc-500 dark:text-zinc-400",
  input: "text-zinc-400 dark:text-zinc-500",
  result_success: "text-emerald-600 dark:text-emerald-400",
  result_error: "text-red-600 dark:text-red-400",
  unknown: "text-amber-500 dark:text-amber-400",
};

const normalizedDot: Record<string, string> = {
  activity: "bg-zinc-300 dark:bg-zinc-600",
  input: "bg-zinc-200 dark:bg-zinc-700",
  result_success: "bg-emerald-500",
  result_error: "bg-red-500",
  unknown: "bg-amber-400",
};

const normalizedBg: Record<string, string> = {
  result_error: "bg-red-50 dark:bg-red-950/20",
  result_success: "bg-emerald-50 dark:bg-emerald-950/20",
};

export default function RunView({
  events,
}: {
  events: LogEvent[];
}) {
  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">
        Select a run to inspect
      </div>
    );
  }

  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const resultEvent = events.find(
    (e) => e.normalizedType === "result_success" || e.normalizedType === "result_error"
  );
  const isFailed = resultEvent?.normalizedType === "result_error";
  const errorMessage = resultEvent?.error;
  const agentProfile = getAgentProfile(firstEvent.agentId);

  const runtimeBadge: Record<string, string> = {
    paperclip: "bg-blue-500/15 text-blue-300/80",
    hermes: "bg-purple-500/15 text-purple-300/80",
    openclaw: "bg-teal-500/15 text-teal-300/80",
    unknown: "bg-zinc-600/20 text-zinc-500",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary */}
      <div className={`px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 ${
        isFailed ? "bg-red-50 dark:bg-red-950/10" : "bg-emerald-50 dark:bg-emerald-950/10"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {firstEvent.runId}
            </span>
            <span className="ml-2 text-xs text-zinc-200 dark:text-zinc-300 font-medium">
              {agentProfile.displayName}
            </span>
            <span className="ml-1.5 text-xs font-mono text-zinc-500" title={firstEvent.agentId}>
              {getAgentShortId(firstEvent.agentId)}
            </span>
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded ${runtimeBadge[agentProfile.runtime] ?? runtimeBadge.unknown}`}>
              {agentProfile.runtime}
            </span>
            {agentProfile.description ? (
              <span className="ml-2 text-xs text-zinc-500 italic truncate max-w-48" title={agentProfile.description}>
                {agentProfile.description}
              </span>
            ) : agentProfile.role === "unknown" && (
              <span className="ml-2 text-xs text-zinc-600" title="Add a profile in src/data/agent-profiles.local.ts">
                (unmapped)
              </span>
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              isFailed
                ? "bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200"
                : "bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
            }`}
          >
            {isFailed ? "failed" : "completed"}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{events.length} events</span>
          {resultEvent?.durationMs != null && (
            <span>{formatDuration(resultEvent.durationMs)}</span>
          )}
          {resultEvent?.tokens != null && (
            <span>{resultEvent.tokens.toLocaleString()} tokens</span>
          )}
        </div>

        {isFailed && errorMessage && (
          <div className="mt-2 text-xs font-mono text-red-600 dark:text-red-400 break-words">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        <ol className="relative border-l border-zinc-200 dark:border-zinc-700 ml-3 space-y-1">
          {events.map((ev) => (
            <li
              key={ev.id}
              className={`ml-4 pl-4 py-2 rounded ${normalizedBg[ev.normalizedType] ?? ""}`}
            >
              <span
                className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 ${
                  normalizedDot[ev.normalizedType] ?? "bg-zinc-300"
                }`}
              />

              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  {formatTime(ev.timestamp)}
                </span>
                <span
                  className={`text-xs font-medium ${
                    normalizedColors[ev.normalizedType] ?? "text-zinc-500"
                  }`}
                >
                  {ev.normalizedType}
                </span>
                {ev.eventType !== ev.normalizedType && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">
                    ({ev.eventType})
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                {ev.message}
              </p>

              {ev.error && (
                <p className="mt-1 text-xs font-mono text-red-600 dark:text-red-400 break-all">
                  {ev.error}
                </p>
              )}

              {(ev.durationMs != null || ev.tokens != null) && (
                <div className="mt-1 flex gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                  {ev.durationMs != null && <span>{ev.durationMs}ms</span>}
                  {ev.tokens != null && <span>{ev.tokens.toLocaleString()} tokens</span>}
                </div>
              )}

              {ev.raw !== undefined && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
                    raw
                  </summary>
                  <pre className="mt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400 overflow-x-auto bg-zinc-50 dark:bg-zinc-950 p-2 rounded max-h-48 overflow-y-auto">
                    {JSON.stringify(ev.raw, null, 2)}
                  </pre>
                </details>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
