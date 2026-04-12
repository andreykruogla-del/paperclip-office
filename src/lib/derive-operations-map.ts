import type { OfficeAgent } from "@/lib/derive-office-agents";
import type { OperationsMap, OperationsMapNode, OperationsRelation } from "@/types/operations-map";
import { TOOL_SERVICE_NODES, TOOL_SERVICE_RELATIONS } from "@/data/operations-nodes.local";

/**
 * Symbolic role IDs used in relation hints.
 * These are environment-agnostic — derive-operations-map.ts maps them
 * to real agent IDs based on displayName matching.
 */
const ROLE_SYMBOL_MAP: Record<string, string> = {
  "ceo": "CEO",
  "cto": "CTO",
  "coder": "Coder",
  "qa": "QA",
  "observer": "Observer",
};

/**
 * Derive a combined operations map from:
 * 1. Real agent run data (OfficeAgent[])
 * 2. Configured tool/service nodes
 * 3. Relation hints (resolved from symbolic role IDs to real agent IDs)
 */
export function deriveOperationsMap(agents: OfficeAgent[]): OperationsMap {
  // Build a lookup: symbolic role -> real agent id
  const agentBySymbol = new Map<string, string>();
  for (const agent of agents) {
    for (const [symbol, displayName] of Object.entries(ROLE_SYMBOL_MAP)) {
      if (agent.displayName === displayName) {
        agentBySymbol.set(symbol, agent.id);
      }
    }
  }

  // Convert agents to map nodes
  const agentNodes: OperationsMapNode[] = agents.map((a) => ({
    id: a.id,
    kind: "agent",
    category: getCategoryForAgent(a.displayName),
    label: a.displayName,
    status: a.status === "active" ? "active"
      : a.status === "stale" ? "stale"
      : a.status === "failed" ? "failed"
      : "idle",
    description: a.profile.description,
    owner: a.profile.owner,
  }));

  // Tool/service nodes with status preserved
  const toolNodes = TOOL_SERVICE_NODES.map((n) => ({ ...n }));

  // Resolve relations: replace symbolic role IDs with real agent IDs
  const resolvedRelations = TOOL_SERVICE_RELATIONS.map((r) => ({
    ...r,
    from: agentBySymbol.get(r.from) ?? r.from,
    to: agentBySymbol.get(r.to) ?? r.to,
  }));

  // Filter out relations where neither side resolved (both symbolic and no match)
  const allNodeIds = new Set([...agentNodes.map((n) => n.id), ...toolNodes.map((n) => n.id)]);
  const relations = resolvedRelations.filter((r) => allNodeIds.has(r.from) && allNodeIds.has(r.to));

  const nodes: OperationsMapNode[] = [...agentNodes, ...toolNodes];

  return { nodes, relations };
}

function getCategoryForAgent(displayName: string): OperationsMapNode["category"] {
  const roleMap: Record<string, OperationsMapNode["category"]> = {
    "CEO": "orchestration",
    "CTO": "orchestration",
    "Coder": "implementation",
    "QA": "verification",
    "Observer": "monitoring",
  };
  return roleMap[displayName] ?? "unknown";
}
