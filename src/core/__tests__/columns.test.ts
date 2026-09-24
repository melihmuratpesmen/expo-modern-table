import { moveKey, reconcileOrder } from '../columns';

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
