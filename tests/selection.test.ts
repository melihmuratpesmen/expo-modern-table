import { describe, expect, it } from 'vitest';
import {
  isEveryIdSelected,
  isSomeIdSelected,
  toggleSelectedId,
  toggleSelectedIds,
} from '../src/utils/selection';
import { formatTranslation } from '../src/utils/i18n';

describe('selection helpers', () => {
  it('toggles a single id', () => {
    const once = toggleSelectedId(new Set(), '1');
    expect([...once]).toEqual(['1']);
    expect([...toggleSelectedId(once, '1')]).toEqual([]);
  });

  it('toggles a pool without clearing unrelated ids', () => {
    const selected = new Set(['keep', '1']);
    const selectedAll = toggleSelectedIds(selected, ['1', '2']);
    expect(selectedAll.has('keep')).toBe(true);
    expect(selectedAll.has('1')).toBe(true);
    expect(selectedAll.has('2')).toBe(true);

    const deselected = toggleSelectedIds(selectedAll, ['1', '2']);
    expect([...deselected]).toEqual(['keep']);
  });

  it('reports all / some selected', () => {
    const selected = new Set(['1', '2']);
    expect(isEveryIdSelected(selected, ['1', '2'])).toBe(true);
    expect(isEveryIdSelected(selected, ['1', '2', '3'])).toBe(false);
    expect(isSomeIdSelected(selected, ['2', '3'])).toBe(true);
    expect(isSomeIdSelected(selected, ['9'])).toBe(false);
  });
});

describe('formatTranslation', () => {
  it('replaces named tokens', () => {
    expect(formatTranslation('Sort {title}', { title: 'Net' })).toBe('Sort Net');
    expect(formatTranslation('Page {page} / {total}', { page: 2, total: 5 })).toBe('Page 2 / 5');
  });

  it('leaves unknown tokens intact', () => {
    expect(formatTranslation('Hello {name}', {})).toBe('Hello {name}');
  });
});
