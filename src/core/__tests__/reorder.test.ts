import { getDropIndex, moveItem } from '../reorder';

describe('getDropIndex', () => {
  const widths = [140, 110, 70, 70];

  it('stays put for small drags', () => {
    expect(getDropIndex(widths, 1, 20)).toBe(1);
    expect(getDropIndex(widths, 1, -40)).toBe(1);
  });

  it('uses real sizes instead of the dragged item size', () => {
    // Column 2 (70 wide, center at 285) dragged 130px left → center 155 → column 1.
    expect(getDropIndex(widths, 2, -130)).toBe(1);
    // Dragged 150px left → center 135 → column 0.
    expect(getDropIndex(widths, 2, -150)).toBe(0);
    // Column 0 (center 70) dragged 200px right → center 270 → column 2.
    expect(getDropIndex(widths, 0, 200)).toBe(2);
  });

  it('clamps to the ends', () => {
    expect(getDropIndex(widths, 1, -1000)).toBe(0);
    expect(getDropIndex(widths, 1, 1000)).toBe(3);
  });

  it('works for uniform rows', () => {
    expect(getDropIndex([48, 48, 48, 48], 0, 96)).toBe(2);
    expect(getDropIndex([48, 48, 48, 48], 3, -60)).toBe(2);
  });

  it('returns fromIndex for invalid input', () => {
    expect(getDropIndex([], 0, 10)).toBe(0);
    expect(getDropIndex([10], 5, 10)).toBe(5);
  });
});

describe('moveItem', () => {
  it('moves an element without mutating', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(items, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });
});
