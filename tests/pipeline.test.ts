import { describe, expect, it } from 'vitest';
import type { Column } from '../src/types';
import { processTableData } from '../src/utils/pipeline';

type Row = { id: string; name: string; group: string; score: number };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name' },
  { key: 'group', title: 'Group', filterConfig: { type: 'select', options: ['a', 'b'] } },
  { key: 'score', title: 'Score' },
];

const data: Row[] = [
  { id: '1', name: 'Ada', group: 'a', score: 8 },
  { id: '2', name: 'Bora', group: 'b', score: 3 },
  { id: '3', name: 'Cem', group: 'a', score: 12 },
  { id: '4', name: 'Deniz', group: 'b', score: 5 },
];

describe('processTableData', () => {
  it('searches, then filters, then sorts, then paginates', () => {
    const result = processTableData({
      data,
      columns,
      searchQuery: 'a',
      searchKeys: ['group'],
      sortKey: 'score',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
    });
    expect(result.filteredData.map(r => r.id)).toEqual(['1', '3']);
    expect(result.sortedData.map(r => r.id)).toEqual(['3', '1']);
    expect(result.paginatedData.map(r => r.id)).toEqual(['3', '1']);
  });

  it('limits search to searchKeys', () => {
    const result = processTableData({
      data,
      columns,
      searchQuery: 'a',
      searchKeys: ['group'],
    });
    expect(result.filteredData.map(r => r.id)).toEqual(['1', '3']);
  });

  it('clamps page into range and computes totalPages', () => {
    const result = processTableData({
      data,
      columns,
      currentPage: 9,
      itemsPerPage: 2,
    });
    expect(result.totalPages).toBe(2);
    expect(result.currentPage).toBe(2);
    expect(result.paginatedData).toHaveLength(2);
  });

  it('returns an empty page when there are no rows', () => {
    const result = processTableData({
      data: [],
      columns,
      currentPage: 1,
      itemsPerPage: 10,
    });
    expect(result.paginatedData).toEqual([]);
    expect(result.totalPages).toBe(1);
  });
});
