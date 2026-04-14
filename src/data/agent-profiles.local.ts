/**
 * Local editable agent profile overrides.
 *
 * This is the PRIMARY place to map live agent UUIDs to readable profiles.
 *
 * HOW TO MAP A LIVE AGENT:
 * 1. Run the app and find an unknown agent card (e.g. "Agent abc12345")
 * 2. Click that agent to open RunView → the full UUID appears in the summary header
 * 3. Copy the UUID and add an entry below
 * 4. The UI updates immediately (no restart needed)
 *
 * Priority: this file > fallback ("Agent abc12345")
 */

import type { AgentProfile } from "@/types/agents";

export const LOCAL_AGENT_PROFILES: Record<string, Omit<AgentProfile, "agentId">> = {

  // ──────────────────────────────────────────────────────────
  // KNOWN AGENTS — confirmed from live data
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
  // ADD YOUR LIVE AGENTS BELOW
  // ──────────────────────────────────────────────────────────
  // Copy this template and fill in your real agent UUID:
  //
  //   "<full-uuid-here>": {
  //     displayName: "ShortName",
  //     role: "orchestration | implementation | verification | monitoring | unknown",
  //     runtime: "paperclip",
  //     description: "What this agent does",
  //     owner: "your-team",
  //   },
  //

};
