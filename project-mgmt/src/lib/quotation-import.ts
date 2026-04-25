import * as XLSX from 'xlsx';

export class QuotationImportValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'QuotationImportValidationError';
  }
}

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
const HEADER_ALIASES: Record<(typeof REQUIRED_HEADERS)[number], string[]> = {
  商品名稱: ['商品名稱', '商品名'],
  單價: ['單價'],
  數量: ['數量'],
  單位: ['單位'],
  金額: ['金額'],
  備註: ['備註'],
};
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

      for (const header of REQUIRED_HEADERS) {
        if (HEADER_ALIASES[header].includes(normalized)) {
          headerIndexMap.set(header, index);
        }
      }
    });

    if (REQUIRED_HEADERS.every((header) => headerIndexMap.has(header))) {
      return { rowIndex, headerIndexMap };
    }
  }

  return null;
}

function isTotalAmountLabel(value: unknown) {
  const normalized = normalizeCell(value).replace(/[\[\]【】()（）:：]/g, '');
  return normalized === '總金額';
}

function findTotalAmount(rows: unknown[][]) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (!isTotalAmountLabel(row[columnIndex])) continue;

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

  throw new QuotationImportValidationError('找不到名為「總金額」的欄位，無法匯入這份 Excel。');
}

export function parseQuotationWorkbook(buffer: ArrayBuffer, fileName: string): ImportedQuotationPayload {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'array' });
  } catch {
    throw new QuotationImportValidationError('Excel 檔案格式無法辨識，請確認檔案內容與副檔名正確。');
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new QuotationImportValidationError('找不到可讀取的工作表。');
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
    throw new QuotationImportValidationError('找不到六欄標題：商品名稱、單價、數量、單位、金額、備註。');
  }

  const items: ImportedQuotationLine[] = [];

  for (let rowIndex = headerMatch.rowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const itemNameIndex = headerMatch.headerIndexMap.get('商品名稱') ?? 1;
    const itemName = String(row[itemNameIndex] ?? '').trim();
    const unitPriceRaw = row[headerMatch.headerIndexMap.get('單價') ?? 2];
    const quantityRaw = row[headerMatch.headerIndexMap.get('數量') ?? 3];
    const unit = String(row[headerMatch.headerIndexMap.get('單位') ?? 4] ?? '').trim();
    const amountRaw = row[headerMatch.headerIndexMap.get('金額') ?? 5];
    const remark = String(row[headerMatch.headerIndexMap.get('備註') ?? 6] ?? '');

    const rowValues = [itemName, unitPriceRaw, quantityRaw, unit, amountRaw, remark].map((value) => normalizeCell(value));
    if (rowValues.every((value) => value === '')) continue;
    if (isTotalAmountLabel(itemName)) continue;
    if (itemName === '備註') break;

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

  if (!items.length) {
    throw new QuotationImportValidationError('這份 Excel 只有表頭 / 總金額，沒有可成立的正式明細列，無法匯入。');
  }

  return {
    fileName,
    totalAmount: findTotalAmount(rows),
    items,
  };
}
