export default function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {label}:{" "}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {value}
        </span>
      </p>
    </div>
  );
}
