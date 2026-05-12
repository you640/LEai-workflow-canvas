const RESTRICTED_TERMS = [
  "investor",
  "investors",
  "equity",
  "returns",
  "return on investment",
  "roi",
  "shares",
  "securities",
  "dividend",
  "yield",
  "capital raise",
  "guaranteed return",
  "profit guarantee",
] as const;

export interface ComplianceResult {
  passed: boolean;
  violations: string[];
}

export function scanRestrictedWording(input: string): ComplianceResult {
  const text = input.toLowerCase();
  const violations = RESTRICTED_TERMS.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(`\\b${escaped}\\b`, "i");
    return rx.test(text);
  });

  return { passed: violations.length === 0, violations };
}

export function scanProjectPayload(payload: unknown): ComplianceResult {
  const text = JSON.stringify(payload ?? "");
  return scanRestrictedWording(text);
}
