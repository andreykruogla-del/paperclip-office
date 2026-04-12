/**
 * Local tool / service node configuration for the operations map.
 *
 * This file defines non-agent nodes that the agent team interacts with.
 * It is a semantic placeholder layer — NOT live discovery.
 *
 * HOW TO USE:
 * - Add entries for tools/services you know your agents depend on
 * - Keep descriptions honest — if telemetry isn't confirmed, say so
 * - This file is safe to commit if it contains no secrets
 *
 * NOTE: The nodes below are based on observable container names from
 * the simfi-mebel-ai environment. They represent the known infrastructure
 * topology, not live health checks.
 */

import type { OperationsMapNode, OperationsRelation } from "@/types/operations-map";

// ──────────────────────────────────────────────────────────
// Core agent team (references for relations only — actual
// agent nodes come from derive-operations-map.ts via run data)
// ──────────────────────────────────────────────────────────

export const CORE_AGENT_IDS = [
  "24c80233-48c1-4d5f-814f-26b9c527e4c0", // CEO
  "f466e6aa-1a4c-4ba7-ac9c-5578b2f91dba",  // CTO
  "6072fbc8-59f9-4efe-b731-aab9b8c7cbed",  // Coder
  "f4969b3d-f195-44d9-89ea-67070be67922",  // QA
  "1d60b6e6-986b-4c44-9dd2-af1841856f17",  // Observer
];

// ──────────────────────────────────────────────────────────
// Tools & Services
// ──────────────────────────────────────────────────────────

export const TOOL_SERVICE_NODES: OperationsMapNode[] = [
  {
    id: "node-scraper",
    kind: "tool",
    category: "data_intake",
    label: "Scraper",
    status: "unknown",
    description: "Web scraper — collects external data for agents. No live telemetry confirmed.",
    owner: "simfi-mebel-ai",
  },
  {
    id: "node-media-factory",
    kind: "service",
    category: "publishing",
    label: "Media Factory",
    status: "unknown",
    description: "Media/content generation pipeline. No live telemetry confirmed.",
    owner: "simfi-mebel-ai",
  },
  {
    id: "node-wordpress",
    kind: "service",
    category: "publishing",
    label: "WordPress",
    status: "unknown",
    description: "WordPress CMS — publishing target for generated content. No live telemetry confirmed.",
    owner: "simfi-mebel-ai",
  },
  {
    id: "node-mail-intake",
    kind: "service",
    category: "data_intake",
    label: "Mail Processor",
    status: "unknown",
    description: "Email intake pipeline (sales, tenders, pricing). No live telemetry confirmed.",
    owner: "simfi-mebel-ai",
  },
  {
    id: "node-chatwoot",
    kind: "service",
    category: "communication",
    label: "Chatwoot",
    status: "unknown",
    description: "Customer support / communication platform. No live telemetry confirmed.",
    owner: "simfi-mebel-ai",
  },
  {
    id: "node-hermes",
    kind: "tool",
    category: "orchestration",
    label: "Hermes",
    status: "unknown",
    description: "Hermes agent orchestrator — manages Paperclip agent scheduling and routing.",
    owner: "simfi-mebel-ai",
  },
  {
    id: "node-openai",
    kind: "external",
    category: "external_api",
    label: "OpenAI / Codex",
    status: "unknown",
    description: "External LLM API — primary compute backend for Paperclip agents. Currently rate-limited.",
    owner: "external",
  },
];

// ──────────────────────────────────────────────────────────
// Relation hints
// Light topology hints — not a full dependency graph
// ──────────────────────────────────────────────────────────

export const TOOL_SERVICE_RELATIONS: OperationsRelation[] = [
  { from: "6072fbc8-59f9-4efe-b731-aab9b8c7cbed", to: "node-media-factory", label: "uses" },
  { from: "1d60b6e6-986b-4c44-9dd2-af1841856f17", to: "node-mail-intake", label: "reads from" },
  { from: "node-media-factory", to: "node-wordpress", label: "publishes to" },
  { from: "node-scraper", to: "node-media-factory", label: "feeds" },
  { from: "node-mail-intake", to: "24c80233-48c1-4d5f-814f-26b9c527e4c0", label: "alerts" },
  { from: "24c80233-48c1-4d5f-814f-26b9c527e4c0", to: "node-openai", label: "depends on" },
  { from: "f466e6aa-1a4c-4ba7-ac9c-5578b2f91dba", to: "node-openai", label: "depends on" },
  { from: "node-hermes", to: "24c80233-48c1-4d5f-814f-26b9c527e4c0", label: "schedules" },
];
