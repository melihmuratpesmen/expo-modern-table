const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Darkens a hex color (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`) by subtracting `amount`
 * (0–255) from each channel. Non-hex colors (rgba(), named colors, …) are returned as-is.
 */
export function darkenColor(color: string, amount: number): string {
  if (!HEX_COLOR.test(color)) return color;

  let hex = color.slice(1);
  if (hex.length <= 4) hex = [...hex].map(c => c + c).join('');

  const channels = [0, 2, 4].map(i =>
    Math.max(0, parseInt(hex.slice(i, i + 2), 16) - amount)
      .toString(16)
      .padStart(2, '0')
  );
  const alpha = hex.length === 8 ? hex.slice(6) : '';
  return `#${channels.join('')}${alpha}`;
}
