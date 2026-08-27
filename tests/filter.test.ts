import { describe, expect, it } from 'vitest';
import type { Column } from '../src/types';
import { applyFilters } from '../src/utils/filter';

type Row = { id: string; name: string; group: string; active: boolean; score: number };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name', filterConfig: { type: 'text' } },
  { key: 'group', title: 'Group', filterConfig: { type: 'select', options: ['a', 'b'] } },
  { key: 'active', title: 'Active', filterConfig: { type: 'boolean' } },
  { key: 'score', title: 'Score', filterConfig: { type: 'number-range' } },
];

const data: Row[] = [
  { id: '1', name: 'Ada', group: 'a', active: true, score: 8 },
  { id: '2', name: 'Bora', group: 'b', active: false, score: 3 },
  { id: '3', name: 'Cem', group: 'a', active: true, score: 12 },
];

describe('applyFilters', () => {
  it('returns data when filters are empty', () => {
    expect(applyFilters(data, {}, columns)).toEqual(data);
    expect(applyFilters(data, undefined, columns)).toEqual(data);
  });

  it('filters text with accent-insensitive search', () => {
    expect(applyFilters(data, { name: 'ada' }, columns).map(r => r.id)).toEqual(['1']);
  });

  it('filters select by exact value', () => {
    expect(applyFilters(data, { group: 'a' }, columns).map(r => r.id)).toEqual(['1', '3']);
  });

  it('filters boolean including stringly "true"', () => {
    expect(applyFilters(data, { active: true }, columns)).toHaveLength(2);
    expect(applyFilters(data, { active: 'true' }, columns)).toHaveLength(2);
    expect(applyFilters(data, { active: false }, columns).map(r => r.id)).toEqual(['2']);
  });

  it('filters number ranges', () => {
    expect(applyFilters(data, { score: { min: 8 } }, columns).map(r => r.id)).toEqual(['1', '3']);
    expect(applyFilters(data, { score: { max: 8 } }, columns).map(r => r.id)).toEqual(['1', '2']);
    expect(applyFilters(data, { score: { min: 4, max: 10 } }, columns).map(r => r.id)).toEqual(['1']);
  });

  it('ANDs multiple filters', () => {
    expect(applyFilters(data, { group: 'a', score: { min: 10 } }, columns).map(r => r.id)).toEqual([
      '3',
    ]);
  });
});
