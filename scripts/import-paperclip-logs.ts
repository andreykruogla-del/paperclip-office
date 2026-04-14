import { importAllLogs } from "../src/server/import-logs";

console.log("Importing Paperclip logs into SQLite…\n");

const result = importAllLogs();

console.log("Import complete.\n");
console.log(`Runs imported:   ${result.runsImported}`);
console.log(`Events imported: ${result.eventsImported}`);
console.log(`Completed runs:  ${result.completedRuns}`);
console.log(`Failed runs:     ${result.failedRuns}`);

// Diagnostic output
if (result.diagnostics) {
  const d = result.diagnostics;
  console.log(`\n--- Diagnostics ---`);
  console.log(`Lines read:      ${d.linesRead}`);
  console.log(`Events parsed:   ${d.eventsParsed}`);
  console.log(`Lines dropped:   ${d.linesDropped}`);
  if (Object.keys(d.dropReasons).length > 0) {
    console.log(`Drop reasons:`);
    for (const [reason, count] of Object.entries(d.dropReasons)) {
      console.log(`  ${reason}: ${count}`);
    }
  }
}

// Fail-fast: if we found files but imported nothing, this is not success
if (result.diagnostics && result.diagnostics.linesRead > 0 && result.runsImported === 0) {
  console.error("\n⚠ WARNING: Log files were found but no runs were imported.");
  console.error("  This usually means the Paperclip log format doesn't match the parser.");
  console.error("  Check 'Drop reasons' above for details.");
  process.exit(1);
}

if (result.diagnostics && result.diagnostics.linesRead === 0) {
  console.error("\n⚠ WARNING: No log files found.");
  console.error("  Make sure Paperclip is running in Docker as 'paperclip-paperclip-1'.");
  process.exit(1);
}
