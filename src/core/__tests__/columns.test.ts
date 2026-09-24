import { moveKey, reconcileOrder, resolveColumnWidths } from '../columns';

describe('reconcileOrder', () => {
  it('returns the same array when nothing changed', () => {
    const order = ['a', 'b', 'c'];
    expect(reconcileOrder(order, ['c', 'b', 'a'])).toBe(order);
  });

  it('drops removed keys and appends new ones, keeping relative order', () => {
    expect(reconcileOrder(['c', 'a', 'b'], ['a', 'b', 'd'])).toEqual(['a', 'b', 'd']);
    expect(reconcileOrder(['b', 'a'], ['a', 'b', 'c'])).toEqual(['b', 'a', 'c']);
  });
});

describe('moveKey', () => {
  it('moves right past a hidden column', () => {
    // visible: a, b, c — h is hidden
    expect(moveKey(['a', 'h', 'b', 'c'], 'a', 'c')).toEqual(['h', 'b', 'c', 'a']);
  });

  it('moves left', () => {
    expect(moveKey(['a', 'h', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'h', 'b']);
  });

  it('moves to an adjacent slot', () => {
    expect(moveKey(['a', 'b', 'c'], 'a', 'b')).toEqual(['b', 'a', 'c']);
    expect(moveKey(['a', 'b', 'c'], 'c', 'b')).toEqual(['a', 'c', 'b']);
  });

  it('ignores unknown keys and no-op moves', () => {
    expect(moveKey(['a', 'b'], 'x', 'a')).toEqual(['a', 'b']);
    expect(moveKey(['a', 'b'], 'a', 'a')).toEqual(['a', 'b']);
  });
});

describe('resolveColumnWidths', () => {
  const toObject = (m: Map<string, number>) => Object.fromEntries(m);

  it('uses width or the default for fixed columns', () => {
    expect(toObject(resolveColumnWidths([{ key: 'a', width: 80 }, { key: 'b' }], 500))).toEqual({
      a: 80,
      b: 100,
    });
  });

  it('shares leftover space by flex', () => {
    const widths = resolveColumnWidths(
      [
        { key: 'fixed', width: 100 },
        { key: 'one', flex: 1, width: 50 },
        { key: 'two', flex: 2, width: 50 },
      ],
      500
    );
    expect(toObject(widths)).toEqual({ fixed: 100, one: 150, two: 250 });
  });

  it('caps at maxWidth and gives the rest to other flex columns', () => {
    const widths = resolveColumnWidths(
      [
        { key: 'a', flex: 1, width: 0, maxWidth: 100 },
        { key: 'b', flex: 1, width: 0 },
      ],
      400
    );
    expect(toObject(widths)).toEqual({ a: 100, b: 300 });
  });

  it('does not shrink below the basis when there is no room', () => {
    const widths = resolveColumnWidths(
      [
        { key: 'a', flex: 1, width: 300 },
        { key: 'b', width: 300 },
      ],
      400
    );
    expect(toObject(widths)).toEqual({ a: 300, b: 300 });
  });

  it('treats overrides as fixed and clamps them', () => {
    const widths = resolveColumnWidths(
      [
        { key: 'a', flex: 1, minWidth: 60 },
        { key: 'b', flex: 1 },
      ],
      500,
      { a: 20 }
    );
    expect(widths.get('a')).toBe(60);
    expect(widths.get('b')).toBe(440);
  });
});
