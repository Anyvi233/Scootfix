/**
 * @file src/lib/security/xss.ts
 * @description XSS sanitisation helpers using DOMPurify via JSDOM on the server,
 * and the browser DOMPurify on the client.
 * Sanitise any user-supplied string before persisting or rendering it.
 */

// DOMPurify works natively in the browser. On the server (Node.js) we create a
// DOM environment using the JSDOM-based window that ships with DOMPurify v3+.

let purify: { sanitize: (dirty: string, cfg?: object) => string };

function getPurify() {
  if (purify) return purify;

  if (typeof window !== "undefined") {
    // Client side – DOMPurify works out of the box
    const DOMPurify = require("dompurify");
    purify = DOMPurify;
  } else {
    // Server side – use createDOMPurify with a jsdom window
    const { JSDOM } = require("jsdom");
    const DOMPurify = require("dompurify");
    const window = new JSDOM("").window;
    purify = DOMPurify(window);
  }

  return purify;
}

/**
 * Sanitise a string for safe HTML output.
 * Strips all tags, attributes and event handlers that could execute script.
 */
export function sanitizeHtml(dirty: string): string {
  return getPurify().sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Sanitise a string while preserving a safe subset of rich-text HTML tags.
 * Use this for product descriptions, etc.
 */
export function sanitizeRichText(dirty: string): string {
  return getPurify().sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitise an entire object's string values recursively.
 * Useful for sanitising request bodies before persisting to the DB.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "string") {
      (sanitized as any)[key] = sanitizeHtml(val);
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      (sanitized as any)[key] = sanitizeObject(val as Record<string, unknown>);
    } else {
      (sanitized as any)[key] = val;
    }
  }
  return sanitized;
}
