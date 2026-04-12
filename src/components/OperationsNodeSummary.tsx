import type { OperationsMapNode } from "@/types/operations-map";

const kindBadge: Record<string, string> = {
  agent: "bg-blue-500/15 text-blue-300/80",
  tool: "bg-amber-500/15 text-amber-300/80",
  service: "bg-purple-500/15 text-purple-300/80",
  external: "bg-zinc-600/20 text-zinc-400",
};

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-300/80 border border-emerald-500/25",
  idle: "bg-zinc-700/30 text-zinc-400 border border-zinc-600/20",
  stale: "bg-amber-500/10 text-amber-300/80 border border-amber-500/25",
  failed: "bg-red-500/15 text-red-300 border border-red-500/30",
  unknown: "bg-zinc-700/20 text-zinc-500 border border-zinc-600/10",
};

export default function OperationsNodeSummary({
  node,
  onClear,
}: {
  node: OperationsMapNode;
  onClear: () => void;
}) {
  const isLive = node.kind === "agent";

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900/80 border-b border-zinc-800 text-xs">
      {/* Label */}
      <span className="font-semibold text-zinc-100 shrink-0">
        {node.label}
      </span>

      {/* Kind badge */}
      <span className={`px-1.5 py-0.5 rounded shrink-0 ${kindBadge[node.kind] ?? kindBadge.unknown}`}>
        {node.kind}
      </span>

      {/* Category */}
      <span className="text-zinc-400 capitalize shrink-0">
        {node.category.replace("_", " ")}
      </span>

      {/* Status */}
      <span className={`px-2 py-0.5 rounded shrink-0 capitalize ${statusBadge[node.status] ?? statusBadge.unknown}`}>
        {node.status}
      </span>

      {/* Description — subtle */}
      {node.description && (
        <span className="text-zinc-500 truncate max-w-64 italic shrink-0" title={node.description}>
          {node.description.length > 60 ? node.description.substring(0, 60) + "…" : node.description}
        </span>
      )}

      {/* Telemetry honesty */}
      {!isLive && (
        <span className="text-zinc-600 shrink-0" title="This node is configured but has no live telemetry connected">
          configured · no live telemetry
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
