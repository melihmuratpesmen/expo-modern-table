import { INVALID_EDIT, parseEditedValue, parseNumberInput } from '../edit';

describe('parseNumberInput', () => {
  it.each([
    ['12', 12],
    [' 7.5 ', 7.5],
    ['7,5', 7.5],
    ['-3', -3],
    ['', undefined],
    ['abc', undefined],
    ['-', undefined],
  ])('%p → %p', (text, expected) => expect(parseNumberInput(text)).toBe(expected));
});

describe('parseEditedValue', () => {
  it('keeps number columns numeric', () => {
    expect(parseEditedValue('8,25', 7.15)).toBe(8.25);
    expect(parseEditedValue('oops', 7.15)).toBe(INVALID_EDIT);
    expect(parseEditedValue('', 7.15)).toBe(INVALID_EDIT);
  });

  it('returns text for other columns', () => {
    expect(parseEditedValue('new', 'old')).toBe('new');
    expect(parseEditedValue('x', null)).toBe('x');
  });
});
