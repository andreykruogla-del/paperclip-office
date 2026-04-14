import type { AgentProfile } from "@/types/agents";
import { LOCAL_AGENT_PROFILES } from "@/data/agent-profiles.local";

/**
 * Resolve agent profile in priority order:
 * 1. Local explicit override (src/data/agent-profiles.local.ts)
 * 2. Fallback to short ID — honest and referenceable
 */
export function getAgentProfile(agentId: string): AgentProfile {
  const local = LOCAL_AGENT_PROFILES[agentId];
  if (local) {
    return { agentId, ...local };
  }

  // Fallback: show short UUID. Honest, referenceable, consistent.
  const shortId = agentId.substring(0, 8);
  return {
    agentId,
    displayName: `Agent ${shortId}`,
    role: "unknown",
    runtime: "unknown",
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
