const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Deterministic letter from agentId UUID */
function letterFromId(id: string): string {
  // Use first hex char of UUID to pick a letter
  const hex = id.replace(/-/g, "").replace(/^0+/, "");
  if (hex.length === 0) return "A";
  const idx = parseInt(hex[0], 16) % ALPHABET.length;
  return ALPHABET[idx];
}

/** Deterministic number from agentId UUID */
function numFromId(id: string): number {
  const hex = id.replace(/-/g, "").replace(/^0+/, "");
  if (hex.length < 2) return 1;
  const val = parseInt(hex.substring(1, 5), 16);
  return (val % 99) + 1;
}

/**
 * Turns an ugly agent UUID into a short display label like "Agent A42".
 * Pure display helper — does NOT modify any data.
 */
export function getAgentDisplayName(agentId: string): string {
  return `Agent ${letterFromId(agentId)}${numFromId(agentId)}`;
}

/** Short version for tight spaces */
export function getAgentShortId(agentId: string): string {
  return agentId.substring(0, 8);
}
