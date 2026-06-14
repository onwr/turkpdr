const BLOCKED_TAGS =
  /<\s*(script|iframe|object|embed|form|link|meta|style)[^>]*>[\s\S]*?<\/\s*\1\s*>|<\s*(script|iframe|object|embed|form|link|meta|style)[^>]*\/?>/gi;

const EVENT_HANDLERS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_PROTOCOL = /javascript\s*:/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_PROTOCOL, "");
}
