import { Column } from '../../types';
import { filterRows, isEmptyFilterValue, matchesFilter, searchRows } from '../filter';

describe('isEmptyFilterValue', () => {
  it.each([undefined, null, '', {}, { min: undefined }, { min: NaN, max: NaN }])(
    '%p is empty',
    value => expect(isEmptyFilterValue(value as never)).toBe(true)
  );

  it.each([false, true, 'x', { min: 0 }, { max: 10 }])('%p is not empty', value =>
    expect(isEmptyFilterValue(value)).toBe(false)
  );
});

describe('matchesFilter', () => {
  it('text: case- and diacritic-insensitive', () => {
    expect(matchesFilter('İstanbul', 'ista', { type: 'text' })).toBe(true);
    expect(matchesFilter('Ankara', 'ista', { type: 'text' })).toBe(false);
    expect(matchesFilter(null, 'null', { type: 'text' })).toBe(false);
  });

  it('select: compares as strings so numeric cells match string options', () => {
    expect(matchesFilter(3, '3', { type: 'select' })).toBe(true);
    expect(matchesFilter('social', 'social', { type: 'select' })).toBe(true);
    expect(matchesFilter(undefined, 'undefined', { type: 'select' })).toBe(false);
  });

  it('boolean: false is an active filter', () => {
    expect(matchesFilter(false, false, { type: 'boolean' })).toBe(true);
    expect(matchesFilter(true, false, { type: 'boolean' })).toBe(false);
    expect(matchesFilter(1, true, { type: 'boolean' })).toBe(true);
  });

  it('number-range: inclusive bounds, non-numeric cells excluded', () => {
    const config = { type: 'number-range' as const };
    expect(matchesFilter(5, { min: 5, max: 10 }, config)).toBe(true);
    expect(matchesFilter(10.5, { min: 5, max: 10 }, config)).toBe(false);
    expect(matchesFilter('7', { min: 5 }, config)).toBe(true);
    expect(matchesFilter(null, { min: 0 }, config)).toBe(false);
    expect(matchesFilter('abc', { max: 10 }, config)).toBe(false);
  });

  it('number-range: NaN bounds are ignored', () => {
    expect(matchesFilter(3, { min: NaN, max: 5 }, { type: 'number-range' })).toBe(true);
  });

  it('passes everything without a config', () => {
    expect(matchesFilter('x', 'y', undefined)).toBe(true);
  });
});

type Row = { id: number; name: string; group: string; score: number; meta?: object };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name', filterConfig: { type: 'text' } },
  { key: 'group', title: 'Group', filterConfig: { type: 'select' } },
  { key: 'score', title: 'Score', filterConfig: { type: 'number-range' } },
];

const rows: Row[] = [
  { id: 1, name: 'Işıl', group: 'a', score: 40, meta: { note: 'secret' } },
  { id: 2, name: 'Ömer', group: 'b', score: 75 },
  { id: 3, name: 'Selin', group: 'a', score: 90 },
];

describe('filterRows', () => {
  it('combines filters with AND and ignores empty ones', () => {
    const result = filterRows(rows, { group: 'a', score: { min: 50 }, name: '' }, columns);
    expect(result.map(r => r.id)).toEqual([3]);
  });

  it('returns a copy when no filter is active', () => {
    const result = filterRows(rows, {}, columns);
    expect(result).toEqual(rows);
    expect(result).not.toBe(rows);
  });
});

describe('searchRows', () => {
  it('searches only the given keys', () => {
    expect(searchRows(rows, 'isil', ['name']).map(r => r.id)).toEqual([1]);
    // `id` is not a searchable key here
    expect(searchRows(rows, '2', ['name', 'group'])).toEqual([]);
  });

  it('skips object values', () => {
    expect(searchRows(rows, 'secret', ['name', 'meta'])).toEqual([]);
    expect(searchRows(rows, 'object', ['meta'])).toEqual([]);
  });

  it('matches numbers as text', () => {
    expect(searchRows(rows, '75', ['score']).map(r => r.id)).toEqual([2]);
  });

  it('returns everything for a blank query', () => {
    expect(searchRows(rows, '   ', ['name'])).toHaveLength(3);
  });
});
