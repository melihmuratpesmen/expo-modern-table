import { compareValues, nextSortDirection, sortRows } from '../sort';

describe('nextSortDirection', () => {
  it('cycles none → asc → desc → none on the same column', () => {
    expect(nextSortDirection(undefined, null, 'a')).toBe('asc');
    expect(nextSortDirection('a', 'asc', 'a')).toBe('desc');
    expect(nextSortDirection('a', 'desc', 'a')).toBeNull();
  });

  it('starts at asc when another column is pressed', () => {
    expect(nextSortDirection('a', 'desc', 'b')).toBe('asc');
  });
});

describe('compareValues', () => {
  it('compares numbers and numeric strings numerically', () => {
    expect(compareValues(2, 10)).toBeLessThan(0);
    expect(compareValues('2', '10')).toBeLessThan(0);
    expect(compareValues('-5', '3')).toBeLessThan(0);
    expect(compareValues('7.15', 7.2)).toBeLessThan(0);
  });

  it('is case-insensitive and treats letters with diacritics next to their base letter', () => {
    expect(compareValues('ali', 'Ali')).toBe(0);
    expect(compareValues('Çorum', 'Zonguldak')).toBeLessThan(0);
    expect(compareValues('Şırnak', 'Tokat')).toBeLessThan(0);
  });

  it('uses natural order for mixed text and digits', () => {
    expect(compareValues('Sınıf 2', 'Sınıf 10')).toBeLessThan(0);
  });

  it('compares dates and booleans', () => {
    expect(compareValues(new Date(2020, 0, 1), new Date(2021, 0, 1))).toBeLessThan(0);
    expect(compareValues(false, true)).toBeLessThan(0);
  });

  it('respects a Turkish collator', () => {
    const tr = new Intl.Collator('tr', { sensitivity: 'base' });
    expect(compareValues('Çorum', 'Denizli', tr)).toBeLessThan(0);
    expect(compareValues('Cide', 'Çorum', tr)).toBeLessThan(0);
  });
});

describe('sortRows', () => {
  const rows = [
    { id: 1, v: 'b' },
    { id: 2, v: null },
    { id: 3, v: 'a' },
    { id: 4, v: '' },
    { id: 5, v: 'c' },
  ];

  it('returns a copy in the original order when unsorted', () => {
    const result = sortRows(rows, { key: '', direction: null });
    expect(result).toEqual(rows);
    expect(result).not.toBe(rows);
  });

  it('sorts ascending and descending with blanks last', () => {
    expect(sortRows(rows, { key: 'v', direction: 'asc' }).map(r => r.id)).toEqual([3, 1, 5, 2, 4]);
    expect(sortRows(rows, { key: 'v', direction: 'desc' }).map(r => r.id)).toEqual([5, 1, 3, 2, 4]);
  });

  it('is stable for equal values', () => {
    const equal = [
      { id: 1, v: 1 },
      { id: 2, v: 1 },
      { id: 3, v: 0 },
    ];
    expect(sortRows(equal, { key: 'v', direction: 'asc' }).map(r => r.id)).toEqual([3, 1, 2]);
  });

  it('does not mutate the input', () => {
    const copy = [...rows];
    sortRows(rows, { key: 'v', direction: 'asc' });
    expect(rows).toEqual(copy);
  });
});
