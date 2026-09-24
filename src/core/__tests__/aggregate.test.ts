import { aggregate } from '../aggregate';

const rows = [
  { id: 1, v: 10 },
  { id: 2, v: '5' },
  { id: 3, v: null },
  { id: 4, v: 'x' },
  { id: 5, v: 2.5 },
];
const col = { key: 'v' };

describe('aggregate', () => {
  it('sums, averages and finds extremes over numeric values', () => {
    expect(aggregate(rows, col, 'sum')).toBe(17.5);
    expect(aggregate(rows, col, 'avg')).toBeCloseTo(17.5 / 3);
    expect(aggregate(rows, col, 'min')).toBe(2.5);
    expect(aggregate(rows, col, 'max')).toBe(10);
  });

  it('counts non-blank values', () => {
    expect(aggregate(rows, col, 'count')).toBe(4);
  });

  it('returns undefined without numbers and uses getValue', () => {
    expect(aggregate([{ v: 'a' }], col, 'sum')).toBeUndefined();
    expect(
      aggregate([{ n: { x: 3 } }, { n: { x: 4 } }], { key: 'n', getValue: r => r.n.x }, 'sum')
    ).toBe(7);
  });
});
