import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { readSpreadsheet } from '../src/services/spreadsheetFile.js';

test('CSV import handles quoted commas, escaped quotes, and missing values', async () => {
  const csv = 'Name,Note,Count\r\nAlpha,"hello, world",3\r\nBeta,"said ""yes""",\r\n';
  const parsed = await readSpreadsheet(new TextEncoder().encode(csv), 'evidence.csv');
  assert.deepEqual(parsed.sheets.CSV, [
    { Name: 'Alpha', Note: 'hello, world', Count: '3' },
    { Name: 'Beta', Note: 'said "yes"', Count: '' },
  ]);
});

test('XLSX import reads formulas by cached result and preserves sheet provenance', async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Evidence');
  sheet.addRow(['Name', 'Total']);
  sheet.addRow(['Approved', { formula: '1+2', result: 3 }]);
  const bytes = await workbook.xlsx.writeBuffer();
  const parsed = await readSpreadsheet(bytes, 'evidence.xlsx');
  assert.deepEqual(parsed.sheetNames, ['Evidence']);
  assert.deepEqual(parsed.sheets.Evidence, [{ Name: 'Approved', Total: 3 }]);
});

test('spreadsheet import rejects legacy and ambiguous file formats', async () => {
  await assert.rejects(() => readSpreadsheet(new Uint8Array([1, 2, 3]), 'legacy.xls'), /Only \.xlsx and \.csv/);
});
