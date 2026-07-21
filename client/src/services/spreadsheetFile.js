import ExcelJS from 'exceljs';

const valueOf = (cell) => {
  const value = cell.value;
  if (value && typeof value === 'object') {
    if ('result' in value) return value.result;
    if ('text' in value) return value.text;
  }
  return value ?? '';
};

const worksheetRows = (sheet) => {
  const headers = sheet.getRow(1).values.slice(1).map((value, index) => String(value || `Column ${index + 1}`));
  const rows = [];
  sheet.eachRow((row, number) => {
    if (number === 1) return;
    const item = {};
    headers.forEach((header, index) => { item[header] = valueOf(row.getCell(index + 1)); });
    if (Object.values(item).some((value) => value !== '')) rows.push(item);
  });
  return rows;
};

const parseCsv = (text) => {
  const matrix = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { field += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); matrix.push(row); row = []; field = '';
    } else field += char;
  }
  if (field || row.length) { row.push(field); matrix.push(row); }
  const headers = matrix.shift() || [];
  return matrix.filter((values) => values.some(Boolean)).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header || `Column ${index + 1}`, values[index] ?? ''])));
};

export async function readSpreadsheet(buffer, fileName = '') {
  if (/\.csv$/i.test(fileName)) {
    return { sheetNames: ['CSV'], sheets: { CSV: parseCsv(new TextDecoder().decode(buffer)) } };
  }
  if (!/\.xlsx$/i.test(fileName)) throw new Error('Only .xlsx and .csv files are supported');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheetNames = workbook.worksheets.map((sheet) => sheet.name);
  return { sheetNames, sheets: Object.fromEntries(workbook.worksheets.map((sheet) => [sheet.name, worksheetRows(sheet)])) };
}

export async function downloadSpreadsheet(sheets, fileName) {
  const workbook = new ExcelJS.Workbook();
  for (const { name, rows } of sheets) {
    const sheet = workbook.addWorksheet(name);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    if (headers.length) {
      sheet.addRow(headers);
      rows.forEach((row) => sheet.addRow(headers.map((header) => row[header] ?? '')));
    }
  }
  const bytes = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.replace(/\.(xlsx|csv)$/i, '') + '.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}
