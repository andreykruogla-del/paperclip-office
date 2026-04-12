const CYCLE = ["CEO", "CTO", "Coder", "QA", "Observer"];

const ROLE_ARROWS: Record<string, string> = {
  CEO: "routes tasks",
  CTO: "defines scope",
  Coder: "implements",
  QA: "verifies",
  Observer: "reports",
};

export default function TeamContextPanel() {
  return (
    <div className="flex items-center gap-3 text-xs text-zinc-500">
      <span className="text-zinc-400 font-medium">Simfi-Mebel-AI</span>
      <span className="text-zinc-700">|</span>
      <span className="flex items-center gap-0.5">
        {CYCLE.map((role, i) => (
          <span key={role} className="flex items-center gap-0.5">
            <span className="text-zinc-300 font-medium">{role}</span>
            <span className="text-zinc-600 hidden sm:inline">{ROLE_ARROWS[role]}</span>
            {i < CYCLE.length - 1 && (
              <span className="text-zinc-600 mx-0.5">→</span>
            )}
          </span>
        ))}
      </span>
    </div>
  );
}
