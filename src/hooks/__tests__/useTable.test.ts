import { act, renderHook } from '@testing-library/react-native';
import { Column } from '../../types';
import { useTable } from '../useTable';

type Row = { id: number; name: string; city: string; score: number; secret: string };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name', isSticky: true },
  { key: 'city', title: 'City', filterConfig: { type: 'select' } },
  { key: 'score', title: 'Score', filterConfig: { type: 'number-range' } },
  { key: 'secret', title: 'Secret', hidden: true },
];

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Name ${i + 1}`,
    city: i % 2 === 0 ? 'İzmir' : 'Çorum',
    score: i * 10,
    secret: `hidden-${i + 1}`,
  }));

describe('useTable', () => {
  it('paginates and clamps the page when data shrinks', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data: Row[] }) => useTable(data, columns, 10),
      {
        initialProps: { data: makeRows(25) },
      }
    );

    expect(result.current.totalPages).toBe(3);
    act(() => result.current.setCurrentPage(3));
    expect(result.current.paginatedData).toHaveLength(5);

    rerender({ data: makeRows(12) });
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedData.map(r => r.id)).toEqual([11, 12]);
  });

  it('resets to page 1 when search, filters or page size change', () => {
    const { result } = renderHook(() => useTable(makeRows(30), columns, 10));

    act(() => result.current.setCurrentPage(3));
    act(() => result.current.setSearchQuery('name'));
    expect(result.current.currentPage).toBe(1);

    act(() => result.current.setCurrentPage(2));
    act(() => result.current.setColumnFilter('city', 'İzmir'));
    expect(result.current.currentPage).toBe(1);

    act(() => result.current.setCurrentPage(2));
    act(() => result.current.setItemsPerPage(20));
    expect(result.current.currentPage).toBe(1);
  });

  it('searches visible columns only', () => {
    const { result } = renderHook(() => useTable(makeRows(5), columns, 10));

    act(() => result.current.setSearchQuery('hidden-3'));
    expect(result.current.filteredData).toHaveLength(0);

    act(() => result.current.toggleColumnVisibility('secret'));
    expect(result.current.filteredData.map(r => r.id)).toEqual([3]);
  });

  it('does not match the id field in global search', () => {
    const rows = [{ id: 99, name: 'Ali', city: 'x', score: 1, secret: '' }];
    const { result } = renderHook(() => useTable(rows, columns, 10));
    act(() => result.current.setSearchQuery('99'));
    expect(result.current.filteredData).toHaveLength(0);
  });

  it('sorts with the header cycle and locale-aware comparison', () => {
    const rows = [
      { id: 1, name: 'Zeynep', city: '', score: 2, secret: '' },
      { id: 2, name: 'çağla', city: '', score: 10, secret: '' },
      { id: 3, name: 'Ali', city: '', score: 1, secret: '' },
    ];
    const { result } = renderHook(() => useTable(rows, columns, 10));

    act(() => result.current.handleSort('name'));
    expect(result.current.sortedData.map(r => r.id)).toEqual([3, 2, 1]);

    act(() => result.current.handleSort('name'));
    expect(result.current.sortedData.map(r => r.id)).toEqual([1, 2, 3]);

    act(() => result.current.handleSort('name'));
    expect(result.current.sortConfig).toEqual({ key: '', direction: null });

    act(() => result.current.handleSort('score', 'asc'));
    expect(result.current.sortedData.map(r => r.score)).toEqual([1, 2, 10]);
  });

  it('keeps selections on other pages when toggling the current page', () => {
    const { result } = renderHook(() => useTable(makeRows(20), columns, 10));

    act(() => result.current.toggleSelection(15));
    act(() => result.current.toggleAllSelection());
    expect(result.current.selectedIds.size).toBe(11);
    expect(result.current.isAllSelected).toBe(true);

    act(() => result.current.toggleAllSelection());
    expect([...result.current.selectedIds]).toEqual([15]);
    expect(result.current.isAllSelected).toBe(false);
  });

  it('reports a partial page selection', () => {
    const { result } = renderHook(() => useTable(makeRows(5), columns, 10));
    act(() => result.current.toggleSelection(1));
    expect(result.current.isSomeSelected).toBe(true);
    act(() => result.current.clearSelection());
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('derives visible / sticky columns from column flags and user toggles', () => {
    const { result, rerender } = renderHook(
      ({ cols }: { cols: Column<Row>[] }) => useTable(makeRows(3), cols, 10),
      {
        initialProps: { cols: columns },
      }
    );

    expect(result.current.visibleColumns).toEqual(['name', 'city', 'score']);
    expect(result.current.stickyColumns).toEqual(['name']);

    act(() => result.current.toggleColumnVisibility('city'));
    act(() => result.current.toggleStickyColumn('name'));
    expect(result.current.visibleColumns).toEqual(['name', 'score']);
    expect(result.current.stickyColumns).toEqual([]);

    // A new column appears with its defaults; user toggles are kept.
    rerender({ cols: [...columns, { key: 'extra', title: 'Extra', isSticky: true }] });
    expect(result.current.visibleColumns).toEqual(['name', 'score', 'extra']);
    expect(result.current.stickyColumns).toEqual(['extra']);
  });

  it('getTableProps wires state into ModernTable props', () => {
    const { result } = renderHook(() => useTable(makeRows(3), columns, 10));
    const props = result.current.getTableProps();

    expect(props.data).toHaveLength(3);
    expect(props.pagination?.currentPage).toBe(1);
    expect(props.visibleColumns).toEqual(['name', 'city', 'score']);

    act(() => props.onFilterChange?.('score', { min: 10 }));
    expect(result.current.filteredData.map(r => r.id)).toEqual([2, 3]);

    act(() => result.current.getTableProps().onFilterChange?.('score', { min: undefined }));
    expect(result.current.filters).toEqual({});
  });
});
