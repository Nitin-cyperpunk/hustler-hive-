export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(start: string, end?: string | null): string {
  const startDate = new Date(start);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  if (!end) return startDate.toLocaleDateString("en-IN", opts);

  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  if (sameDay) {
    const time = (d: Date) =>
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return `${startDate.toLocaleDateString("en-IN", opts)}, ${time(startDate)} – ${time(endDate)}`;
  }
  return `${startDate.toLocaleDateString("en-IN", opts)} – ${endDate.toLocaleDateString("en-IN", opts)}`;
}

export function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}
