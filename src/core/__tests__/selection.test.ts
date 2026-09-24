import { getSelectionState, toggleId, toggleIds } from '../selection';

describe('selection', () => {
  it('toggleId adds and removes without mutating', () => {
    const start = new Set([1]);
    const added = toggleId(start, 2);
    expect([...added]).toEqual([1, 2]);
    expect([...toggleId(added, 1)]).toEqual([2]);
    expect([...start]).toEqual([1]);
  });

  it('toggleIds selects the group and keeps other selections', () => {
    const selected = new Set(['other', 'a']);
    expect([...toggleIds(selected, ['a', 'b'])].sort()).toEqual(['a', 'b', 'other']);
  });

  it('toggleIds deselects only the group when it is fully selected', () => {
    const selected = new Set(['other', 'a', 'b']);
    expect([...toggleIds(selected, ['a', 'b'])]).toEqual(['other']);
  });

  it('getSelectionState reports all / some / none', () => {
    expect(getSelectionState(new Set([1, 2]), [1, 2])).toBe('all');
    expect(getSelectionState(new Set([1]), [1, 2])).toBe('some');
    expect(getSelectionState(new Set([3]), [1, 2])).toBe('none');
    expect(getSelectionState(new Set([1]), [])).toBe('none');
  });
});
