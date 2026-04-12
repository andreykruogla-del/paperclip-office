"use client";

import { useState, useMemo } from "react";
import RunList from "@/components/RunList";
import RunView from "@/components/RunView";
import OfficeOverview from "@/components/OfficeOverview";
import TeamContextPanel from "@/components/TeamContextPanel";
import AgentSummary from "@/components/AgentSummary";
import OperationsNodeSummary from "@/components/OperationsNodeSummary";
import { useRuns } from "@/hooks/useRuns";
import { deriveOfficeAgents } from "@/lib/derive-office-agents";
import { deriveOperationsMap } from "@/lib/derive-operations-map";
import { getAgentProfile } from "@/lib/agent-profiles";
import type { OperationsMapNode } from "@/types/operations-map";

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Home() {
  const { runs, loading, debug, refreshState, refresh } = useRuns();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const officeAgents = useMemo(() => deriveOfficeAgents(runs), [runs]);
  const operationsMap = useMemo(() => deriveOperationsMap(officeAgents), [officeAgents]);

  // Find selected node
  const selectedAgent = useMemo(
    () => officeAgents.find((a) => a.id === selectedNodeId) ?? null,
    [officeAgents, selectedNodeId]
  );
  const selectedToolNode = useMemo(
    (): OperationsMapNode | null => {
      if (!selectedNodeId) return null;
      return operationsMap.nodes.find((n) => n.id === selectedNodeId && n.kind !== "agent") ?? null;
    },
    [operationsMap.nodes, selectedNodeId]
  );

  // Filter runs by selected agent
  const filteredRuns = useMemo(() => {
    if (!selectedNodeId) return runs;
    // Only filter if selected node is an agent
    if (operationsMap.nodes.find((n) => n.id === selectedNodeId)?.kind !== "agent") return runs;
    return runs.filter((r) => r.events[0]?.agentId === selectedNodeId);
  }, [runs, selectedNodeId, operationsMap.nodes]);

  const selectedRun = filteredRuns.find((r) => r.runId === selectedRunId);

  const clearSelection = () => {
    setSelectedNodeId(null);
    setSelectedRunId(null);
  };

  const handleSelectNode = (nodeId: string) => {
    if (selectedNodeId === nodeId) {
      clearSelection();
    } else {
      setSelectedNodeId(nodeId);
      setSelectedRunId(null);
    }
  };

  const isRefreshing = refreshState.status === "refreshing";
  const isAgentSelected = selectedAgent !== null;
  const isToolSelected = selectedToolNode !== null;

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold tracking-tight text-zinc-50">
            Paperclip Office
          </h1>
          <p className="text-xs text-zinc-500">
            Operations map — {debug ? `${debug.totalRuns} runs inspected` : "loading…"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <TeamContextPanel />

          {/* Freshness indicator + refresh button */}
          <div className="flex items-center gap-2">
            {refreshState.status === "success" && (
              <span className="text-xs text-zinc-600">
                updated {formatTime(refreshState.at)}
              </span>
            )}
            {refreshState.status === "error" && (
              <span className="text-xs text-red-400" title={refreshState.message}>
                refresh failed
              </span>
            )}
            {isRefreshing && (
              <span className="text-xs text-zinc-500 animate-pulse">
                refreshing…
              </span>
            )}
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Pull latest data from Paperclip"
            >
              ↻
            </button>
          </div>
        </div>
      </header>

      {/* Operations Map — orientation layer */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        {loading ? (
          <div className="h-32 flex items-center justify-center text-sm text-zinc-600">
            Loading agents…
          </div>
        ) : (
          <OfficeOverview
            agents={officeAgents}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            toolNodes={operationsMap.nodes.filter((n) => n.kind !== "agent")}
            relations={operationsMap.relations}
          />
        )}
      </div>

      {/* Selected node summary strip */}
      {selectedAgent && (
        <AgentSummary agent={selectedAgent} onClear={clearSelection} />
      )}
      {isToolSelected && selectedToolNode && (
        <OperationsNodeSummary node={selectedToolNode} onClear={clearSelection} />
      )}

      {/* Investigation area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Run List — only visible for agent selection */}
        {isAgentSelected && (
          <aside className="w-72 border-r border-zinc-800 bg-zinc-900 flex flex-col overflow-hidden">
            {loading ? (
              <div className="p-4 text-sm text-zinc-600">Loading runs…</div>
            ) : (
              <div>
                {selectedNodeId && !selectedAgent && (
                  <div className="px-3 py-2 text-xs text-zinc-500 border-b border-zinc-800">
                    Agent: {getAgentProfile(selectedNodeId).displayName}
                  </div>
                )}
                <RunList
                  runs={filteredRuns}
                  selectedRunId={selectedRunId}
                  onSelect={setSelectedRunId}
                />
              </div>
            )}
          </aside>
        )}

        {/* Run View or tool detail */}
        <main className="flex-1 bg-zinc-900 flex flex-col overflow-hidden">
          {selectedRun && isAgentSelected ? (
            <RunView events={selectedRun.events} />
          ) : isToolSelected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-sm text-zinc-500 max-w-md">
                <p className="text-zinc-400 mb-2">
                  {selectedToolNode?.label}
                </p>
                <p className="text-xs text-zinc-600">
                  This is a configured node with no live telemetry yet.
                  Run investigation is available for agents only.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-zinc-600">
              {loading
                ? "Loading…"
                : selectedNodeId
                  ? isAgentSelected
                    ? "Select a run to inspect"
                    : "No investigation data for this node type"
                  : "Select an agent or tool to inspect"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
