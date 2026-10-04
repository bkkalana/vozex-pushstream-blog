import fs from "node:fs";

const text = fs.readFileSync(".env", "utf8");
const env = {};
for (const rawLine of text.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq < 1) continue;
  const key = line.slice(0, eq).trim();
  let value = line.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const fail = (message) => {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
};

if (env.NODE_ENV !== "production") fail("NODE_ENV must be production");
if (!env.SITE_URL?.startsWith("https://")) fail("SITE_URL must use https://");
if (!env.DATABASE_URL) fail("DATABASE_URL is missing");
if ((env.SESSION_SECRET || "").length < 32) fail("SESSION_SECRET must be at least 32 characters");
if ((env.CRON_SECRET || "").length < 24) fail("CRON_SECRET must be at least 24 characters");
if ((env.SUPER_ADMIN_PASSWORD || "").length < 12) fail("SUPER_ADMIN_PASSWORD must be at least 12 characters");

const forbidden = ["replace-with", "change-me", "admin@example.com"];
for (const marker of forbidden) {
  if (text.toLowerCase().includes(marker)) fail(`placeholder value remains in .env: ${marker}`);
}

if (!process.exitCode) console.log("PASS: production .env validation");
