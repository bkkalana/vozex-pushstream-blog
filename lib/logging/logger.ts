type LogMeta = Record<string, unknown>;
const SECRET_KEY = /(password|passwd|token|secret|authorization|cookie|session|database_url|smtp_password|api[_-]?key)/i;
function scrub(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => scrub(item, depth + 1));
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SECRET_KEY.test(key) ? "[redacted]" : scrub(item, depth + 1);
  }
  return out;
}
function clean(meta?: LogMeta): LogMeta | undefined { return meta ? scrub(meta) as LogMeta : undefined; }
export const logger = {
  info(message:string, meta?:LogMeta){ console.info(JSON.stringify({level:"info",message,...clean(meta)})); },
  warn(message:string, meta?:LogMeta){ console.warn(JSON.stringify({level:"warn",message,...clean(meta)})); },
  error(message:string, meta?:LogMeta){ console.error(JSON.stringify({level:"error",message,...clean(meta)})); },
};
