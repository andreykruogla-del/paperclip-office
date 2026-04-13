/**
 * Import sample data for demo purposes.
 *
 * Usage: npm run import:sample
 *
 * This seeds realistic run data into SQLite so the app works
 * out of the box without a real Paperclip instance.
 */

import { initSchema, importRun, db } from "../src/server/db";

const AGENTS = {
  CEO: {
    id: "24c80233-48c1-4d5f-814f-26b9c527e4c0",
    displayName: "CEO",
    role: "orchestration",
    runtime: "paperclip",
    description: "Top-level project coordinator — routes tasks, manages priorities, requests Owner approval",
  },
  CTO: {
    id: "f466e6aa-1a4c-4ba7-ac9c-5578b2f91dba",
    displayName: "CTO",
    role: "architecture",
    runtime: "paperclip",
    description: "Defines technical scope, bounded cycles, handoff contracts, and architecture decisions",
  },
  Coder: {
    id: "6072fbc8-59f9-4efe-b731-aab9b8c7cbed",
    displayName: "Coder",
    role: "implementation",
    runtime: "paperclip",
    description: "Executes bounded implementation tasks — reads context, writes code, reports results",
  },
  QA: {
    id: "f4969b3d-f195-44d9-89ea-67070be67922",
    displayName: "QA",
    role: "verification",
    runtime: "paperclip",
    description: "Verifies implementation against scope — checks regressions, reports pass/fail with risks",
  },
  Observer: {
    id: "1d60b6e6-986b-4c44-9dd2-af1841856f17",
    displayName: "Observer",
    role: "monitoring",
    runtime: "paperclip",
    description: "Collects normalized operational summaries — tracks cycle state, reports blockers to CEO",
  },
};

type EventDef = {
  type: "activity" | "input" | "result_success" | "result_error";
  message: string;
  delay: number; // seconds from run start
  error?: string;
  durationMs?: number;
  tokens?: number;
};

const RUN_SCENARIOS: { agentKey: keyof typeof AGENTS; events: EventDef[] }[] = [
  // CEO — successful cycle start
  {
    agentKey: "CEO",
    events: [
      { type: "activity", message: "Reading heartbeat and assigned issues", delay: 0 },
      { type: "activity", message: "Checking team state: CTO idle, Coder idle, QA idle", delay: 15 },
      { type: "activity", message: "Routing bounded cycle: CTO → Coder → QA → Observer", delay: 30 },
      { type: "result_success", message: "Cycle initiated successfully. Next handoff to CTO.", delay: 45, durationMs: 45000, tokens: 12400 },
    ],
  },
  // CTO — scope definition
  {
    agentKey: "CTO",
    events: [
      { type: "activity", message: "Reading issue scope and project context files", delay: 0 },
      { type: "activity", message: "Analyzing requirements for bounded cycle definition", delay: 20 },
      { type: "activity", message: "Drafting handoff contract: CTO → Coder → QA → Observer", delay: 45 },
      { type: "result_success", message: "Scope defined. Handoff contract ready. Routing to Coder.", delay: 70, durationMs: 70000, tokens: 48200 },
    ],
  },
  // Coder — failed run (API limit)
  {
    agentKey: "Coder",
    events: [
      { type: "activity", message: "Reading context bundle and project files", delay: 0 },
      { type: "activity", message: "Processing implementation task from CTO handoff", delay: 30 },
      { type: "activity", message: "Executing bounded implementation scope", delay: 90 },
      { type: "result_error", message: "API rate limit exceeded. Retry required after credential refresh.", delay: 180, error: "API rate limit exceeded. Service temporarily unavailable.", durationMs: 180000, tokens: 1200000 },
    ],
  },
  // QA — failed (no Coder result to verify)
  {
    agentKey: "QA",
    events: [
      { type: "activity", message: "Waiting for Coder result to verify", delay: 0 },
      { type: "activity", message: "No implementation result found — Coder run failed", delay: 10 },
      { type: "result_error", message: "Cannot verify: upstream Coder run has no output. Marking as blocked.", delay: 30, error: "No implementation result from Coder to verify. Upstream failure.", durationMs: 30000, tokens: 8500 },
    ],
  },
  // Observer — successful monitoring
  {
    agentKey: "Observer",
    events: [
      { type: "activity", message: "Collecting team state snapshot", delay: 0 },
      { type: "activity", message: "CEO: running, CTO: completed, Coder: failed, QA: failed", delay: 15 },
      { type: "activity", message: "Generating operational summary for CEO", delay: 40 },
      { type: "result_success", message: "Summary: cycle partially completed. Blocker: Coder API unavailable. Next action: CEO needs Owner attention.", delay: 65, durationMs: 65000, tokens: 32000 },
    ],
  },
  // CEO — second attempt, failed
  {
    agentKey: "CEO",
    events: [
      { type: "activity", message: "Reviewing Observer summary from previous cycle", delay: 0 },
      { type: "activity", message: "Identifying blocker: Coder API usage limit", delay: 15 },
      { type: "activity", message: "Requesting Owner approval to retry with alternative approach", delay: 35 },
      { type: "result_error", message: "Authorization timeout waiting for Owner response.", delay: 120, error: "Authorization timeout, please restart the process.", durationMs: 120000, tokens: 22000 },
    ],
  },
  // CTO — completed
  {
    agentKey: "CTO",
    events: [
      { type: "activity", message: "Re-reading bounded cycle scope after Coder failure", delay: 0 },
      { type: "activity", message: "Adjusting scope for retry: smaller implementation step", delay: 25 },
      { type: "result_success", message: "Adjusted scope ready. Recommending minimal safe retry step to CEO.", delay: 55, durationMs: 55000, tokens: 41000 },
    ],
  },
  // Coder — successful (second attempt)
  {
    agentKey: "Coder",
    events: [
      { type: "activity", message: "Reading adjusted scope from CTO", delay: 0 },
      { type: "activity", message: "Executing minimal implementation step", delay: 40 },
      { type: "result_success", message: "Minimal step completed. Context files updated.", delay: 120, durationMs: 120000, tokens: 980000 },
    ],
  },
  // QA — completed (second attempt)
  {
    agentKey: "QA",
    events: [
      { type: "activity", message: "Verifying Coder's minimal implementation step", delay: 0 },
      { type: "activity", message: "Checking context file changes against scope", delay: 20 },
      { type: "result_success", message: "Pass with minor risk: scope verification complete. No regressions detected.", delay: 45, durationMs: 45000, tokens: 28000 },
    ],
  },
  // Observer — completed cycle summary
  {
    agentKey: "Observer",
    events: [
      { type: "activity", message: "Collecting final team state after retry cycle", delay: 0 },
      { type: "activity", message: "All agents completed: CEO blocked→resolved, CTO×2, Coder×2, QA×2", delay: 20 },
      { type: "result_success", message: "Cycle complete. Team state: all issues resolved. Ready for next Owner assignment.", delay: 50, durationMs: 50000, tokens: 35000 },
    ],
  },
  // CEO — additional completed run
  {
    agentKey: "CEO",
    events: [
      { type: "activity", message: "Reviewing Observer final summary", delay: 0 },
      { type: "activity", message: "Cycle complete. Preparing report for Owner.", delay: 15 },
      { type: "result_success", message: "Owner notified. Team idle, awaiting next assignment.", delay: 30, durationMs: 30000, tokens: 15000 },
    ],
  },
];

function makeRunId(): string {
  return crypto.randomUUID();
}

function makeEvents(agentId: string, runId: string, events: EventDef[], baseTime: number) {
  return events.map((ev, i) => {
    const timestamp = baseTime + ev.delay * 1000;
    return {
      id: crypto.randomUUID(),
      runId,
      agentId,
      timestamp,
      eventType:
        ev.type === "activity" ? "agent_activity"
        : ev.type === "input" ? "user_input"
        : ev.type === "result_success" ? "task_completed"
        : "task_failed",
      normalizedType: ev.type,
      level: ev.type === "result_error" ? "error" : "info",
      message: ev.message,
      error: ev.error ?? undefined,
      durationMs: ev.durationMs ?? undefined,
      tokens: ev.tokens ?? undefined,
      raw: {
        type: ev.type === "activity" ? "assistant"
          : ev.type === "input" ? "user"
          : "result",
        message: ev.message,
        ...(ev.error ? { error: { message: ev.error } } : {}),
        ...(ev.durationMs ? { duration_ms: ev.durationMs } : {}),
        ...(ev.tokens ? { usage: { total_tokens: ev.tokens } } : {}),
      },
    };
  });
}

console.log("Importing sample demo data…\n");

initSchema();

// Generate runs across the last ~24 hours
const baseTime = Date.now() - 24 * 60 * 60 * 1000;
let totalRuns = 0;
let totalEvents = 0;

for (const scenario of RUN_SCENARIOS) {
  const agent = AGENTS[scenario.agentKey];
  const runId = makeRunId();
  const events = makeEvents(agent.id, runId, scenario.events, baseTime + totalRuns * 2 * 60 * 60 * 1000);

  importRun(runId, events, "sample-v1");
  totalRuns++;
  totalEvents += events.length;
}

// Also insert agent profiles into the local config note
console.log("Sample data loaded.\n");
console.log(`Runs imported:   ${totalRuns}`);
console.log(`Events imported: ${totalEvents}`);
console.log(`Agents:          ${Object.keys(AGENTS).length}`);
console.log("\nYou can now run: npm run dev");
console.log("Open http://localhost:3000 to see the demo.");
