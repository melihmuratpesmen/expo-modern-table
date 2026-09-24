import { Column } from '../types';
import { getCellValue } from './values';

export type Aggregation = 'sum' | 'avg' | 'min' | 'max' | 'count';

/**
 * Built-in footer aggregation over a column's values. Non-numeric values are ignored
 * (`count` counts non-blank values). Returns `undefined` when there is nothing to aggregate.
 */
export function aggregate<T>(
  rows: readonly T[],
  column: Pick<Column<T>, 'key' | 'getValue'>,
  kind: Aggregation
): number | undefined {
  const values = rows.map(row => getCellValue(row, column));
  if (kind === 'count') {
    return values.filter(v => v !== null && v !== undefined && v !== '').length;
  }

  const numbers = values
    .filter(v => v !== null && v !== undefined && v !== '')
    .map(Number)
    .filter(Number.isFinite);
  if (numbers.length === 0) return undefined;

  switch (kind) {
    case 'sum':
      return numbers.reduce((a, b) => a + b, 0);
    case 'avg':
      return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    case 'min':
      return Math.min(...numbers);
    case 'max':
      return Math.max(...numbers);
  }
}
