/**
 * Operations map node types.
 *
 * The operations map shows not just agents but also tools, services,
 * and external dependencies as semantic nodes.
 *
 * Phase 0–1: agents only (with real identities)
 * Phase 2: tools/services as configured placeholders
 * Phase 3: live telemetry for non-agent nodes
 */

export type OperationsNodeKind =
  | "agent"       // Paperclip agent
  | "tool"        // Internal tool or script
  | "service"     // Long-running service (WordPress, database, etc.)
  | "external";   // External API or third-party dependency

export type OperationsNodeCategory =
  | "orchestration"
  | "implementation"
  | "verification"
  | "monitoring"
  | "data_intake"
  | "compute"
  | "publishing"
  | "communication"
  | "storage"
  | "external_api"
  | "unknown";

export type OperationsMapNode = {
  id: string;
  kind: OperationsNodeKind;
  category: OperationsNodeCategory;
  label: string;
  status: "active" | "idle" | "stale" | "failed" | "unknown";
  description?: string;
  owner?: string;
};

/**
 * A directed relation hint between two nodes.
 * Lightweight — not a full dependency graph.
 */
export type OperationsRelation = {
  from: string; // node id
  to: string;   // node id
  label: string; // e.g. "uses", "publishes to", "reads from"
};

/**
 * Combined operations map model.
 */
export type OperationsMap = {
  nodes: OperationsMapNode[];
  relations: OperationsRelation[];
};
