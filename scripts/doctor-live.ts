import { execSync } from "node:child_process";

const CONTAINER = "paperclip-paperclip-1";
const LOG_PATH = "/paperclip/instances/default/data/run-logs";

type Check = { name: string; ok: boolean; detail?: string };

function run(cmd: string): { ok: boolean; output: string } {
  try {
    const output = execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
    return { ok: true, output: output.trim() };
  } catch (err: any) {
    return { ok: false, output: (err.stderr || err.message || "").trim().slice(0, 200) };
  }
}

function check(name: string, ok: boolean, detail?: string): Check {
  return { name, ok, detail };
}

const checks: Check[] = [];

// 1. Docker CLI
const docker = run("docker --version");
checks.push(
  check(
    "Docker CLI",
    docker.ok,
    docker.ok ? docker.output : "Docker is not installed or not in PATH"
  )
);

if (!docker.ok) {
  printResult(checks, "Install Docker: https://docs.docker.com/get-docker/");
  process.exit(1);
}

// 2. Container exists and is running
const ps = run(`docker inspect --format '{{.State.Running}}' ${CONTAINER}`);
const containerRunning = ps.ok && ps.output === "true";

if (!containerRunning) {
  const exists = ps.ok;
  checks.push(
    check(
      `Container '${CONTAINER}'`,
      false,
      exists ? "Container exists but is not running" : `Container '${CONTAINER}' not found`
    )
  );
  const hint = exists
    ? `Start it: docker start ${CONTAINER}`
    : `Ensure Paperclip is running in Docker as '${CONTAINER}'`;
  printResult(checks, hint);
  process.exit(1);
}

checks.push(check(`Container '${CONTAINER}'`, true, "running"));

// 3. Log path accessible
const ls = run(`docker exec ${CONTAINER} test -d ${LOG_PATH} && echo OK`);
const logsExist = ls.ok && ls.output === "OK";

checks.push(
  check(
    `Log path: ${LOG_PATH}`,
    logsExist,
    logsExist ? "accessible" : "path not found inside container"
  )
);

// 4. Check if there are actual NDJSON files
if (logsExist) {
  const count = run(`docker exec ${CONTAINER} find ${LOG_PATH} -name '*.ndjson' | wc -l`);
  const n = count.ok ? parseInt(count.output, 10) : 0;
  checks.push(
    check(
      "NDJSON log files",
      n > 0,
      n > 0 ? `${n} files found` : "No .ndjson files found in log directory"
    )
  );
}

// Result
const allOk = checks.every((c) => c.ok);

if (allOk) {
  printResult(checks, `Ready: run 'npm run import:paperclip'`);
} else {
  printResult(
    checks,
    "Check the failed items above. Ensure Paperclip has run at least once to generate logs."
  );
  process.exit(1);
}

function printResult(checks: Check[], nextStep: string) {
  const pass = "\u2705";
  const fail = "\u274C";
  console.log("\n  paperclip-office live environment check\n");
  for (const c of checks) {
    const icon = c.ok ? pass : fail;
    const detail = c.detail ? ` — ${c.detail}` : "";
    console.log(`  ${icon} ${c.name}${detail}`);
  }
  console.log(`\n  Next: ${nextStep}\n`);
}
