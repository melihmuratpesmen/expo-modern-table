/**
 * Parses user-typed numbers. Accepts a comma as decimal separator (common on Turkish and
 * other European keyboards). Returns `undefined` for blank or invalid input.
 */
export function parseNumberInput(text: string): number | undefined {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') return undefined;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

/** Sentinel for an edit that should be discarded. */
export const INVALID_EDIT = Symbol('invalid-edit');

/**
 * Converts edited cell text back to the type of the original value, so a number column
 * stays numeric. Invalid numbers yield `INVALID_EDIT` and the edit is dropped.
 */
export function parseEditedValue(text: string, original: unknown): unknown {
  if (typeof original === 'number') {
    const value = parseNumberInput(text);
    return value === undefined ? INVALID_EDIT : value;
  }
  return text;
}
