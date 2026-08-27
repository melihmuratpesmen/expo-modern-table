import { describe, expect, it } from 'vitest';
import { includesSearch, matchesSearchFields, normalizeSearchText } from '../src/utils/search';

describe('normalizeSearchText', () => {
  it('folds Turkish i variants onto i', () => {
    expect(normalizeSearchText('İstanbul')).toBe(normalizeSearchText('istanbul'));
    expect(normalizeSearchText('IĞDIR')).toBe(normalizeSearchText('igdir'));
    expect(normalizeSearchText('ışık')).toBe(normalizeSearchText('isik'));
  });

  it('strips accents', () => {
    expect(normalizeSearchText('Şehir')).toBe(normalizeSearchText('sehir'));
    expect(normalizeSearchText('Çağ')).toBe(normalizeSearchText('cag'));
  });

  it('trims whitespace', () => {
    expect(normalizeSearchText('  Ada  ')).toBe('ada');
  });
});

describe('includesSearch', () => {
  it('returns true for empty needle', () => {
    expect(includesSearch('anything', '')).toBe(true);
    expect(includesSearch('anything', null)).toBe(true);
  });

  it('matches substrings case-insensitively', () => {
    expect(includesSearch('Türkçe', 'turk')).toBe(true);
    expect(includesSearch('Matematik', 'MAT')).toBe(true);
    expect(includesSearch('Fizik', 'xyz')).toBe(false);
  });
});

describe('matchesSearchFields', () => {
  it('matches any field', () => {
    expect(matchesSearchFields(['Ada', 12], 'ada')).toBe(true);
    expect(matchesSearchFields(['Ada', 12], '12')).toBe(true);
    expect(matchesSearchFields(['Ada', 12], 'zzz')).toBe(false);
  });
});
