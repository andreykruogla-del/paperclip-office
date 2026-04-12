import { importAllLogs } from "../src/server/import-logs";

console.log("Importing Paperclip logs into SQLite…\n");

const result = importAllLogs();

console.log("Import complete.\n");
console.log(`Runs imported:   ${result.runsImported}`);
console.log(`Events imported: ${result.eventsImported}`);
console.log(`Completed runs:  ${result.completedRuns}`);
console.log(`Failed runs:     ${result.failedRuns}`);
