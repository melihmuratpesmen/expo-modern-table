import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import { State } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import { ModernTable } from '../ModernTable';
import { Column } from '../types';

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
