import type { AgentProfile } from "@/types/agents";
import { LOCAL_AGENT_PROFILES } from "@/data/agent-profiles.local";

/** Deterministic role assignment from UUID */
const ROLES = [
  "planning",
  "research",
  "execution",
  "review",
  "monitoring",
  "coordination",
  "analysis",
  "generation",
];

const ROLE_LABELS: Record<string, string> = {
  planning: "Planner",
  research: "Researcher",
  execution: "Executor",
  review: "Reviewer",
  monitoring: "Monitor",
  coordination: "Coordinator",
  analysis: "Analyst",
  generation: "Generator",
};

/** Deterministic runtime assignment from UUID */
const RUNTIMES = ["paperclip", "hermes", "openclaw", "unknown"] as const;

function deterministicRole(agentId: string): string {
  const hex = agentId.replace(/-/g, "");
  if (!hex) return ROLES[0];
  const val = parseInt(hex[0], 16);
  return ROLES[val % ROLES.length];
}

function deterministicRuntime(agentId: string): string {
  const hex = agentId.replace(/-/g, "");
  if (!hex) return "unknown";
  const val = parseInt(hex[1] || "0", 16);
  return val < 10 ? "paperclip" : RUNTIMES[val % RUNTIMES.length];
}

/**
 * Resolve agent profile in priority order:
 * 1. Local explicit override (src/data/agent-profiles.local.ts)
 * 2. Deterministic fallback
 */
export function getAgentProfile(agentId: string): AgentProfile {
  const local = LOCAL_AGENT_PROFILES[agentId];
  if (local) {
    return { agentId, ...local };
  }

  // Deterministic fallback
  const role = deterministicRole(agentId);
  const runtime = deterministicRuntime(agentId);
  const num = parseInt(agentId.replace(/-/g, "").substring(1, 5), 16) % 99 + 1;

  return {
    agentId,
    displayName: `${ROLE_LABELS[role] ?? role} ${num}`,
    role,
    runtime,
  };
}

/** All explicitly defined local profiles (for iteration if needed) */
export function getLocalAgentProfiles(): AgentProfile[] {
  return Object.entries(LOCAL_AGENT_PROFILES).map(([agentId, p]) => ({
    agentId,
    ...p,
  }));
}

export function getAgentDisplayName(agentId: string): string {
  return getAgentProfile(agentId).displayName;
}

export function getAgentShortId(agentId: string): string {
  return agentId.substring(0, 8);
}
