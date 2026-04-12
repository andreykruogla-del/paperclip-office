import type { OfficeAgent } from "@/lib/derive-office-agents";
import type { OperationsMap, OperationsMapNode, OperationsRelation } from "@/types/operations-map";
import { TOOL_SERVICE_NODES, TOOL_SERVICE_RELATIONS, CORE_AGENT_IDS } from "@/data/operations-nodes.local";

/**
 * Derive a combined operations map from:
 * 1. Real agent run data (OfficeAgent[])
 * 2. Configured tool/service nodes
 * 3. Relation hints
 */
export function deriveOperationsMap(agents: OfficeAgent[]): OperationsMap {
  // Convert agents to map nodes
  const agentNodes: OperationsMapNode[] = agents.map((a) => ({
    id: a.id,
    kind: "agent",
    category: getCategoryForAgent(a.id),
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

  // Merge
  const nodes: OperationsMapNode[] = [...agentNodes, ...toolNodes];
  const relations: OperationsRelation[] = [...TOOL_SERVICE_RELATIONS];

  return { nodes, relations };
}

function getCategoryForAgent(agentId: string): OperationsMapNode["category"] {
  const coreRoles: Record<string, OperationsMapNode["category"]> = {
    "24c80233-48c1-4d5f-814f-26b9c527e4c0": "orchestration",    // CEO
    "f466e6aa-1a4c-4ba7-ac9c-5578b2f91dba": "orchestration",    // CTO
    "6072fbc8-59f9-4efe-b731-aab9b8c7cbed": "implementation",    // Coder
    "f4969b3d-f195-44d9-89ea-67070be67922": "verification",     // QA
    "1d60b6e6-986b-4c44-9dd2-af1841856f17": "monitoring",       // Observer
  };
  return coreRoles[agentId] ?? "unknown";
}

/** Get the agent IDs that are part of the core team */
export function getCoreAgentIds(): string[] {
  return CORE_AGENT_IDS;
}
