/**
 * Local editable agent profile overrides.
 *
 * This is the PRIMARY place to define real agent identities.
 *
 * How to use:
 * 1. Find the real agent UUID (from Paperclip, Docker, or Paperclip Office logs)
 * 2. Add an entry below with displayName, role, runtime, etc.
 * 3. The UI will immediately reflect the change - no rebuild needed
 *
 * Priority: local overrides > deterministic fallback
 *
 * To find agent IDs:
 * - Check Paperclip Office RunList (shows real UUIDs)
 * - Check Paperclip dashboard at http://localhost:3110
 * - Check Docker: docker exec paperclip-paperclip-1 "ls companies"
 */

import type { AgentProfile } from "@/types/agents";

export const LOCAL_AGENT_PROFILES: Record<string, Omit<AgentProfile, "agentId">> = {
  // ──────────────────────────────────────────────────────────
  // Simfi-Mebel-AI (SIMA) — confirmed remote production team
  // Source: NDJSON run-log evidence from remote Paperclip instance
  // ──────────────────────────────────────────────────────────

  "24c80233-48c1-4d5f-814f-26b9c527e4c0": {
    displayName: "CEO",
    role: "orchestration",
    runtime: "paperclip",
    description: "Top-level project coordinator — routes tasks, manages priorities, requests Owner approval",
    owner: "simfi-mebel-ai",
  },

  "f466e6aa-1a4c-4ba7-ac9c-5578b2f91dba": {
    displayName: "CTO",
    role: "architecture",
    runtime: "paperclip",
    description: "Defines technical scope, bounded cycles, handoff contracts, and architecture decisions",
    owner: "simfi-mebel-ai",
  },

  "6072fbc8-59f9-4efe-b731-aab9b8c7cbed": {
    displayName: "Coder",
    role: "implementation",
    runtime: "paperclip",
    description: "Executes bounded implementation tasks — reads context, writes code, reports results",
    owner: "simfi-mebel-ai",
  },

  "f4969b3d-f195-44d9-89ea-67070be67922": {
    displayName: "QA",
    role: "verification",
    runtime: "paperclip",
    description: "Verifies implementation against scope — checks regressions, reports pass/fail with risks",
    owner: "simfi-mebel-ai",
  },

  "1d60b6e6-986b-4c44-9dd2-af1841856f17": {
    displayName: "Observer",
    role: "monitoring",
    runtime: "paperclip",
    description: "Collects normalized operational summaries — tracks cycle state, reports blockers to CEO",
    owner: "simfi-mebel-ai",
  },

  // ──────────────────────────────────────────────────────────
  // Orphaned agents — low confidence, unknown roles.
  // Keep them visible but subordinate.
  // ──────────────────────────────────────────────────────────

  "d99f231e-b447-49bf-a801-1fce9a14d17e": {
    displayName: "Agent D99",
    role: "unknown",
    runtime: "paperclip",
    description: "Orphaned agent — 1 run found, role not confirmed",
    owner: "simfi-mebel-ai",
  },

  "ba87913f-78f7-4c48-ac5f-70c34e4eedd3": {
    displayName: "Agent BA8",
    role: "unknown",
    runtime: "paperclip",
    description: "Orphaned agent — 1 run from March 31, role not confirmed",
    owner: "simfi-mebel-ai",
  },
};
