import { useState } from "react";
import type { OfficeAgent } from "@/lib/derive-office-agents";
import type { OperationsMapNode, OperationsRelation } from "@/types/operations-map";

// ──────────────────────────────────────────────────────────
// Visual tokens
// ──────────────────────────────────────────────────────────

// The core team display names in preferred visual order for the bounded cycle
const CORE_TEAM_DISPLAY_NAMES = ["CEO", "CTO", "Coder", "QA", "Observer"];

const AGENT_STATUS_BORDER: Record<string, string> = {
  failed: "border-red-500/70",
  active: "border-emerald-500/35",
  stale: "border-amber-500/40",
  idle: "border-zinc-700/20",
};

const AGENT_STATUS_DOT: Record<string, string> = {
  failed: "bg-red-400",
  active: "bg-emerald-400",
  stale: "bg-amber-400",
  idle: "bg-zinc-600",
};

const AGENT_STATUS_LABEL: Record<string, string> = {
  failed: "text-red-300",
  active: "text-emerald-300/80",
  stale: "text-amber-300/80",
  idle: "text-zinc-500",
};

const AGENT_STATUS_BG: Record<string, string> = {
  failed: "bg-red-950/30",
  active: "bg-zinc-800/90",
  stale: "bg-zinc-800/70",
  idle: "bg-zinc-800/50",
};

const AGENT_STATUS_PULSE: Record<string, string> = {
  active: "animate-pulse",
  failed: "animate-pulse",
  stale: "",
  idle: "",
};

const AGENT_STATUS_ATTENTION: Record<string, string> = {
  failed: "text-red-400/90",
  active: "text-zinc-400",
  stale: "text-amber-400/80",
  idle: "text-zinc-600",
};

const RUNTIME_BADGE: Record<string, string> = {
  paperclip: "bg-blue-500/15 text-blue-300/80",
  hermes: "bg-purple-500/15 text-purple-300/80",
  openclaw: "bg-teal-500/15 text-teal-300/80",
  unknown: "bg-zinc-600/20 text-zinc-500",
};

const NODE_KIND_BADGE: Record<string, string> = {
  tool: "bg-amber-500/15 text-amber-300/80",
  service: "bg-purple-500/15 text-purple-300/80",
  external: "bg-zinc-600/20 text-zinc-400",
  agent: "",
};

const NODE_STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-400",
  idle: "bg-zinc-600",
  stale: "bg-amber-400",
  failed: "bg-red-400",
  unknown: "bg-zinc-700",
};

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

export default function OfficeOverview({
  agents,
  selectedNodeId,
  onSelectNode,
  toolNodes,
  relations,
}: {
  agents: OfficeAgent[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  toolNodes: OperationsMapNode[];
  relations: OperationsRelation[];
}) {
  if (agents.length === 0 && toolNodes.length === 0) return null;

  // Operator mode toggle
  const [mode, setMode] = useState<"attention" | "all">("attention");

  // Stabilize visual order: core team first, then others
  const coreAgents = agents.filter((a) => CORE_TEAM_DISPLAY_NAMES.includes(a.displayName));
  const otherAgents = agents.filter((a) => !CORE_TEAM_DISPLAY_NAMES.includes(a.displayName));
  const orderedAgents = [...coreAgents, ...otherAgents];

  // Filter by attention mode
  const visibleAgents = mode === "attention"
    ? orderedAgents.filter((a) => a.status === "failed" || a.status === "stale")
    : orderedAgents;

  const attentionCount = orderedAgents.filter((a) => a.status === "failed" || a.status === "stale").length;

  const isSelected = (id: string) => selectedNodeId === id;

  return (
    <div className="relative">
      {/* Floor perspective container */}
      <div className="relative overflow-hidden rounded-xl" style={{ perspective: "2000px" }}>
        {/* Floor surface */}
        <div
          className="relative bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-6"
          style={{ transform: "rotateX(3deg)", transformOrigin: "center center" }}
        >
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-5 rounded-xl"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* AGENT ZONE — primary */}
          <div className="relative">
            {/* Mode toggle */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex bg-zinc-800/60 rounded-md overflow-hidden border border-zinc-700/30">
                <button
                  onClick={() => setMode("attention")}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    mode === "attention"
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Attention{attentionCount > 0 && <span className="ml-1 text-red-400">({attentionCount})</span>}
                </button>
                <button
                  onClick={() => setMode("all")}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    mode === "all"
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  All ({orderedAgents.length})
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {visibleAgents.map((agent) => {
                const sel = isSelected(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => onSelectNode(agent.id)}
                    className={`group relative transition-all duration-200 ${
                      sel ? "scale-105 z-10" : "hover:scale-[1.02]"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-lg shadow-lg ${
                        agent.status === "failed" ? "shadow-red-500/15"
                        : agent.status === "active" ? "shadow-emerald-500/8"
                        : agent.status === "stale" ? "shadow-amber-500/8"
                        : "shadow-transparent"
                      }`}
                      style={{ transform: "translateY(4px)" }}
                    />
                    <div
                      className={`relative border rounded-lg overflow-hidden transition-all ${
                        AGENT_STATUS_BORDER[agent.status]
                      } ${AGENT_STATUS_BG[agent.status]} ${
                        sel ? "ring-2 ring-zinc-300/40 bg-zinc-700/90" : "hover:border-zinc-500/40"
                      }`}
                    >
                      <div className="h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent" />
                      <div className="px-3 py-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${AGENT_STATUS_DOT[agent.status]} ${AGENT_STATUS_PULSE[agent.status]}`} />
                          <span className={`text-xs font-medium capitalize ${AGENT_STATUS_LABEL[agent.status]}`}>
                            {agent.status}
                          </span>
                          <span className="ml-auto">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${RUNTIME_BADGE[agent.runtime] ?? RUNTIME_BADGE.unknown}`}>
                              {agent.runtime}
                            </span>
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-zinc-100 truncate mb-0.5">
                          {agent.displayName}
                        </div>
                        <div className="text-xs text-zinc-500 capitalize mb-1 flex items-center gap-1">
                          <span>{agent.role}</span>
                          {agent.profile.owner && (
                            <span className="text-zinc-600">· {agent.profile.owner}</span>
                          )}
                        </div>
                        <div className={`text-xs truncate ${AGENT_STATUS_ATTENTION[agent.status]}`} title={agent.attentionInfo}>
                          {agent.attentionInfo}
                        </div>
                      </div>
                      <div className="h-px bg-zinc-700/20" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Empty state for attention mode */}
            {visibleAgents.length === 0 && mode === "attention" && (
              <div className="py-8 text-center text-sm text-zinc-500">
                No agents need attention right now
              </div>
            )}
          </div>

          {/* TOOL/SERVICE ZONE — secondary */}
          {toolNodes.length > 0 && (
            <div className="relative mt-6 pt-4 border-t border-zinc-800/40">
              <div className="text-xs text-zinc-600 uppercase tracking-wider mb-3 font-medium">
                Tools &amp; Services
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {toolNodes.map((node) => {
                  const sel = isSelected(node.id);
                  // Count incoming relations for this node
                  const incomingCount = relations.filter((r) => r.to === node.id).length;
                  return (
                    <button
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                      className={`group relative transition-all duration-200 ${
                        sel ? "scale-105 z-10" : "hover:scale-[1.02]"
                      } opacity-80 hover:opacity-100`}
                    >
                      <div
                        className={`relative border rounded-lg overflow-hidden transition-all bg-zinc-900/60 border-zinc-700/30 ${
                          sel ? "ring-2 ring-zinc-400/30 bg-zinc-800/80" : "hover:border-zinc-600/40"
                        }`}
                      >
                        <div className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${NODE_STATUS_DOT[node.status] ?? NODE_STATUS_DOT.unknown}`} />
                            <span className="text-xs font-medium text-zinc-300 truncate">
                              {node.label}
                            </span>
                            {NODE_KIND_BADGE[node.kind] && (
                              <span className={`ml-auto text-xs px-1 py-0.5 rounded shrink-0 ${NODE_KIND_BADGE[node.kind]}`}>
                                {node.kind}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-600 capitalize">
                            {node.category.replace("_", " ")}
                            {incomingCount > 0 && (
                              <span className="ml-1 text-zinc-700">· {incomingCount} link{incomingCount > 1 ? "s" : ""}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flow strip — bounded cycle path */}
      <div className="mt-4 flex items-center justify-center gap-1 text-xs">
        {(["CEO", "CTO", "Coder", "QA", "Observer"] as const).map((role, i) => {
          const roleAgent = orderedAgents.find((a) => a.displayName === role);
          const status = roleAgent?.status ?? "unknown";
          const dotColor = status === "failed" ? "bg-red-400"
            : status === "active" ? "bg-emerald-400"
            : status === "stale" ? "bg-amber-400"
            : "bg-zinc-600";
          return (
            <span key={role} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span className="text-zinc-400">{role}</span>
              {i < 4 && <span className="text-zinc-700">→</span>}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
        {(["failed", "stale", "active", "idle"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${AGENT_STATUS_DOT[s]}`} />
            <span className="capitalize">{s}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
