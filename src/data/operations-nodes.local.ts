/**
 * Local tool / service node configuration for the operations map.
 *
 * This file defines non-agent nodes that your agent team may interact with.
 * It is a SEMANTIC PLACEHOLDER LAYER — not live discovery, not auto-detection.
 *
 * HOW TO USE:
 * 1. Add entries for tools/services your agents depend on
 * 2. Keep descriptions honest — if telemetry isn't confirmed, say so
 * 3. Remove examples you don't need; add your own infrastructure nodes
 *
 * This file is safe to commit as long as it contains no secrets.
 *
 * NOTE: Agent nodes are derived automatically from run data.
 * Only define non-agent nodes here (tools, services, external APIs).
 */

import type { OperationsMapNode, OperationsRelation } from "@/types/operations-map";

// ──────────────────────────────────────────────────────────
// Tools & Services — seed examples
// Replace or remove these to match your environment.
// ──────────────────────────────────────────────────────────

export const TOOL_SERVICE_NODES: OperationsMapNode[] = [
  // Example: external data collection tool
  {
    id: "scraper",
    kind: "tool",
    category: "data_intake",
    label: "Scraper",
    status: "unknown",
    description: "Collects external data. No live telemetry connected.",
  },

  // Example: content/media generation service
  {
    id: "media-factory",
    kind: "service",
    category: "publishing",
    label: "Media Factory",
    status: "unknown",
    description: "Content or media generation pipeline. No live telemetry connected.",
  },

  // Example: CMS / publishing target
  {
    id: "cms",
    kind: "service",
    category: "publishing",
    label: "CMS",
    status: "unknown",
    description: "Content management system — publishing target. No live telemetry connected.",
  },

  // Example: email/communication intake
  {
    id: "mail-intake",
    kind: "service",
    category: "communication",
    label: "Mail Intake",
    status: "unknown",
    description: "Email processing pipeline. No live telemetry connected.",
  },

  // Example: LLM / compute backend
  {
    id: "llm-api",
    kind: "external",
    category: "external_api",
    label: "LLM API",
    status: "unknown",
    description: "External LLM provider — compute backend for agents. Status unknown.",
  },
];

// ──────────────────────────────────────────────────────────
// Relation hints — tool/service only
// Agent-to-tool relations are mapped separately in derive-operations-map.ts
// using role-based references, not hardcoded UUIDs.
// ──────────────────────────────────────────────────────────

export const TOOL_SERVICE_RELATIONS: OperationsRelation[] = [
  { from: "coder", to: "media-factory", label: "uses" },
  { from: "observer", to: "mail-intake", label: "reads from" },
  { from: "media-factory", to: "cms", label: "publishes to" },
  { from: "scraper", to: "media-factory", label: "feeds" },
  { from: "ceo", to: "llm-api", label: "depends on" },
  { from: "cto", to: "llm-api", label: "depends on" },
];
