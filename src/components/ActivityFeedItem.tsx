import type { ActivityEvent } from "@/types/dashboard";

const statusColors: Record<ActivityEvent["status"], string> = {
  ok: "text-zinc-600 dark:text-zinc-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

export default function ActivityFeedItem({
  event,
}: {
  event: ActivityEvent;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span className="shrink-0 font-mono text-xs text-zinc-400 dark:text-zinc-500">
        {event.time}
      </span>
      <span className="flex-1 text-zinc-700 dark:text-zinc-300">
        {event.title}
      </span>
      <span className={`shrink-0 capitalize ${statusColors[event.status]}`}>
        {event.status}
      </span>
    </li>
  );
}
