function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function hasRandomUUID(value: unknown): value is { randomUUID: () => string } {
  return isObject(value) && typeof value.randomUUID === "function"
}

function hasGetRandomValues(value: unknown): value is { getRandomValues: (arr: Uint8Array) => Uint8Array } {
  return isObject(value) && typeof value.getRandomValues === "function"
}

function uuidFromBytes(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`
}

export function randomId(prefix = "id"): string {
  const g = globalThis as { crypto?: unknown }
  const c = g.crypto

  if (hasRandomUUID(c)) {
    return c.randomUUID()
  }

  if (hasGetRandomValues(c)) {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    return uuidFromBytes(bytes)
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 12)}`
}
