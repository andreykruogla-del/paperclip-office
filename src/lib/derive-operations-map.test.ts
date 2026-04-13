import { describe, it, expect, vi } from "vitest";
import type { OfficeAgent } from "@/lib/derive-office-agents";
import type { OperationsMapNode } from "@/types/operations-map";

// Mock the local config before importing the module
vi.mock("@/data/operations-nodes.local", () => ({
  TOOL_SERVICE_NODES: [
    {
      id: "scraper",
      kind: "tool",
      category: "data_intake",
      label: "Scraper",
      status: "unknown",
      description: "Data collection tool.",
    } as OperationsMapNode,
    {
      id: "llm-api",
      kind: "external",
      category: "external_api",
      label: "LLM API",
      status: "unknown",
      description: "External LLM provider.",
    } as OperationsMapNode,
  ],
  TOOL_SERVICE_RELATIONS: [
    { from: "ceo", to: "llm-api", label: "depends on" },
    { from: "cto", to: "llm-api", label: "depends on" },
    { from: "coder", to: "scraper", label: "uses" },
    { from: "unknown-role", to: "llm-api", label: "uses" }, // won't resolve → should be filtered
  ],
}));

const { deriveOperationsMap } = await import("./derive-operations-map");

// ─── Fixtures ─────────────────────────────────────────────

function makeAgent(overrides: Partial<OfficeAgent>): OfficeAgent {
  return {
    id: `agent-${Math.random().toString(36).slice(2)}`,
    profile: {
      agentId: "",
      displayName: "CEO",
      role: "orchestration",
      runtime: "paperclip",
      description: "Test agent",
    },
    displayName: "CEO",
    role: "orchestration",
    runtime: "paperclip",
    status: "active",
    lastSeen: Date.now(),
    latestRunId: "run-1",
    latestRunStatus: "completed",
    latestError: null,
    runCount: 1,
    failedRunCount: 0,
    attentionInfo: "",
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────

describe("deriveOperationsMap", () => {
  it("creates agent nodes from OfficeAgent[]", () => {
    const agents = [
      makeAgent({ id: "agent-ceo", displayName: "CEO", status: "active" }),
      makeAgent({ id: "agent-coder", displayName: "Coder", status: "failed" }),
    ];
    const map = deriveOperationsMap(agents);

    const agentNodes = map.nodes.filter((n) => n.kind === "agent");
    expect(agentNodes).toHaveLength(2);
    expect(agentNodes.find((n) => n.label === "CEO")).toBeDefined();
    expect(agentNodes.find((n) => n.label === "Coder")).toBeDefined();
  });

  it("adds tool/service nodes from local config", () => {
    const agents = [makeAgent({ displayName: "CEO" })];
    const map = deriveOperationsMap(agents);

    const toolNodes = map.nodes.filter((n) => n.kind !== "agent");
    expect(toolNodes).toHaveLength(2);
    expect(toolNodes.find((n) => n.id === "scraper")).toBeDefined();
    expect(toolNodes.find((n) => n.id === "llm-api")).toBeDefined();
  });

  it("resolves symbolic role relations to real agent IDs", () => {
    const agents = [makeAgent({ id: "real-ceo-id", displayName: "CEO" })];
    const map = deriveOperationsMap(agents);

    // "ceo" → "real-ceo-id" should be resolved
    const ceoToLlm = map.relations.find(
      (r) => r.from === "real-ceo-id" && r.to === "llm-api"
    );
    expect(ceoToLlm).toBeDefined();
  });

  it("filters out relations where symbolic role has no matching agent", () => {
    const agents = [makeAgent({ id: "real-ceo-id", displayName: "CEO" })];
    const map = deriveOperationsMap(agents);

    // "unknown-role" doesn't match any agent → relation should be filtered
    const unknownRelation = map.relations.find((r) => r.from === "unknown-role");
    expect(unknownRelation).toBeUndefined();
  });

  it("no relations created when no agents match symbolic roles", () => {
    // Agent with displayName that doesn't match any known role
    const agents = [makeAgent({ id: "some-agent", displayName: "RandomBot" })];
    const map = deriveOperationsMap(agents);

    // No CEO/CTO/Coder/QA/Observer → all agent-related relations filtered
    // Only tool-to-tool relations would remain (none in this mock)
    expect(map.relations).toHaveLength(0);
  });

  it("agent node status reflects OfficeAgent status", () => {
    const agents = [
      makeAgent({ id: "a1", displayName: "CEO", status: "failed" }),
      makeAgent({ id: "a2", displayName: "CTO", status: "stale" }),
    ];
    const map = deriveOperationsMap(agents);

    const ceoNode = map.nodes.find((n) => n.id === "a1");
    const ctoNode = map.nodes.find((n) => n.id === "a2");
    expect(ceoNode?.status).toBe("failed");
    expect(ctoNode?.status).toBe("stale");
  });

  it("all relations reference existing node IDs", () => {
    const agents = [makeAgent({ id: "ceo-1", displayName: "CEO" })];
    const map = deriveOperationsMap(agents);

    const allIds = new Set(map.nodes.map((n) => n.id));
    for (const rel of map.relations) {
      expect(allIds.has(rel.from)).toBe(true);
      expect(allIds.has(rel.to)).toBe(true);
    }
  });
});
