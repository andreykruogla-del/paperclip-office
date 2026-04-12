import type { OfficeAgent } from "@/lib/derive-office-agents";
import { getAgentShortId } from "@/lib/agent-profiles";

const statusBadge: Record<string, string> = {
  failed: "bg-red-500/15 text-red-300 border-red-500/30",
  active: "bg-emerald-500/10 text-emerald-300/80 border-emerald-500/25",
  stale: "bg-amber-500/10 text-amber-300/80 border-amber-500/25",
  idle: "bg-zinc-700/30 text-zinc-400 border-zinc-600/20",
};

const runtimeBadge: Record<string, string> = {
  paperclip: "bg-blue-500/15 text-blue-300/80",
  hermes: "bg-purple-500/15 text-purple-300/80",
  openclaw: "bg-teal-500/15 text-teal-300/80",
  unknown: "bg-zinc-600/20 text-zinc-500",
};

function timeAgo(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AgentSummary({
  agent,
  onClear,
}: {
  agent: OfficeAgent;
  onClear: () => void;
}) {
  const { profile } = agent;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900/80 border-b border-zinc-800 text-xs">
      {/* Name */}
      <span className="font-semibold text-zinc-100 shrink-0">
        {agent.displayName}
      </span>

      {/* Real ID */}
      <span className="font-mono text-zinc-500 shrink-0">
        {getAgentShortId(agent.id)}
      </span>

      {/* Role */}
      <span className="text-zinc-400 capitalize shrink-0">
        {agent.role}
      </span>

      {/* Owner */}
      {profile.owner && (
        <span className="text-zinc-500 shrink-0">
          {profile.owner}
        </span>
      )}

      {/* Runtime badge */}
      <span className={`px-1.5 py-0.5 rounded shrink-0 ${runtimeBadge[agent.runtime] ?? runtimeBadge.unknown}`}>
        {agent.runtime}
      </span>

      {/* Divider */}
      <span className="text-zinc-700 shrink-0">|</span>

      {/* Status badge */}
      <span className={`px-2 py-0.5 rounded border capitalize font-medium shrink-0 ${statusBadge[agent.status]}`}>
        {agent.status}
      </span>

      {/* Latest run */}
      <span className="text-zinc-500 shrink-0">
        run: <span className={agent.latestRunStatus === "failed" ? "text-red-400" : "text-emerald-400/80"}>{agent.latestRunStatus}</span>
      </span>

      {/* Last seen */}
      <span className="text-zinc-500 shrink-0">
        {timeAgo(Date.now() - agent.lastSeen)}
      </span>

      {/* Description — subtle */}
      {profile.description && (
        <span className="text-zinc-600 truncate max-w-48 italic" title={profile.description}>
          {profile.description}
        </span>
      )}

      {/* Latest error */}
      {agent.latestError && (
        <span className="text-red-400/90 truncate max-w-40" title={agent.latestError}>
          {agent.latestError.length > 45 ? agent.latestError.substring(0, 45) + "…" : agent.latestError}
        </span>
      )}

      {/* Clear */}
      <button
        onClick={onClear}
        className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
      >
        clear
      </button>
    </div>
  );
}
