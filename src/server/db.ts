import Database from "better-sqlite3";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "paperclip-office.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

let _initialized = false;
let _stmts: ReturnType<typeof createStatements> | null = null;

// --- Row types ---

export type DbRun = {
  run_id: string;
  agent_id: string;
  started_at: number | null;
  ended_at: number | null;
  status: string;
  event_count: number;
  duration_ms: number | null;
  total_tokens: number | null;
  main_error: string | null;
  parser_version: string | null;
  imported_at: number;
};

export type DbEvent = {
  id: string;
  run_id: string;
  agent_id: string;
  timestamp: number;
  event_type: string;
  normalized_type: string;
  level: string;
  message: string;
  tokens: number | null;
  duration_ms: number | null;
  error: string | null;
  raw_json: string | null;
};

function createStatements() {
  return {
    getAllRuns: db.prepare("SELECT * FROM runs ORDER BY ended_at DESC"),
    getEventsForRun: db.prepare("SELECT * FROM events WHERE run_id = ? ORDER BY timestamp ASC"),
    insertRun: db.prepare(`
      INSERT INTO runs (run_id, agent_id, started_at, ended_at, status, event_count, duration_ms, total_tokens, main_error, parser_version, imported_at)
      VALUES (@runId, @agentId, @startedAt, @endedAt, @status, @eventCount, @durationMs, @totalTokens, @mainError, @parserVersion, @importedAt)
      ON CONFLICT(run_id) DO NOTHING
    `),
    insertEvent: db.prepare(`
      INSERT OR IGNORE INTO events (id, run_id, agent_id, timestamp, event_type, normalized_type, level, message, tokens, duration_ms, error, raw_json)
      VALUES (@id, @runId, @agentId, @timestamp, @eventType, @normalizedType, @level, @message, @tokens, @durationMs, @error, @rawJson)
    `),
  };
}

function stmts() {
  if (!_initialized) {
    initSchema();
  }
  if (!_stmts) {
    _stmts = createStatements();
  }
  return _stmts;
}

export function initSchema() {
  if (_initialized) return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS runs (
      run_id        TEXT PRIMARY KEY,
      agent_id      TEXT NOT NULL,
      started_at    INTEGER,
      ended_at      INTEGER,
      status        TEXT NOT NULL,
      event_count   INTEGER DEFAULT 0,
      duration_ms   INTEGER,
      total_tokens  INTEGER,
      main_error    TEXT,
      parser_version TEXT,
      imported_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id            TEXT PRIMARY KEY,
      run_id        TEXT NOT NULL,
      agent_id      TEXT NOT NULL,
      timestamp     INTEGER NOT NULL,
      event_type    TEXT NOT NULL,
      normalized_type TEXT NOT NULL,
      level         TEXT NOT NULL,
      message       TEXT NOT NULL,
      tokens        INTEGER,
      duration_ms   INTEGER,
      error         TEXT,
      raw_json      TEXT,
      FOREIGN KEY (run_id) REFERENCES runs(run_id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_run_id ON events(run_id);
    CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
    CREATE INDEX IF NOT EXISTS idx_runs_agent ON runs(agent_id);
  `);
  _initialized = true;
}

// --- Query helpers ---

export function getAllRuns(): DbRun[] {
  return stmts().getAllRuns.all() as DbRun[];
}

export function getEventsForRun(runId: string): DbEvent[] {
  return stmts().getEventsForRun.all(runId) as DbEvent[];
}

export function getParserDebug() {
  const totalRuns = (db.prepare("SELECT COUNT(*) as count FROM runs").get() as { count: number }).count;
  const totalEvents = (db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number }).count;
  const lastVersion = db.prepare("SELECT parser_version FROM runs ORDER BY imported_at DESC LIMIT 1").get() as { parser_version: string | null } | undefined;
  return {
    parserVersion: lastVersion?.parser_version ?? "unknown",
    totalRuns,
    totalEvents,
    unparsedCount: 0,
  };
}

// --- Insert helpers ---

type EventShape = {
  id: string;
  agentId: string;
  timestamp: number;
  eventType: string;
  normalizedType: string;
  level: string;
  message: string;
  tokens?: number;
  durationMs?: number;
  error?: string;
  raw?: unknown;
};

export function importRun(runId: string, events: EventShape[], parserVersion: string) {
  initSchema();
  if (events.length === 0) return;

  const first = events[0];
  const last = events[events.length - 1];

  const resultEvent = events.find(
    (e) => e.normalizedType === "result_success" || e.normalizedType === "result_error"
  );

  const status = resultEvent?.normalizedType === "result_success" ? "completed" : "failed";
  const mainError = resultEvent?.error ?? null;

  const startedAt = first.timestamp ?? null;
  const endedAt = last.timestamp ?? null;
  const durationMs = resultEvent?.durationMs ?? null;
  const totalTokens = resultEvent?.tokens ?? null;

  const s = stmts();
  s.insertRun.run({
    runId,
    agentId: first.agentId,
    startedAt,
    endedAt,
    status,
    eventCount: events.length,
    durationMs,
    totalTokens,
    mainError,
    parserVersion,
    importedAt: Date.now(),
  });

  const eventRows: Array<Record<string, unknown>> = events.map((e) => ({
    id: e.id,
    runId,
    agentId: e.agentId,
    timestamp: e.timestamp,
    eventType: e.eventType,
    normalizedType: e.normalizedType,
    level: e.level,
    message: e.message,
    tokens: e.tokens ?? null,
    durationMs: e.durationMs ?? null,
    error: e.error ?? null,
    rawJson: e.raw !== undefined ? JSON.stringify(e.raw) : null,
  }));

  const insertBulk = db.transaction((rows: Array<Record<string, unknown>>) => {
    for (const ev of rows) {
      s.insertEvent.run(ev);
    }
  });

  insertBulk(eventRows);
}

export { db };
