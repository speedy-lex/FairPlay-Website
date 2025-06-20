export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value
  return value !== null && value !== undefined ? [value] : []
}

/**
 * Normalize a "themes" field coming from Supabase.
 * The field may be:
 *   - an array of strings (text[] column)
 *   - a JSON string like "[\"tag\"]"
 *   - the string "[]"
 *   - null
 * In all cases we want to return a string array. If the result is empty,
 * an empty array is returned.
 */
export function parseThemes(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value
  if (value === null || value === undefined || value === '' || value === '[]') return []

  try {
    const parsed = JSON.parse(value as string)
    if (Array.isArray(parsed)) return parsed
  } catch {
    /* ignore JSON parse errors */
  }

  return [value as string]
}
