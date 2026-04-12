import type { ActivityEvent } from "@/types/dashboard";
import ActivityFeedItem from "./ActivityFeedItem";

export default function ActivityFeed({
  title,
  events,
}: {
  title: string;
  events: ActivityEvent[];
}) {
  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {events.map((event) => (
          <ActivityFeedItem key={event.id} event={event} />
        ))}
      </ul>
    </div>
  );
}
