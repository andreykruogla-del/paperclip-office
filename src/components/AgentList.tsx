import type { DerivedAgent } from "@/lib/derive-agents";

const statusColors: Record<DerivedAgent["status"], string> = {
  active: "text-emerald-600 dark:text-emerald-400",
  idle: "text-zinc-400 dark:text-zinc-500",
  stale: "text-red-600 dark:text-red-400",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
}

export default function AgentList({
  agents,
}: {
  agents: DerivedAgent[];
}) {
  if (agents.length === 0) return null;

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Known Agents
      </h2>
      <ul className="mt-4 space-y-2">
        {agents.map((agent) => (
          <li key={agent.id} className="flex items-baseline justify-between text-sm">
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {agent.id}
            </span>
            <span className="flex items-center gap-3 text-xs">
              <span className={`font-medium capitalize ${statusColors[agent.status]}`}>
                {agent.status}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500">
                {agent.lastEventType}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500">
                Last seen: {formatTime(agent.lastSeen)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
