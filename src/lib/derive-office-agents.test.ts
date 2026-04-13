import { describe, it, expect } from "vitest";
import { deriveOfficeAgents, type OfficeAgent } from "./derive-office-agents";
import type { RunSummary } from "@/hooks/useRuns";

// ─── Fixtures ─────────────────────────────────────────────

const AGENT_ID_CEO = "a1111111-1111-1111-1111-111111111111";

const now = Date.now();
const oneHourAgo = now - 60 * 60 * 1000;
const oneDayAgo = now - 25 * 60 * 60 * 1000; // > 24h → stale threshold

function makeSummary(overrides: Partial<RunSummary>): RunSummary {
  return {
    runId: `run-${Math.random().toString(36).slice(2)}`,
    agentId: AGENT_ID_CEO,
    status: "completed",
    eventCount: 5,
    durationMs: 10000,
    totalTokens: 50000,
    mainError: null,
    endedAt: oneHourAgo,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────

describe("deriveOfficeAgents", () => {
  it("agent with last failed run gets status 'failed'", () => {
    const runs: RunSummary[] = [
      makeSummary({ agentId: AGENT_ID_CEO, status: "failed", mainError: "Auth timeout", endedAt: oneHourAgo }),
    ];
    const agents = deriveOfficeAgents(runs);
    expect(agents).toHaveLength(1);
    expect(agents[0].status).toBe("failed");
  });

  it("agent with non-failed run and recent endedAt gets status 'active'", () => {
    const runs: RunSummary[] = [
      makeSummary({ agentId: AGENT_ID_CEO, status: "completed", endedAt: oneHourAgo }),
    ];
    const agents = deriveOfficeAgents(runs);
    expect(agents).toHaveLength(1);
    expect(agents[0].status).toBe("active");
  });

  it("agent with old endedAt (>24h) gets status 'stale'", () => {
    const runs: RunSummary[] = [
      makeSummary({ agentId: AGENT_ID_CEO, status: "completed", endedAt: oneDayAgo }),
    ];
    const agents = deriveOfficeAgents(runs);
    expect(agents).toHaveLength(1);
    expect(agents[0].status).toBe("stale");
  });

  it("failedRunCount is counted correctly across multiple runs", () => {
    const runs: RunSummary[] = [
      makeSummary({ agentId: AGENT_ID_CEO, status: "completed", endedAt: oneHourAgo }),
      makeSummary({ agentId: AGENT_ID_CEO, status: "failed", mainError: "Error 1", endedAt: oneHourAgo }),
      makeSummary({ agentId: AGENT_ID_CEO, status: "failed", mainError: "Error 2", endedAt: oneHourAgo }),
    ];
    const agents = deriveOfficeAgents(runs);
    expect(agents[0].failedRunCount).toBe(2);
    expect(agents[0].runCount).toBe(3);
  });

  it("latestError is taken from the most recent failed run", () => {
    const runs: RunSummary[] = [
      makeSummary({ agentId: AGENT_ID_CEO, status: "failed", mainError: "Old error", endedAt: oneDayAgo }),
      makeSummary({ agentId: AGENT_ID_CEO, status: "failed", mainError: "New error", endedAt: oneHourAgo }),
    ];
    const agents = deriveOfficeAgents(runs);
    expect(agents[0].latestError).toBe("New error");
  });

  it("multiple agents are sorted: failed first, then by failedRunCount, then by lastSeen", () => {
    // Use known profile IDs so getAgentProfile returns expected displayNames
    const CEO_ID = "24c80233-48c1-4d5f-814f-26b9c527e4c0";
    const CTO_ID = "f466e6aa-1a4c-4ba7-ac9c-5578b2f91dba";
    const CODER_ID = "6072fbc8-59f9-4efe-b731-aab9b8c7cbed";

    const runs: RunSummary[] = [
      makeSummary({ agentId: CEO_ID, status: "failed", mainError: "Err", endedAt: oneHourAgo }),
      makeSummary({ agentId: CEO_ID, status: "failed", mainError: "Err", endedAt: oneHourAgo }),
      makeSummary({ agentId: CTO_ID, status: "completed", endedAt: oneHourAgo }),
      makeSummary({ agentId: CODER_ID, status: "completed", endedAt: oneDayAgo }),
    ];
    const agents = deriveOfficeAgents(runs);

    // CEO failed (2 runs) → Coder stale (old endedAt) → CTO active (recent)
    // Sort order: failed > stale > active > idle
    expect(agents[0].id).toBe(CEO_ID);
    expect(agents[0].status).toBe("failed");
    expect(agents[1].id).toBe(CODER_ID);
    expect(agents[1].status).toBe("stale");
    expect(agents[2].id).toBe(CTO_ID);
    expect(agents[2].status).toBe("active");
  });

  it("attentionInfo is set based on status", () => {
    const runs: RunSummary[] = [
      makeSummary({ agentId: AGENT_ID_CEO, status: "failed", mainError: "Something broke badly", endedAt: oneHourAgo }),
    ];
    const agents = deriveOfficeAgents(runs);
    expect(agents[0].attentionInfo).toContain("Something broke");
  });

  it("agent with no runs does not appear", () => {
    const agents = deriveOfficeAgents([]);
    expect(agents).toHaveLength(0);
  });
});
