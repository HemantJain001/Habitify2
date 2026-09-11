export const POWER_CATEGORIES = ["brain", "muscle", "money"] as const
export type PowerCategory = (typeof POWER_CATEGORIES)[number]
export function isPowerCategory(v: unknown): v is PowerCategory {
  return typeof v === "string" && (POWER_CATEGORIES as readonly string[]).includes(v)
}
