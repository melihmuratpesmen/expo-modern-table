import { Column } from '../../types';
import { toCsv } from '../csv';

type Row = { id: number; name: string; score: number | null; note?: string };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name' },
  { key: 'score', title: 'Score' },
  { key: 'note', title: 'Note' },
];

describe('toCsv', () => {
  it('writes a header and rows with CRLF', () => {
    const csv = toCsv([{ id: 1, name: 'Ali', score: 7.5, note: 'ok' }], columns);
    expect(csv).toBe('Name,Score,Note\r\nAli,7.5,ok');
  });

  it('quotes delimiters, quotes and newlines', () => {
    const csv = toCsv(
      [{ id: 1, name: 'Yılmaz, Ayşe', score: 1, note: 'said "hi"\nbye' }],
      columns,
      { includeHeader: false }
    );
    expect(csv).toBe('"Yılmaz, Ayşe",1,"said ""hi""\nbye"');
  });

  it('writes blanks for null / undefined', () => {
    expect(toCsv([{ id: 1, name: 'A', score: null }], columns, { includeHeader: false })).toBe(
      'A,,'
    );
  });

  it('supports ; delimiter and a BOM for Excel', () => {
    const csv = toCsv([{ id: 1, name: 'Çağla', score: 3 }], columns.slice(0, 2), {
      delimiter: ';',
      bom: true,
    });
    expect(csv).toBe('﻿Name;Score\r\nÇağla;3');
  });

  it('escapes formula-looking text but not numbers', () => {
    const csv = toCsv([{ id: 1, name: '=HYPERLINK("x")', score: -5, note: '-note' }], columns, {
      includeHeader: false,
    });
    expect(csv).toBe(`"'=HYPERLINK(""x"")",-5,'-note`);
    expect(
      toCsv([{ id: 1, name: '=1+1', score: 0 }], columns.slice(0, 1), {
        includeHeader: false,
        escapeFormulas: false,
      })
    ).toBe('=1+1');
  });

  it('uses getValue and formatValue', () => {
    const cols: Column<Row>[] = [
      { key: 'label', title: 'Label', getValue: r => `${r.name}#${r.id}` },
      { key: 'score', title: 'Score' },
    ];
    const csv = toCsv([{ id: 7, name: 'A', score: 0.5 }], cols, {
      includeHeader: false,
      formatValue: (value, column) =>
        column.key === 'score' ? `${Number(value) * 100}%` : String(value),
    });
    expect(csv).toBe('A#7,50%');
  });
});
