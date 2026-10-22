const statusStyles: Record<string, string> = {
  draft: "bg-yellow-400/10 text-yellow-400",
  published: "bg-green-400/10 text-green-400",
  completed: "bg-gray-400/10 text-gray-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        statusStyles[status] ?? "bg-white/5 text-gray-400"
      }`}
    >
      {status}
    </span>
  );
}
