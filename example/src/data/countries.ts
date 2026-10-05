export interface Country {
  code: string;
  flag: string;
  en: string;
  tr: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', flag: '🇺🇸', en: 'United States', tr: 'ABD' },
  { code: 'GB', flag: '🇬🇧', en: 'United Kingdom', tr: 'Birleşik Krallık' },
  { code: 'DE', flag: '🇩🇪', en: 'Germany', tr: 'Almanya' },
  { code: 'FR', flag: '🇫🇷', en: 'France', tr: 'Fransa' },
  { code: 'JP', flag: '🇯🇵', en: 'Japan', tr: 'Japonya' },
  { code: 'BR', flag: '🇧🇷', en: 'Brazil', tr: 'Brezilya' },
  { code: 'IN', flag: '🇮🇳', en: 'India', tr: 'Hindistan' },
  { code: 'CA', flag: '🇨🇦', en: 'Canada', tr: 'Kanada' },
  { code: 'AU', flag: '🇦🇺', en: 'Australia', tr: 'Avustralya' },
  { code: 'TR', flag: '🇹🇷', en: 'Türkiye', tr: 'Türkiye' },
  { code: 'ES', flag: '🇪🇸', en: 'Spain', tr: 'İspanya' },
  { code: 'NL', flag: '🇳🇱', en: 'Netherlands', tr: 'Hollanda' },
  { code: 'KR', flag: '🇰🇷', en: 'South Korea', tr: 'Güney Kore' },
  { code: 'MX', flag: '🇲🇽', en: 'Mexico', tr: 'Meksika' },
  { code: 'SE', flag: '🇸🇪', en: 'Sweden', tr: 'İsveç' },
];

export const COUNTRY_BY_CODE = new Map(COUNTRIES.map(c => [c.code, c]));
