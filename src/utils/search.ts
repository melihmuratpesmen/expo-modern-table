/**
 * Türkçe arama yardımcıları.
 *
 * - ı / i / I / İ hepsi aynı harfe (`i`) katlanır — birbirini destekler
 * - Aksan sadeleştirme: ş→s, ğ→g, ü→u, ö→o, ç→c
 */

/** LATIN CAPITAL LETTER I WITH DOT ABOVE */
const TURKISH_CAPITAL_I_DOT = /\u0130/g;
/** LATIN SMALL LETTER DOTLESS I */
const TURKISH_DOTLESS_I = /\u0131/g;

export function normalizeSearchText(value: string | null | undefined): string {
  return (
    String(value ?? '')
      .trim()
      // i ailesi: locale'e güvenmeden eşitle (İ / I / ı / i → i)
      .replace(TURKISH_CAPITAL_I_DOT, 'i')
      .replace(/I/g, 'i')
      .replace(TURKISH_DOTLESS_I, 'i')
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // NFD / locale sonrası kalan noktasız ı
      .replace(TURKISH_DOTLESS_I, 'i')
  );
}

/** Türkçe büyük/küçük harf ve aksan duyarsız alt dizgi eşleşmesi. Boş needle → true. */
export function includesSearch(
  haystack: string | null | undefined,
  needle: string | null | undefined
): boolean {
  const normalizedNeedle = normalizeSearchText(needle);
  if (!normalizedNeedle) return true;
  return normalizeSearchText(haystack).includes(normalizedNeedle);
}

/** Birden fazla alanda arama. Boş query → true. */
export function matchesSearchFields(
  fields: Array<string | number | null | undefined>,
  query: string | null | undefined
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  return fields.some(field =>
    normalizeSearchText(String(field ?? '')).includes(normalizedQuery)
  );
}
