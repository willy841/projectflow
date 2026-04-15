import * as XLSX from 'xlsx';

export type ImportedQuotationLine = {
  sortOrder: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  amount: number;
  remark: string;
};

export type ImportedQuotationPayload = {
  fileName: string;
  totalAmount: number;
  items: ImportedQuotationLine[];
};

const REQUIRED_HEADERS = ['商品名稱', '單價', '數量', '單位', '金額', '備註'] as const;
const HEADER_NORMALIZER = /\s+/g;

function normalizeCell(value: unknown) {
  return String(value ?? '').replace(HEADER_NORMALIZER, '').trim();
}

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value ?? '').replace(/[,$，\s]/g, '').trim();
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findHeaderRow(rows: unknown[][]) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const headerIndexMap = new Map<string, number>();

    row.forEach((cell, index) => {
      const normalized = normalizeCell(cell);
      if (!normalized) return;
      if (REQUIRED_HEADERS.includes(normalized as (typeof REQUIRED_HEADERS)[number])) {
        headerIndexMap.set(normalized, index);
      }
    });

    if (REQUIRED_HEADERS.every((header) => headerIndexMap.has(header))) {
      return { rowIndex, headerIndexMap };
    }
  }

  return null;
}

function findTotalAmount(rows: unknown[][]) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (normalizeCell(row[columnIndex]) !== '總金額') continue;

      for (let nextColumn = columnIndex + 1; nextColumn < row.length; nextColumn += 1) {
        const candidate = row[nextColumn];
        if (normalizeCell(candidate) === '') continue;
        return parseNumber(candidate);
      }

      const nextRow = rows[rowIndex + 1] ?? [];
      const below = nextRow[columnIndex];
      if (normalizeCell(below) !== '') {
        return parseNumber(below);
      }
    }
  }

  throw new Error('找不到名為「總金額」的欄位，無法匯入這份 Excel。');
}

export function parseQuotationWorkbook(buffer: ArrayBuffer, fileName: string): ImportedQuotationPayload {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('找不到可讀取的工作表。');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: '',
    raw: false,
  });

  const headerMatch = findHeaderRow(rows);
  if (!headerMatch) {
    throw new Error('找不到六欄標題：商品名稱、單價、數量、單位、金額、備註。');
  }

  const items: ImportedQuotationLine[] = [];

  for (let rowIndex = headerMatch.rowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const itemName = String(row[headerMatch.headerIndexMap.get('商品名稱') ?? -1] ?? '').trim();
    const unitPriceRaw = row[headerMatch.headerIndexMap.get('單價') ?? -1];
    const quantityRaw = row[headerMatch.headerIndexMap.get('數量') ?? -1];
    const unit = String(row[headerMatch.headerIndexMap.get('單位') ?? -1] ?? '').trim();
    const amountRaw = row[headerMatch.headerIndexMap.get('金額') ?? -1];
    const remark = String(row[headerMatch.headerIndexMap.get('備註') ?? -1] ?? '');

    const rowValues = [itemName, unitPriceRaw, quantityRaw, unit, amountRaw, remark].map((value) => normalizeCell(value));
    if (rowValues.every((value) => value === '')) continue;

    items.push({
      sortOrder: items.length + 1,
      itemName,
      unitPrice: parseNumber(unitPriceRaw),
      quantity: parseNumber(quantityRaw),
      unit,
      amount: parseNumber(amountRaw),
      remark,
    });
  }

  return {
    fileName,
    totalAmount: findTotalAmount(rows),
    items,
  };
}
