import { randomUUID } from "node:crypto";
export function getRequestId(headers: Headers): string { return headers.get("x-request-id")?.slice(0,128) || randomUUID(); }
