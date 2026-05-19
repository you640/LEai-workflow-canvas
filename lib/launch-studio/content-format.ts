const PLACEHOLDER_PHRASES = [
  "Krátke vysvetlenie",
  "Hlavné prínosy",
  "Tri až štyri kroky",
  "Balíky alebo varianty",
  "Najčastejšie otázky",
  "Tu bude",
  "Placeholder",
  "Lorem ipsum",
] as const;

const FORBIDDEN_CLAIM_PATTERNS = [
  /fake testimonials?/i,
  /fake customer count/i,
  /fake revenue/i,
  /guaranteed income/i,
  /guaranteed (first )?position in google/i,
  /guaranteed sales/i,
  /guaranteed results?/i,
  /hidden admin bypass/i,
  /lottery|gambling/i,
  /manipulative urgency/i,
] as const;

const FORBIDDEN_EDITOR_TAG_PATTERN = /<(script|style|iframe|object|embed|form|input|button|svg)\b/i;
const FORBIDDEN_EDITOR_ATTR_PATTERN = /\s(on\w+|style|class|className)\s*=/i;
const TAG_EXTRACTOR = /<\/?([a-z0-9-]+)(\s[^>]*)?>/gi;
const ALLOWED_EDITOR_TAGS = new Set(["h2", "h3", "p", "ul", "ol", "li", "strong", "em", "a", "br"]);
const LAYOUT_TAG_PATTERN = /<\/?(div|section|article|main|header|footer|aside|nav|span)\b/i;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const JAVASCRIPT_PROTOCOL_PATTERN = /javascript:|data:text\/html/i;
const PLACEHOLDER_URL_PATTERN = /(example\.com|localhost|127\.0\.0\.1|placeholder|dummy|lorem)/i;
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const DISALLOWED_LAYOUT_KEYS = new Set(["classname", "style", "components", "blocks", "jsx", "css", "tailwind"]);

function sanitizeWhitespace(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
}

export function stripHtmlForPlainText(value: string): string {
  return sanitizeWhitespace(value.replace(HTML_TAG_PATTERN, " ").replace(/\s+/g, " "));
}

export function containsPlaceholderText(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_PHRASES.some((phrase) => lower.includes(phrase.toLowerCase()));
}

export function containsForbiddenClaims(value: string): boolean {
  return FORBIDDEN_CLAIM_PATTERNS.some((pattern) => pattern.test(value));
}

export function containsForbiddenHtml(value: string): boolean {
  if (!value.includes("<")) {
    return false;
  }

  if (FORBIDDEN_EDITOR_TAG_PATTERN.test(value) || FORBIDDEN_EDITOR_ATTR_PATTERN.test(value) || LAYOUT_TAG_PATTERN.test(value)) {
    return true;
  }

  TAG_EXTRACTOR.lastIndex = 0;
  let match = TAG_EXTRACTOR.exec(value);
  while (match) {
    const tagName = match[1]?.toLowerCase();
    if (tagName && !ALLOWED_EDITOR_TAGS.has(tagName)) {
      return true;
    }
    match = TAG_EXTRACTOR.exec(value);
  }

  if (JAVASCRIPT_PROTOCOL_PATTERN.test(value)) {
    return true;
  }

  return false;
}

export function sanitizeEditorContent(value: unknown): string {
  const asString = typeof value === "string" ? value : "";
  const normalized = sanitizeWhitespace(asString);

  if (!normalized) {
    return "";
  }

  if (containsForbiddenHtml(normalized)) {
    return stripHtmlForPlainText(normalized);
  }

  return normalized;
}

export function normalizeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

export function normalizeNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = sanitizeWhitespace(value);
  return trimmed.length > 0 ? trimmed : null;
}

export function assertPlainText(value: unknown, fieldName: string): string[] {
  if (typeof value !== "string") {
    return [`${fieldName}_not_string`];
  }

  const text = sanitizeWhitespace(value);
  const errors: string[] = [];

  if (!text) {
    errors.push(`${fieldName}_empty`);
  }
  if (HTML_TAG_PATTERN.test(text)) {
    errors.push(`${fieldName}_contains_html`);
  }
  if (containsPlaceholderText(text)) {
    errors.push(`${fieldName}_contains_placeholder`);
  }
  if (containsForbiddenClaims(text)) {
    errors.push(`${fieldName}_contains_forbidden_claim`);
  }

  return errors;
}

export function assertStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    return [`${fieldName}_not_array`];
  }

  const errors: string[] = [];
  value.forEach((item, index) => {
    if (typeof item !== "string") {
      errors.push(`${fieldName}[${index}]_not_string`);
      return;
    }
    const trimmed = sanitizeWhitespace(item);
    if (!trimmed) {
      errors.push(`${fieldName}[${index}]_empty`);
    }
    if (HTML_TAG_PATTERN.test(trimmed)) {
      errors.push(`${fieldName}[${index}]_contains_html`);
    }
    if (containsPlaceholderText(trimmed)) {
      errors.push(`${fieldName}[${index}]_contains_placeholder`);
    }
  });

  return errors;
}

export function containsLayoutMarkup(value: string): boolean {
  return LAYOUT_TAG_PATTERN.test(value) || /\s(class|className|style)\s*=/.test(value);
}

export function isIsoDatetimeOrNull(value: unknown): boolean {
  if (value === null) return true;
  if (typeof value !== "string") return false;
  return ISO_DATETIME_PATTERN.test(value);
}

export function isPlaceholderUrl(value: string): boolean {
  return PLACEHOLDER_URL_PATTERN.test(value);
}

export function collectDisallowedLayoutKeys(value: unknown, basePath = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectDisallowedLayoutKeys(item, `${basePath}[${index}]`));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const errors: string[] = [];

  for (const [key, nested] of entries) {
    const path = basePath ? `${basePath}.${key}` : key;
    if (DISALLOWED_LAYOUT_KEYS.has(key.toLowerCase())) {
      errors.push(path);
    }
    errors.push(...collectDisallowedLayoutKeys(nested, path));
  }

  return errors;
}

