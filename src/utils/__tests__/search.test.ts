import { includesSearch, matchesSearchFields, normalizeSearchText } from '../search';

describe('normalizeSearchText', () => {
  it('folds the Turkish i family and strips diacritics', () => {
    expect(normalizeSearchText('İIıi')).toBe('iiii');
    expect(normalizeSearchText('ŞĞÜÖÇ şğüöç')).toBe('sguoc sguoc');
  });

  it('trims and handles nullish input', () => {
    expect(normalizeSearchText('  Ali ')).toBe('ali');
    expect(normalizeSearchText(null)).toBe('');
    expect(normalizeSearchText(undefined)).toBe('');
  });
});

describe('includesSearch', () => {
  it('matches regardless of case and diacritics', () => {
    expect(includesSearch('Işık Üniversitesi', 'isik uni')).toBe(true);
    expect(includesSearch('ISPARTA', 'ıspar')).toBe(true);
  });

  it('treats an empty needle as a match', () => {
    expect(includesSearch('anything', '')).toBe(true);
  });
});

describe('matchesSearchFields', () => {
  it('matches when any field contains the query', () => {
    expect(matchesSearchFields(['Ahmet', 42, null], '42')).toBe(true);
    expect(matchesSearchFields(['Ahmet', 42, null], 'mehmet')).toBe(false);
  });
});
