import { createHash, createHmac, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function privacyHash(value: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(value.trim().toLowerCase()).digest("hex");
}
