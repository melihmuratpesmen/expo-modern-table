import { clampPage, getTotalPages, paginateRows } from '../pagination';

describe('pagination', () => {
  it('getTotalPages is at least 1', () => {
    expect(getTotalPages(0, 10)).toBe(1);
    expect(getTotalPages(10, 10)).toBe(1);
    expect(getTotalPages(11, 10)).toBe(2);
    expect(getTotalPages(5, 0)).toBe(1);
  });

  it('clampPage keeps the page in range', () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(5, 3)).toBe(3);
    expect(clampPage(2, 3)).toBe(2);
    expect(clampPage(2, 0)).toBe(1);
  });

  it('paginateRows slices 1-based pages', () => {
    const rows = [1, 2, 3, 4, 5];
    expect(paginateRows(rows, 1, 2)).toEqual([1, 2]);
    expect(paginateRows(rows, 3, 2)).toEqual([5]);
    expect(paginateRows(rows, 4, 2)).toEqual([]);
  });
});
