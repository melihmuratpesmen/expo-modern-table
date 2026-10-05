/**
 * Locale-safe search helpers (Turkish-aware).
 *
 * - ı / i / I / İ all fold to `i`, so each matches the others
 * - Diacritics are stripped: ş→s, ğ→g, ü→u, ö→o, ç→c
 */

/** LATIN CAPITAL LETTER I WITH DOT ABOVE */
const TURKISH_CAPITAL_I_DOT = /\u0130/g;
/** LATIN SMALL LETTER DOTLESS I */
const TURKISH_DOTLESS_I = /\u0131/g;

export function normalizeSearchText(value: string | null | undefined): string {
  return (
    String(value ?? '')
      .trim()
      // Fold the i family without relying on the runtime locale (İ / I / ı / i → i)
      .replace(TURKISH_CAPITAL_I_DOT, 'i')
      .replace(/I/g, 'i')
      .replace(TURKISH_DOTLESS_I, 'i')
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Any dotless ı left over after NFD / locale lowering
      .replace(TURKISH_DOTLESS_I, 'i')
  );
}

/** Case- and diacritic-insensitive substring match. An empty needle matches everything. */
export function includesSearch(
  haystack: string | null | undefined,
  needle: string | null | undefined
): boolean {
  const normalizedNeedle = normalizeSearchText(needle);
  if (!normalizedNeedle) return true;
  return normalizeSearchText(haystack).includes(normalizedNeedle);
}

/** Matches when any field contains the query. An empty query matches everything. */
export function matchesSearchFields(
  fields: Array<string | number | null | undefined>,
  query: string | null | undefined
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  return fields.some(field => normalizeSearchText(String(field ?? '')).includes(normalizedQuery));
}
