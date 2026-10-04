const SCRIPT_BLOCK = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const DANGEROUS_TAG = /<\/?(?:object|embed|iframe|base|meta|link|style|form|input|button|textarea|select|option)\b[^>]*>/gi;
const EVENT_HANDLER = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /\s+(href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi;
const UNQUOTED_JS_URL = /\s+(href|src)\s*=\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>]*/gi;
const SRC_DOC = /\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

/**
 * Conservative sanitizer for administrator-managed ad snippets.
 * Executable scripts/event handlers are deliberately removed. Provider scripts
 * should be integrated through a reviewed provider-specific component instead.
 */
export function sanitizeTrustedAdHtml(value: string): string {
  return value
    .replace(SCRIPT_BLOCK, "")
    .replace(DANGEROUS_TAG, "")
    .replace(EVENT_HANDLER, "")
    .replace(JS_URL, " $1=\"#\"")
    .replace(UNQUOTED_JS_URL, " $1=\"#\"")
    .replace(SRC_DOC, "")
    .trim();
}
