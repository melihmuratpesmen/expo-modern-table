import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import { State } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import { ModernTable } from '../ModernTable';
import { Column, TR_TRANSLATIONS } from '../types';

// FlashList schedules layout updates on timers; keep them from firing outside act().
jest.useFakeTimers();

type Row = { id: number; name: string; score: number; note: string };

const rows: Row[] = [
  { id: 1, name: 'Ali', score: 7.15, note: 'x' },
  { id: 2, name: 'Ayşe', score: 8, note: 'y' },
  { id: 3, name: 'Can', score: 5, note: 'z' },
];

const drag = (testId: string, translation: { x?: number; y?: number }) => {
  const translationX = translation.x ?? 0;
  const translationY = translation.y ?? 0;
  act(() => {
    fireGestureHandler(getByGestureTestId(testId), [
      { state: State.BEGAN, translationX: 0, translationY: 0 },
      { state: State.ACTIVE, translationX: 0, translationY: 0 },
      { state: State.ACTIVE, translationX, translationY },
      { state: State.END, translationX, translationY },
    ]);
  });
};

describe('ModernTable', () => {
  it('renders rows and headers', () => {
    render(<ModernTable data={rows} columns={[{ key: 'name', title: 'Name' }]} />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Ayşe')).toBeTruthy();
  });

  it('reorders the right column when another column is hidden', () => {
    const onColumnReorder = jest.fn();
    const columns: Column<Row>[] = [
      { key: 'name', title: 'Name', width: 100 },
      { key: 'note', title: 'Note', width: 100 },
      { key: 'score', title: 'Score', width: 100 },
    ];
    render(
      <ModernTable
        data={rows}
        columns={columns}
        visibleColumns={['name', 'score']}
        enableColumnReorder
        onColumnReorder={onColumnReorder}
      />
    );

    // Drag "Name" one slot right, over "Score". Hidden "note" must not shift the target.
    drag('header-drag-name', { x: 100 });
    expect(onColumnReorder).toHaveBeenCalledWith(['note', 'score', 'name']);
  });

  it('uses real column widths to find the drop slot', () => {
    const onColumnReorder = jest.fn();
    const columns: Column<Row>[] = [
      { key: 'name', title: 'Name', width: 200 },
      { key: 'note', title: 'Note', width: 50 },
      { key: 'score', title: 'Score', width: 50 },
    ];
    render(
      <ModernTable
        data={rows}
        columns={columns}
        enableColumnReorder
        onColumnReorder={onColumnReorder}
      />
    );

    // "Score" center is at 275; 60px left lands at 215 → over "Note" (200–250), not "Name".
    drag('header-drag-score', { x: -60 });
    expect(onColumnReorder).toHaveBeenLastCalledWith(['name', 'score', 'note']);
  });

  it('supports row reorder without selection enabled', () => {
    const onRowReorder = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={[{ key: 'name', title: 'Name' }]}
        selectionMode="reorder"
        enableRowReorder
        onRowReorder={onRowReorder}
      />
    );

    drag('row-drag-1', { y: 48 * 2 });
    expect(onRowReorder).toHaveBeenCalledWith(0, 2);
  });

  it('does not reorder rows while sorted', () => {
    const onRowReorder = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={[{ key: 'name', title: 'Name' }]}
        selectionMode="reorder"
        onRowReorder={onRowReorder}
        sortColumn="name"
        sortDirection="asc"
      />
    );

    drag('row-drag-1', { y: 96 });
    expect(onRowReorder).not.toHaveBeenCalled();
  });

  it('writes edited numbers back as numbers, once', () => {
    const onRowChange = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={[{ key: 'score', title: 'Score', editable: true }]}
        onRowChange={onRowChange}
      />
    );

    fireEvent.press(screen.getByText('7.15'));
    const input = screen.getByDisplayValue('7.15');
    fireEvent.changeText(input, '9,5');
    fireEvent(input, 'submitEditing');
    fireEvent(input, 'blur');
    fireEvent(input, 'blur');

    expect(onRowChange).toHaveBeenCalledTimes(1);
    expect(onRowChange).toHaveBeenCalledWith({ ...rows[0], score: 9.5 });
  });

  it('drops invalid and unchanged edits', () => {
    const onRowChange = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={[{ key: 'score', title: 'Score', editable: true }]}
        onRowChange={onRowChange}
      />
    );

    fireEvent.press(screen.getByText('8'));
    const input = screen.getByDisplayValue('8');
    fireEvent.changeText(input, 'abc');
    fireEvent(input, 'blur');

    fireEvent.press(screen.getByText('5'));
    fireEvent(screen.getByDisplayValue('5'), 'blur');

    expect(onRowChange).not.toHaveBeenCalled();
  });

  it('does not enter edit mode without onRowChange', () => {
    render(<ModernTable data={rows} columns={[{ key: 'name', title: 'Name', editable: true }]} />);
    fireEvent.press(screen.getByText('Ali'));
    expect(screen.queryByDisplayValue('Ali')).toBeNull();
  });

  it('applies a decimal number-range filter typed with a comma', () => {
    const onFilterChange = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={[{ key: 'score', title: 'Score', filterConfig: { type: 'number-range' } }]}
        filters={{}}
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.press(screen.getByLabelText('Filter Score'));
    fireEvent.changeText(screen.getByPlaceholderText('0'), '1,5');
    expect(screen.getByDisplayValue('1,5')).toBeTruthy();
    fireEvent.press(screen.getByText('Apply'));

    expect(onFilterChange).toHaveBeenCalledWith('score', { min: 1.5, max: undefined });
    expect(screen.queryByText('Apply')).toBeNull();
  });

  it('opens the filter modal with the current value', () => {
    render(
      <ModernTable
        data={rows}
        columns={[{ key: 'score', title: 'Score', filterConfig: { type: 'number-range' } }]}
        filters={{ score: { min: 2, max: 9 } }}
        onFilterChange={jest.fn()}
      />
    );

    fireEvent.press(screen.getByLabelText('Filter Score'));
    expect(screen.getByDisplayValue('2')).toBeTruthy();
    expect(screen.getByDisplayValue('9')).toBeTruthy();
  });
});

describe('ModernTable toolbar', () => {
  const toolbarProps = {
    onSearchChange: jest.fn(),
    onDensityChange: jest.fn(),
    onToggleColumn: jest.fn(),
  };

  it('hides the fullscreen button unless screenOrientation is passed', () => {
    const { rerender } = render(
      <ModernTable data={rows} columns={[{ key: 'name', title: 'Name' }]} {...toolbarProps} />
    );
    expect(screen.queryByLabelText('Fullscreen')).toBeNull();

    rerender(
      <ModernTable
        data={rows}
        columns={[{ key: 'name', title: 'Name' }]}
        {...toolbarProps}
        screenOrientation={{
          lockAsync: jest.fn(async () => {}),
          OrientationLock: { LANDSCAPE: 5, PORTRAIT_UP: 1 },
        }}
      />
    );
    expect(screen.getByLabelText('Fullscreen')).toBeTruthy();
  });
});

describe('ModernTable row rendering', () => {
  const setup = () => {
    const renderName = jest.fn((item: Row) => <Text>{item.name}</Text>);
    const columns: Column<Row>[] = [{ key: 'name', title: 'Name', renderCell: renderName }];
    const base = { data: rows, columns, enableSelection: true, onToggleRow: jest.fn() };
    const view = render(<ModernTable {...base} selectedIds={new Set()} />);
    renderName.mockClear();
    return { renderName, base, view };
  };

  it('re-renders only the row whose selection changed', () => {
    const { renderName, base, view } = setup();
    view.rerender(<ModernTable {...base} selectedIds={new Set([2])} />);
    expect(renderName.mock.calls.map(([item]) => item.id)).toEqual([2]);
  });

  it('does not re-render rows for new inline event handlers', () => {
    const { renderName, base, view } = setup();
    const selectedIds = new Set<number>();
    view.rerender(<ModernTable {...base} selectedIds={selectedIds} onRowPress={() => {}} />);
    renderName.mockClear();
    view.rerender(<ModernTable {...base} selectedIds={selectedIds} onRowPress={() => {}} />);
    expect(renderName).not.toHaveBeenCalled();
  });

  it('re-renders rows when a render-affecting prop changes', () => {
    const { renderName, base, view } = setup();
    view.rerender(
      <ModernTable {...base} selectedIds={new Set()} getRowStyle={() => ({ opacity: 0.5 })} />
    );
    expect(renderName).toHaveBeenCalledTimes(rows.length);
  });

  it('calls the latest onRowPress', () => {
    const first = jest.fn();
    const second = jest.fn();
    const columns: Column<Row>[] = [{ key: 'name', title: 'Name' }];
    const view = render(<ModernTable data={rows} columns={columns} onRowPress={first} />);
    view.rerender(<ModernTable data={rows} columns={columns} onRowPress={second} />);
    fireEvent.press(screen.getByText('Ali'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(rows[0]);
  });
});

describe('ModernTable states', () => {
  const columns: Column<Row>[] = [{ key: 'name', title: 'Name' }];

  it('shows a loading view instead of the empty state', () => {
    render(<ModernTable data={[]} columns={columns} isLoading />);
    expect(screen.getByText('Loading…')).toBeTruthy();
    expect(screen.queryByText('No data found.')).toBeNull();
  });

  it('dims existing rows while refetching', () => {
    render(<ModernTable data={rows} columns={columns} isLoading />);
    expect(screen.getByText('Ali')).toBeTruthy();
    expect(screen.getByLabelText('Loading…')).toBeTruthy();
  });

  it('renders the built-in error view with retry', () => {
    const onRetry = jest.fn();
    render(<ModernTable data={rows} columns={columns} error="Network down" onRetry={onRetry} />);
    expect(screen.getByText('Network down')).toBeTruthy();
    expect(screen.queryByText('Ali')).toBeNull();
    fireEvent.press(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('uses the default error message for `error={true}` and custom nodes as-is', () => {
    const { rerender } = render(<ModernTable data={rows} columns={columns} error />);
    expect(screen.getByText('Something went wrong.')).toBeTruthy();
    rerender(<ModernTable data={rows} columns={columns} error={<Text>Custom</Text>} />);
    expect(screen.getByText('Custom')).toBeTruthy();
  });

  it('shows a footer spinner while loading more', () => {
    const { rerender } = render(<ModernTable data={rows} columns={columns} />);
    expect(screen.queryByLabelText('Loading…')).toBeNull();
    rerender(<ModernTable data={rows} columns={columns} isLoadingMore />);
    expect(screen.getByLabelText('Loading…')).toBeTruthy();
    expect(screen.getByText('Ali')).toBeTruthy();
  });

  it('renders a custom empty component', () => {
    render(<ModernTable data={[]} columns={columns} emptyComponent={<Text>Nothing here</Text>} />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('works with getRowId for rows without an id', () => {
    type Student = { no: string; name: string };
    const onToggleRow = jest.fn();
    const students: Student[] = [{ no: 's1', name: 'Zeynep' }];
    render(
      <ModernTable
        data={students}
        columns={[{ key: 'name', title: 'Name' }]}
        getRowId={s => s.no}
        enableSelection
        selectedIds={new Set(['s1'])}
        onToggleRow={onToggleRow}
      />
    );
    expect(screen.getByText('Zeynep')).toBeTruthy();
  });
});

// Type-level check (run by `tsc`).
export function modernTableTypeChecks() {
  type NoId = { code: string };
  // @ts-expect-error — rows without `id` need getRowId
  const missing = <ModernTable data={[] as NoId[]} columns={[]} />;
  const ok = <ModernTable data={[] as NoId[]} columns={[]} getRowId={r => r.code} />;
  return [missing, ok];
}

describe('ModernTable column options', () => {
  it('renders getValue as cell text and a custom header', () => {
    render(
      <ModernTable
        data={rows}
        columns={[
          {
            key: 'label',
            title: 'Label',
            getValue: r => `${r.name}!`,
            renderHeader: () => <Text>Custom header</Text>,
          },
        ]}
      />
    );
    expect(screen.getByText('Ali!')).toBeTruthy();
    expect(screen.getByText('Custom header')).toBeTruthy();
    expect(screen.queryByText('Label')).toBeNull();
  });

  it('does not sort columns with sortable: false', () => {
    const onSort = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={[
          { key: 'name', title: 'Name', sortable: false },
          { key: 'score', title: 'Score' },
        ]}
        onSort={onSort}
      />
    );
    fireEvent.press(screen.getByText('Name'));
    expect(onSort).not.toHaveBeenCalled();
    fireEvent.press(screen.getByText('Score'));
    expect(onSort).toHaveBeenCalledWith('score', 'asc');
  });
});

describe('ModernTable column resize', () => {
  const columns: Column<Row>[] = [
    { key: 'name', title: 'Name', width: 100, minWidth: 60, maxWidth: 180 },
    { key: 'score', title: 'Score', width: 80, resizable: false },
  ];

  it('commits the dragged width, clamped to min / max', () => {
    const onColumnResize = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={columns}
        enableColumnResize
        onColumnResize={onColumnResize}
      />
    );

    drag('resize-name', { x: 50 });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 150);

    // Uncontrolled: the new width is kept, so +200 from 150 clamps at maxWidth.
    drag('resize-name', { x: 200 });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 180);

    drag('resize-name', { x: -500 });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 60);
  });

  it('has no handle for resizable: false or without enableColumnResize', () => {
    const { rerender } = render(<ModernTable data={rows} columns={columns} enableColumnResize />);
    expect(screen.getAllByRole('adjustable')).toHaveLength(1);
    rerender(<ModernTable data={rows} columns={columns} />);
    expect(screen.queryAllByRole('adjustable')).toHaveLength(0);
  });

  it('resizes with screen-reader increment / decrement', () => {
    const onColumnResize = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={columns}
        enableColumnResize
        onColumnResize={onColumnResize}
      />
    );
    const handle = screen.getByRole('adjustable');
    fireEvent(handle, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 110);
  });

  it('uses controlled columnWidths', () => {
    const onColumnResize = jest.fn();
    render(
      <ModernTable
        data={rows}
        columns={columns}
        enableColumnResize
        columnWidths={{ name: 120 }}
        onColumnResize={onColumnResize}
      />
    );
    drag('resize-name', { x: 10 });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 130);
    // Still controlled at 120, so the next drag starts from 120 again.
    drag('resize-name', { x: 10 });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 130);
  });
});

describe('ModernTable toolbar slots', () => {
  const columns: Column<Row>[] = [{ key: 'name', title: 'Name' }];

  it('shows only the controls whose handlers are passed', () => {
    render(<ModernTable data={rows} columns={columns} onSearchChange={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('hides the toolbar with showToolbar={false}', () => {
    render(
      <ModernTable data={rows} columns={columns} onSearchChange={jest.fn()} showToolbar={false} />
    );
    expect(screen.queryByPlaceholderText('Search...')).toBeNull();
  });

  it('renders custom toolbar actions', () => {
    render(<ModernTable data={rows} columns={columns} toolbarActions={<Text>Export</Text>} />);
    expect(screen.getByText('Export')).toBeTruthy();
  });

  it('swaps search for bulk actions while rows are selected', () => {
    const renderBulkActions = (ids: Set<number | string>) => <Text>Delete {ids.size}</Text>;
    const { rerender } = render(
      <ModernTable
        data={rows}
        columns={columns}
        onSearchChange={jest.fn()}
        renderBulkActions={renderBulkActions}
        selectedIds={new Set()}
      />
    );
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    expect(screen.queryByText('Delete 2')).toBeNull();

    rerender(
      <ModernTable
        data={rows}
        columns={columns}
        onSearchChange={jest.fn()}
        renderBulkActions={renderBulkActions}
        selectedIds={new Set([1, 2])}
      />
    );
    expect(screen.getByText('Delete 2')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Search...')).toBeNull();
  });

  it('shows a mixed header checkbox for a partial selection', () => {
    render(
      <ModernTable
        data={rows}
        columns={columns}
        enableSelection
        selectedIds={new Set([1])}
        isSomeSelected
      />
    );
    const [header] = screen.getAllByRole('checkbox');
    expect(header.props.accessibilityState).toMatchObject({ checked: 'mixed' });
  });
});

describe('ModernTable icons', () => {
  it('renders overridden icons', () => {
    render(
      <ModernTable
        data={rows}
        columns={[{ key: 'score', title: 'Score', filterConfig: { type: 'number-range' } }]}
        icons={{ filter: () => <Text>FILTER-ICON</Text> }}
      />
    );
    expect(screen.getByText('FILTER-ICON')).toBeTruthy();
  });

  it('does not re-render rows for an equal inline icons object', () => {
    const FilterIcon = () => <Text>F</Text>;
    const renderName = jest.fn((item: Row) => <Text>{item.name}</Text>);
    const columns: Column<Row>[] = [{ key: 'name', title: 'Name', renderCell: renderName }];
    const view = render(
      <ModernTable data={rows} columns={columns} icons={{ filter: FilterIcon }} />
    );
    renderName.mockClear();
    view.rerender(<ModernTable data={rows} columns={columns} icons={{ filter: FilterIcon }} />);
    expect(renderName).not.toHaveBeenCalled();
  });
});

describe('ModernTable accessibility', () => {
  const columns: Column<Row>[] = [
    { key: 'name', title: 'Name' },
    { key: 'score', title: 'Score', sortable: false },
  ];

  it('labels sortable headers and reports the sort direction', () => {
    render(
      <ModernTable
        data={rows}
        columns={columns}
        onSort={jest.fn()}
        sortColumn="name"
        sortDirection="desc"
      />
    );
    const name = screen.getByRole('button', { name: 'Name' });
    expect(name.props.accessibilityValue).toEqual({ text: 'sorted descending' });
    expect(screen.getByRole('header', { name: 'Score' })).toBeTruthy();
  });

  it('labels checkboxes, toolbar buttons and pagination', () => {
    render(
      <ModernTable
        data={rows}
        columns={columns}
        enableSelection
        selectedIds={new Set()}
        onDensityChange={jest.fn()}
        onToggleColumn={jest.fn()}
        pagination={{ currentPage: 1, totalPages: 2, itemsPerPage: 10, onPageChange: jest.fn() }}
      />
    );
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBeTruthy();
    expect(screen.getAllByRole('checkbox', { name: 'Select row' })).toHaveLength(rows.length);
    expect(screen.getByRole('button', { name: 'Row density' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Columns' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('uses TR_TRANSLATIONS', () => {
    render(
      <ModernTable
        data={[]}
        columns={columns}
        onSearchChange={jest.fn()}
        translations={TR_TRANSLATIONS}
      />
    );
    expect(screen.getByPlaceholderText('Ara...')).toBeTruthy();
    expect(screen.getByText('Kayıt bulunamadı.')).toBeTruthy();
  });
});
