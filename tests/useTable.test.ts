// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTable } from '../src/hooks/useTable';
import type { Column } from '../src/types';

type Row = { id: string; name: string; group: string; score: number };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name', isSticky: true },
  {
    key: 'group',
    title: 'Group',
    hidden: true,
    filterConfig: { type: 'select', options: ['a', 'b'] },
  },
  { key: 'score', title: 'Score' },
];

const data: Row[] = [
  { id: '1', name: 'Ada', group: 'a', score: 8 },
  { id: '2', name: 'Bora', group: 'b', score: 3 },
  { id: '3', name: 'Cem', group: 'a', score: 12 },
  { id: '4', name: 'Deniz', group: 'b', score: 5 },
];

describe('useTable', () => {
  it('accepts a number as initialItemsPerPage', () => {
    const { result } = renderHook(() => useTable(data, columns, 2));
    expect(result.current.paginatedData).toHaveLength(2);
    expect(result.current.totalPages).toBe(2);
  });

  it('hides columns marked hidden and pins sticky keys', () => {
    const { result } = renderHook(() => useTable(data, columns));
    expect(result.current.visibleColumns).toEqual(['name', 'score']);
    expect(result.current.stickyColumns).toEqual(['name']);
  });

  it('cycles sort through getTableProps().onSort', () => {
    const { result } = renderHook(() => useTable(data, columns));
    act(() => {
      result.current.getTableProps().onSort?.('score', 'asc');
    });
    expect(result.current.paginatedData.map(r => r.id)).toEqual(['2', '4', '1', '3']);
    act(() => {
      result.current.handleSort('score');
    });
    expect(result.current.sortConfig.direction).toBe('desc');
    act(() => {
      result.current.handleSort('score');
    });
    expect(result.current.sortConfig.direction).toBe(null);
  });

  it('filters and resets to page 1', () => {
    const { result } = renderHook(() => useTable(data, columns, { initialItemsPerPage: 2 }));
    act(() => {
      result.current.setCurrentPage(2);
    });
    act(() => {
      result.current.setSearchQuery('cem');
    });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.paginatedData.map(r => r.id)).toEqual(['3']);
  });

  it('selects only the current page by default, and filtered rows when scoped', () => {
    const { result } = renderHook(() => useTable(data, columns, { initialItemsPerPage: 2 }));
    act(() => {
      result.current.toggleAllSelection();
    });
    expect([...result.current.selectedIds]).toEqual(['1', '2']);

    const filtered = renderHook(() =>
      useTable(data, columns, { initialItemsPerPage: 2, selectAllScope: 'filtered' })
    );
    act(() => {
      filtered.result.current.setColumnFilter('group', 'a');
    });
    act(() => {
      filtered.result.current.toggleAllSelection();
    });
    expect([...filtered.result.current.selectedIds].sort()).toEqual(['1', '3']);
  });

  it('uses getRowId for selection', () => {
    const { result } = renderHook(() =>
      useTable(data, columns, { getRowId: row => `row-${row.id}` })
    );
    act(() => {
      result.current.toggleSelection('row-1');
    });
    expect(result.current.selectedIds.has('row-1')).toBe(true);
    expect(result.current.getTableProps().getRowId?.(data[0])).toBe('row-1');
  });

  it('fires onSelectionChange from the hook', () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() => useTable(data, columns, { onSelectionChange }));
    act(() => {
      result.current.toggleSelection('2');
    });
    expect(onSelectionChange).toHaveBeenCalledWith(['2']);
  });

  it('syncs columnOrder when keys change without a length change', () => {
    const nextCols: Column<Row>[] = [
      { key: 'name', title: 'Name' },
      { key: 'score', title: 'Score' },
      { key: 'average' as keyof Row & string, title: 'Avg' },
    ];
    const { result, rerender } = renderHook(
      ({ cols }) => useTable(data, cols),
      { initialProps: { cols: columns } }
    );
    expect(result.current.columnOrder).toEqual(['name', 'group', 'score']);
    rerender({ cols: nextCols });
    expect(result.current.columnOrder).toEqual(['name', 'score', 'average']);
  });

  it('spreads toolbar + pagination handlers from getTableProps', () => {
    const { result } = renderHook(() => useTable(data, columns, 10));
    const props = result.current.getTableProps();
    expect(props.onSearchChange).toBeTypeOf('function');
    expect(props.onDensityChange).toBeTypeOf('function');
    expect(props.onToggleColumn).toBeTypeOf('function');
    expect(props.pagination?.itemsPerPageOptions).toEqual([10, 20, 50]);
  });
});
