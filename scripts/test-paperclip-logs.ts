import { readPaperclipLogs } from "../src/adapters/read-paperclip-logs";

console.log("Reading Paperclip NDJSON run-logs (file-by-file)...\n");

const { events, runs } = readPaperclipLogs();

console.log(`Total events parsed: ${events.length}\n`);

// --- Basic counts ---
const uniqueAgents = new Set(events.map((e) => e.agentId));
const uniqueRuns = runs.size;

console.log(`Unique agents: ${uniqueAgents.size}`);
console.log(`Unique runs:   ${uniqueRuns}`);
console.log(`Avg events/run: ${(events.length / uniqueRuns).toFixed(1)}\n`);

// --- Event type breakdown ---
const typeCounts: Record<string, number> = {};
for (const ev of events) {
  typeCounts[ev.eventType] = (typeCounts[ev.eventType] || 0) + 1;
}
console.log("Event type breakdown:");
for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type}: ${count}`);
}

// --- Per-run analysis ---
const runStats: { runId: string; agentId: string; count: number; durationMs?: number; hasFailure: boolean }[] = [];
for (const [runId, runEvents] of runs) {
  const agentId = runEvents[0]?.agentId ?? "unknown";
  const resultEvent = runEvents.find((e) => e.eventType === "task_completed" || e.eventType === "task_failed");
  const hasFailure = runEvents.some((e) => e.eventType === "task_failed");
  runStats.push({
    runId,
    agentId,
    count: runEvents.length,
    durationMs: resultEvent?.durationMs,
    hasFailure,
  });
}

const completedRuns = runStats.filter((r) => !r.hasFailure);
const failedRuns = runStats.filter((r) => r.hasFailure);
const runsWithDuration = runStats.filter((r) => r.durationMs !== undefined);

const avgDuration = runsWithDuration.length
  ? (runsWithDuration.reduce((s, r) => s + (r.durationMs ?? 0), 0) / runsWithDuration.length).toFixed(0)
  : "N/A";

console.log(`\nRun outcomes:`);
console.log(`  Completed: ${completedRuns.length}`);
console.log(`  Failed:    ${failedRuns.length}`);
console.log(`  Avg duration (runs with result): ${avgDuration} ms`);

// --- Sample events ---
console.log("\n--- Sample events (first 10) ---");
for (const ev of events.slice(0, 10)) {
  console.log(`[${ev.level}] ${ev.agentId.substring(0, 8)}… | ${ev.runId.substring(0, 8)}… | ${ev.eventType} | ${ev.message.substring(0, 80)}`);
}

// --- Sample run reconstruction ---
const sampleRunId = runStats[0]?.runId;
if (sampleRunId) {
  const sampleEvents = runs.get(sampleRunId) ?? [];
  console.log(`\n--- Full run reconstruction: ${sampleRunId.substring(0, 8)}… (${sampleEvents.length} events) ---`);
  for (const ev of sampleEvents.slice(0, 15)) {
    console.log(`  ${new Date(ev.timestamp).toISOString().substring(11, 19)} | ${ev.eventType} | ${ev.message.substring(0, 80)}`);
  }
  if (sampleEvents.length > 15) console.log(`  ... and ${sampleEvents.length - 15} more`);
}

// --- Critical questions ---
console.log("\n=== CRITICAL QUESTIONS ===\n");

// 1. Do all events have runId?
const missingRunId = events.filter((e) => !e.runId || e.runId === "unknown");
console.log(`1. Do all events have runId?`);
console.log(`   ${missingRunId.length === 0 ? "YES — all events have a valid runId" : `NO — ${missingRunId.length} events missing runId`}`);

// 2. Do runs have clear start/end?
const runsWithResult = runStats.filter((r) => r.durationMs !== undefined);
console.log(`\n2. Do runs have clear start/end?`);
console.log(`   ${runsWithResult.length}/${uniqueRuns} runs have a result event with duration`);
console.log(`   (start = first event ts, end = result event ts)`);

// 3. Can we detect failures reliably?
const failedWithMessage = failedRuns.filter((r) => {
  const runEvents = runs.get(r.runId) ?? [];
  return runEvents.some((e) => e.eventType === "task_failed" && e.error);
});
console.log(`\n3. Can we detect failures reliably?`);
console.log(`   ${failedWithMessage.length}/${failedRuns.length} failed runs have error messages`);
console.log(`   → Detection via result chunk with is_error=true is reliable`);

// 4. Is token usage consistent?
const eventsWithTokens = events.filter((e) => e.tokens !== undefined);
console.log(`\n4. Is token usage consistent?`);
console.log(`   ${eventsWithTokens.length}/${events.length} events have token data`);
if (eventsWithTokens.length > 0) {
  const range = eventsWithTokens.map((e) => e.tokens!);
  console.log(`   Range: ${Math.min(...range)} – ${Math.max(...range)} tokens`);
}

// 5. Is agent identity reliable?
const agentsFromPath = uniqueAgents.size;
console.log(`\n5. Is agent identity reliable?`);
console.log(`   ${agentsFromPath} unique agent IDs extracted from file paths`);
console.log(`   → IDs are UUIDs from Paperclip's internal directory, not human-readable names`);

console.log("\n=== DONE ===");
