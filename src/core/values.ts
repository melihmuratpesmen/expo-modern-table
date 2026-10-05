import { Column } from '../types';

/** A column key, or a function reading the value from a row. */
export type ValueField<T> = string | ((row: T) => unknown);

/** The value a column works with (sort, filter, search, default cell): `getValue` or `row[key]`. */
export function getCellValue<T>(row: T, column: Pick<Column<T>, 'key' | 'getValue'>): unknown {
  return column.getValue ? column.getValue(row) : row[column.key as keyof T];
}

export function readField<T>(row: T, field: ValueField<T>): unknown {
  return typeof field === 'function' ? field(row) : row[field as keyof T];
}
