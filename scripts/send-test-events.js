const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function send(events) {
  const res = await fetch(`${BASE}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events),
  });
  const data = await res.json();
  console.log(`Sent ${events.length} event(s) →`, data);
}

async function main() {
  const agentId = "agent_planner_01";
  const taskId = "task_42";
  const now = Date.now();

  const events = [
    {
      eventId: `evt_${Date.now()}_1`,
      timestamp: now,
      agentId,
      eventType: "agent_started",
    },
    {
      eventId: `evt_${Date.now() + 500}_2`,
      timestamp: now + 500,
      agentId,
      eventType: "task_started",
      taskId,
    },
    {
      eventId: `evt_${Date.now() + 1000}_3`,
      timestamp: now + 1000,
      agentId: "agent_researcher_03",
      eventType: "handoff",
      taskId,
      payload: { target_agent: "agent_researcher_03" },
    },
    {
      eventId: `evt_${Date.now() + 1500}_4`,
      timestamp: now + 1500,
      agentId: "agent_researcher_03",
      eventType: "task_completed",
      taskId,
    },
  ];

  console.log("Sending simulated agent events...\n");

  for (const event of events) {
    await send([event]);
    await sleep(800);
  }

  console.log("\nDone.");
}

main();
