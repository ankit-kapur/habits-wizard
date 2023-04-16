export function getPrettyTimestamp(epochTimestamp?: number): string {
  if (!epochTimestamp) return "";
  return new Date(epochTimestamp).toLocaleString("en-US", {
    // weekday: "short",
    // year: "numeric",
    // month: "2-digit",
    // day: "2-digit",
    timeStyle: "short",
    dateStyle: "long",
  });
}
