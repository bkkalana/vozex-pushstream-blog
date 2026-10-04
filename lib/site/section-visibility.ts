export function isPublicSectionVisible(configValue: unknown, now = new Date()) {
  if (!configValue || typeof configValue !== "object" || Array.isArray(configValue)) return true;
  const config = configValue as Record<string, unknown>;
  const from = typeof config.visibleFrom === "string" && config.visibleFrom ? new Date(config.visibleFrom) : null;
  const until = typeof config.visibleUntil === "string" && config.visibleUntil ? new Date(config.visibleUntil) : null;
  if (from && !Number.isNaN(from.getTime()) && now < from) return false;
  if (until && !Number.isNaN(until.getTime()) && now > until) return false;
  return true;
}
