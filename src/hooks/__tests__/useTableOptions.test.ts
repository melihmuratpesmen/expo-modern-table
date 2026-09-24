import { act, renderHook } from '@testing-library/react-native';
import { Column } from '../../types';
import { TableState, useTable } from '../useTable';

type Row = { id: number; name: string; score: number };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name' },
  { key: 'score', title: 'Score', filterConfig: { type: 'number-range' } },
];

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}`, score: i }));

describe('useTable options', () => {
  it('accepts the legacy page-size argument and an options object', () => {
    const legacy = renderHook(() => useTable(makeRows(30), columns, 20));
    const options = renderHook(() => useTable(makeRows(30), columns, { pageSize: 20 }));
    expect(legacy.result.current.itemsPerPage).toBe(20);
    expect(options.result.current.itemsPerPage).toBe(20);
  });

  it('applies initialState, pageSizeOptions, enableSelection and pagination', () => {
    const { result } = renderHook(() =>
      useTable(makeRows(30), columns, {
        pageSizeOptions: [5, 15],
        enableSelection: false,
        initialState: {
          page: 2,
          pageSize: 5,
          sort: { key: 'score', direction: 'desc' },
          filters: { score: { min: 10 } },
        },
      })
    );
    const props = result.current.getTableProps();
    expect(props.enableSelection).toBe(false);
    expect(props.pagination?.itemsPerPageOptions).toEqual([5, 15]);
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedData.map(r => r.score)).toEqual([24, 23, 22, 21, 20]);

    const noPagination = renderHook(() => useTable(makeRows(3), columns, { pagination: false }));
    expect(noPagination.result.current.getTableProps().pagination).toBeUndefined();
  });

  it('selects every filtered row with selectAllScope "filtered"', () => {
    const { result } = renderHook(() =>
      useTable(makeRows(30), columns, { pageSize: 10, selectAllScope: 'filtered' })
    );
    act(() => result.current.setColumnFilter('score', { min: 5 }));
    act(() => result.current.toggleAllSelection());
    expect(result.current.selectedIds.size).toBe(25);
    expect(result.current.isAllSelected).toBe(true);
  });

  it('sorts with the given locale', () => {
    const rows = [
      { id: 1, name: 'Çorum', score: 0 },
      { id: 2, name: 'Denizli', score: 0 },
      { id: 3, name: 'Cide', score: 0 },
    ];
    const { result } = renderHook(() => useTable(rows, columns, { locale: 'tr' }));
    act(() => result.current.handleSort('name', 'asc'));
    expect(result.current.sortedData.map(r => r.name)).toEqual(['Cide', 'Çorum', 'Denizli']);
  });

  it('uses getRowId for rows without an id field', () => {
    type Student = { studentNo: string; name: string };
    const students: Student[] = [
      { studentNo: 'a', name: 'Ali' },
      { studentNo: 'b', name: 'Ayşe' },
    ];
    const getRowId = (s: Student) => s.studentNo;
    const { result } = renderHook(() =>
      useTable(students, [{ key: 'name', title: 'Name' }], { getRowId })
    );
    act(() => result.current.toggleAllSelection());
    expect([...result.current.selectedIds]).toEqual(['a', 'b']);
    expect(result.current.getTableProps().getRowId).toBe(getRowId);
  });

  it('goes back to page 1 for a new query and stays there when the query is cleared', () => {
    const { result } = renderHook(() => useTable(makeRows(50), columns, 10));
    act(() => result.current.setCurrentPage(3));
    act(() => result.current.setSearchQuery('row'));
    expect(result.current.currentPage).toBe(1);
    act(() => result.current.setSearchQuery(''));
    expect(result.current.currentPage).toBe(1);
  });
});

describe('useTable manual mode', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const page = makeRows(10);

  it('passes data through untouched and exposes state', () => {
    const { result } = renderHook(() => useTable(page, columns, { manual: true, rowCount: 95 }));
    act(() => result.current.handleSort('score', 'desc'));
    act(() => result.current.setColumnFilter('score', { min: 5 }));

    expect(result.current.paginatedData).toBe(page);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.state).toEqual({
      searchQuery: '',
      sort: { key: 'score', direction: 'desc' },
      filters: { score: { min: 5 } },
      page: 1,
      pageSize: 10,
    });
  });

  it('debounces search into state and resets the page once', () => {
    const states: TableState[] = [];
    const { result } = renderHook(() =>
      useTable(page, columns, { manual: true, rowCount: 95, onStateChange: s => states.push(s) })
    );
    act(() => result.current.setCurrentPage(4));
    states.length = 0;

    act(() => result.current.setSearchQuery('a'));
    act(() => result.current.setSearchQuery('al'));
    act(() => result.current.setSearchQuery('ali'));
    expect(result.current.searchQuery).toBe('ali');
    expect(result.current.state.searchQuery).toBe('');
    expect(states).toEqual([]);

    act(() => jest.advanceTimersByTime(300));
    expect(result.current.state).toMatchObject({ searchQuery: 'ali', page: 1 });
    expect(states).toHaveLength(1);
  });

  it('allows "next" while pages are full when rowCount is unknown', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data: Row[] }) => useTable(data, columns, { manual: true }),
      { initialProps: { data: page } }
    );
    expect(result.current.totalPages).toBe(2);
    act(() => result.current.setCurrentPage(2));
    rerender({ data: makeRows(4) });
    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentPage).toBe(2);
  });

  it('calls onStateChange on mount', () => {
    const onStateChange = jest.fn();
    renderHook(() => useTable(page, columns, { manual: true, onStateChange }));
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange.mock.calls[0][0]).toMatchObject({ page: 1, pageSize: 10 });
  });
});

// Type-level checks (run by `tsc`, not Jest assertions).
export function useTypeChecks() {
  type NoId = { code: string };
  const rows: NoId[] = [];
  const cols: Column<NoId>[] = [];
  // @ts-expect-error — rows without `id` need getRowId
  useTable(rows, cols);
  useTable(rows, cols, { getRowId: r => r.code });
}

describe('useTable column options', () => {
  type Person = { id: number; first: string; last: string; note: string };
  const people: Person[] = [
    { id: 1, first: 'Ada', last: 'Yılmaz', note: 'secret' },
    { id: 2, first: 'Can', last: 'Demir', note: 'x' },
  ];
  const personColumns: Column<Person>[] = [
    { key: 'fullName', title: 'Name', getValue: p => `${p.first} ${p.last}` },
    { key: 'note', title: 'Note', searchable: false },
  ];

  it('searches getValue and skips searchable: false columns', () => {
    const { result } = renderHook(() => useTable(people, personColumns));
    act(() => result.current.setSearchQuery('ada yil'));
    expect(result.current.filteredData.map(p => p.id)).toEqual([1]);
    act(() => result.current.setSearchQuery('secret'));
    expect(result.current.filteredData).toEqual([]);
  });

  it('sorts a computed column', () => {
    const { result } = renderHook(() => useTable(people, personColumns));
    act(() => result.current.handleSort('fullName', 'desc'));
    expect(result.current.sortedData.map(p => p.id)).toEqual([2, 1]);
  });
});

describe('useTable preferences', () => {
  const prefColumns: Column<Row>[] = [
    { key: 'name', title: 'Name' },
    { key: 'score', title: 'Score', hidden: true },
  ];

  it('reports preferences and restores them', () => {
    const onPreferencesChange = jest.fn();
    const { result } = renderHook(() =>
      useTable(makeRows(3), prefColumns, { onPreferencesChange })
    );
    act(() => result.current.toggleColumnVisibility('score'));
    act(() => result.current.getTableProps().onColumnReorder?.(['score', 'name']));
    act(() => result.current.getTableProps().onColumnResize?.('name', 140));
    act(() => result.current.setDensity('compact'));

    const saved = onPreferencesChange.mock.calls.at(-1)![0];
    expect(saved).toEqual({
      columnVisibility: { score: true },
      columnPinning: {},
      columnOrder: ['score', 'name'],
      columnWidths: { name: 140 },
      density: 'compact',
      pageSize: 10,
    });

    const restored = renderHook(() =>
      useTable(makeRows(3), prefColumns, { initialPreferences: saved })
    );
    const props = restored.result.current.getTableProps();
    expect(props.visibleColumns).toEqual(['name', 'score']);
    expect(props.columnOrder).toEqual(['score', 'name']);
    expect(props.columnWidths).toEqual({ name: 140 });
    expect(props.density).toBe('compact');
  });

  it('gives columns added later their defaults', () => {
    const { result } = renderHook(() =>
      useTable(makeRows(3), [...prefColumns, { key: 'extra', title: 'Extra' }], {
        initialPreferences: { columnVisibility: { score: true }, columnOrder: ['score', 'name'] },
      })
    );
    expect(result.current.visibleColumns).toEqual(['name', 'score', 'extra']);
    expect(result.current.columnOrder).toEqual(['score', 'name', 'extra']);
  });

  it('applies preferences loaded later with setPreferences', () => {
    const { result } = renderHook(() => useTable(makeRows(30), prefColumns));
    act(() => result.current.setCurrentPage(2));
    act(() => result.current.setPreferences({ pageSize: 20, columnPinning: { name: true } }));
    expect(result.current.itemsPerPage).toBe(20);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.stickyColumns).toEqual(['name']);
  });
});

describe('useTable getCsv', () => {
  const csvColumns: Column<Row>[] = [
    { key: 'name', title: 'Name' },
    { key: 'score', title: 'Score', filterConfig: { type: 'number-range' } },
  ];

  it('exports visible columns in on-screen order, filtered and sorted', () => {
    const { result } = renderHook(() => useTable(makeRows(5), csvColumns, 2));
    act(() => result.current.setColumnOrder(['score', 'name']));
    act(() => result.current.setColumnFilter('score', { min: 2 }));
    act(() => result.current.handleSort('score', 'desc'));
    expect(result.current.getCsv({ lineEnding: '\n' })).toBe(
      'Score,Name\n4,Row 5\n3,Row 4\n2,Row 3'
    );
  });

  it('exports the page or the selection', () => {
    const { result } = renderHook(() => useTable(makeRows(5), csvColumns, 2));
    expect(result.current.getCsv({ rows: 'page', includeHeader: false, lineEnding: '|' })).toBe(
      'Row 1,0|Row 2,1'
    );
    act(() => result.current.toggleSelection(4));
    expect(result.current.getCsv({ rows: 'selected', includeHeader: false })).toBe('Row 4,3');
  });
});

describe('useTable footerData', () => {
  it('passes every filtered row, not only the page', () => {
    const { result } = renderHook(() => useTable(makeRows(25), columns, 10));
    act(() => result.current.setColumnFilter('score', { min: 5 }));
    const props = result.current.getTableProps();
    expect(props.data).toHaveLength(10);
    expect(props.footerData).toHaveLength(20);
  });
});
