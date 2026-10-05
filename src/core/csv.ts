import { Column } from '../types';
import { getCellValue } from './values';

export interface CsvOptions<T = unknown> {
  /** Default `,`. Excel with a Turkish / European locale expects `;`. */
  delimiter?: string;
  /** Default true. */
  includeHeader?: boolean;
  /** Prepend a UTF-8 byte-order mark so Excel shows non-ASCII text (ç, ğ, ş…) correctly. */
  bom?: boolean;
  /** Default `\r\n` (RFC 4180). */
  lineEnding?: string;
  /**
   * Prefix text starting with `=`, `+`, `-`, `@`, tab or CR with `'` so spreadsheets don't run
   * it as a formula (CSV injection). Numbers are never changed. Default true.
   */
  escapeFormulas?: boolean;
  /** Custom text for a cell; defaults to the column value as a string. */
  formatValue?: (value: unknown, column: Column<T>, row: T) => string;
}

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function stringify(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeCell(text: string, delimiter: string): string {
  const needsQuotes =
    text.includes(delimiter) || text.includes('"') || text.includes('\n') || text.includes('\r');
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Rows → CSV text, one column per entry in `columns` (using `getValue` when set). */
export function toCsv<T>(
  rows: readonly T[],
  columns: readonly Column<T>[],
  options: CsvOptions<T> = {}
): string {
  const {
    delimiter = ',',
    includeHeader = true,
    bom = false,
    lineEnding = '\r\n',
    escapeFormulas = true,
    formatValue,
  } = options;

  const cell = (value: unknown, column: Column<T>, row: T) => {
    let text = formatValue ? formatValue(value, column, row) : stringify(value);
    if (escapeFormulas && typeof value !== 'number' && FORMULA_PREFIX.test(text)) {
      text = `'${text}`;
    }
    return escapeCell(text, delimiter);
  };

  const lines: string[] = [];
  if (includeHeader) lines.push(columns.map(c => escapeCell(c.title, delimiter)).join(delimiter));
  for (const row of rows) {
    lines.push(columns.map(c => cell(getCellValue(row, c), c, row)).join(delimiter));
  }

  return (bom ? '﻿' : '') + lines.join(lineEnding);
}
