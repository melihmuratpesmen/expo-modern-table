import { describe, expect, it } from 'vitest';
import { compareTableValues, isNumericValue, nextSortDirection, sortRows } from '../src/utils/sort';

describe('nextSortDirection', () => {
  it('starts at asc when switching column or unsorted', () => {
    expect(nextSortDirection(undefined, null, 'name')).toBe('asc');
    expect(nextSortDirection('score', 'desc', 'name')).toBe('asc');
  });

  it('cycles asc → desc → null', () => {
    expect(nextSortDirection('name', 'asc', 'name')).toBe('desc');
    expect(nextSortDirection('name', 'desc', 'name')).toBe(null);
  });

  it('skips clear when enableSortClear is false', () => {
    expect(nextSortDirection('name', 'desc', 'name', false)).toBe('asc');
  });
});

describe('compareTableValues', () => {
  it('sorts numbers numerically, not lexicographically', () => {
    expect(compareTableValues(9, 10, 'asc')).toBeLessThan(0);
    expect(compareTableValues('9', '10', 'asc')).toBeLessThan(0);
    expect(compareTableValues(10, 9, 'desc')).toBeLessThan(0);
  });

  it('sorts strings lexicographically', () => {
    expect(compareTableValues('Ada', 'Zed', 'asc')).toBeLessThan(0);
    expect(compareTableValues('Ada', 'Zed', 'desc')).toBeGreaterThan(0);
  });

  it('pushes nullish values to the start in asc', () => {
    expect(compareTableValues(null, 'a', 'asc')).toBeLessThan(0);
    expect(isNumericValue('')).toBe(false);
    expect(isNumericValue('12')).toBe(true);
  });
});

describe('sortRows', () => {
  const rows = [
    { id: '1', name: 'C', score: 3 },
    { id: '2', name: 'A', score: 10 },
    { id: '3', name: 'B', score: 1 },
  ];

  it('returns data unchanged when direction is null', () => {
    expect(sortRows(rows, 'name', null)).toEqual(rows);
  });

  it('sorts by key', () => {
    expect(sortRows(rows, 'name', 'asc').map(r => r.name)).toEqual(['A', 'B', 'C']);
    expect(sortRows(rows, 'score', 'desc').map(r => r.score)).toEqual([10, 3, 1]);
  });
});
