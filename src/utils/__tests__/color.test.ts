import { darkenColor } from '../color';

describe('darkenColor', () => {
  it('darkens 6- and 3-digit hex colors', () => {
    expect(darkenColor('#ffffff', 20)).toBe('#ebebeb');
    expect(darkenColor('#fff', 20)).toBe('#ebebeb');
  });

  it('clamps at zero and keeps alpha', () => {
    expect(darkenColor('#0a0a0a', 20)).toBe('#000000');
    expect(darkenColor('#ffffff80', 20)).toBe('#ebebeb80');
  });

  it('returns non-hex colors unchanged', () => {
    expect(darkenColor('rgba(0, 0, 0, 0.5)', 20)).toBe('rgba(0, 0, 0, 0.5)');
    expect(darkenColor('red', 20)).toBe('red');
  });
});
