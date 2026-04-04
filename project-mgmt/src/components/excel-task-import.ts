import type { ProjectExecutionItem } from "@/components/project-data";

export type ParsedExcelRowType = "main" | "sub" | "stop" | "ignored" | "failed";

export type ParsedExcelRow = {
  rowNumber: number;
  code: string;
  name: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  amount: string;
  raw: string[];
  type: ParsedExcelRowType;
  reason?: string;
  parentMainTitle?: string;
  targetSubTitle?: string;
};

export type ParsedExcelSubItemPreview = {
  id: string;
  code: string;
  title: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  amount: string;
  rowNumber: number;
};

export type ParsedExcelMainItemPreview = {
  id: string;
  title: string;
  rowNumber: number;
  children: ParsedExcelSubItemPreview[];
};

export type ParsedExcelImportPreview = {
  headerRowNumber: number;
  items: ProjectExecutionItem[];
  mainItems: ParsedExcelMainItemPreview[];
  rows: ParsedExcelRow[];
  ignoredRowNumbers: number[];
  failedRowNumbers: number[];
  stopRowNumber: number | null;
};

const STOP_KEYWORDS = ["小計", "稅金", "營業稅", "總計", "總金額", "備註", "付款條件", "匯款資訊", "銀行", "帳號", "統編"];

function normalizeText(value: unknown) {
  return String(value ?? "")
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildHeaderMap(rows: string[][]) {
  const fixedHeaderRowIndex = rows.findIndex((row) => normalizeText(row[0]).includes("商品名"));
  const headerRowIndex = fixedHeaderRowIndex >= 0 ? fixedHeaderRowIndex : 1;

  return {
    headerRowIndex,
    codeIndex: 0,
    nameIndex: 1,
    unitPriceIndex: 2,
    quantityIndex: 3,
    unitIndex: 4,
    amountIndex: 5,
  };
}

function isStopRow(cells: string[]) {
  const joined = cells.filter(Boolean).join(" ");
  return STOP_KEYWORDS.some((keyword) => joined.includes(keyword));
}

function makeMainItemId(order: number, rowNumber: number) {
  return `excel-main-${order}-${rowNumber}`;
}

function makeSubItemId(mainOrder: number, code: string, rowNumber: number) {
  return `excel-sub-${mainOrder}-${code.replace(/[^\w-]+/g, "-")}-${rowNumber}`;
}

function findNameFromRow(raw: string[], fallbackIndex: number) {
  return normalizeText(raw[fallbackIndex]);
}

export function parseExecutionItemsFromExcelRows(rawRows: unknown[][]): ParsedExcelImportPreview {
  const rows = rawRows.map((row) => row.map((cell) => normalizeText(cell)));
  const header = buildHeaderMap(rows);

  if (!header) {
    throw new Error("找不到符合報價明細的表頭，請確認第一個 sheet 內有包含項次 / 品名 / 數量 / 單位 / 單價 / 金額的明細區塊。");
  }

  const parsedRows: ParsedExcelRow[] = [];
  const mainItems: ParsedExcelMainItemPreview[] = [];
  const items: ProjectExecutionItem[] = [];
  const ignoredRowNumbers: number[] = [];
  const failedRowNumbers: number[] = [];

  let currentMain: ParsedExcelMainItemPreview | null = null;
  let currentItem: ProjectExecutionItem | null = null;
  let currentSub: ParsedExcelSubItemPreview | null = null;
  let mainOrder = 0;
  let stopRowNumber: number | null = null;

  for (let rowIndex = header.headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const raw = rows[rowIndex] ?? [];
    const code = normalizeText(raw[header.codeIndex]);
    const name = findNameFromRow(raw, header.nameIndex);
    const quantity = normalizeText(raw[header.quantityIndex]);
    const unit = normalizeText(raw[header.unitIndex]);
    const unitPrice = normalizeText(raw[header.unitPriceIndex]);
    const amount = normalizeText(raw[header.amountIndex]);
    const rowNumber = rowIndex + 1;
    const visibleCells = raw.filter(Boolean);

    if (!visibleCells.length) {
      ignoredRowNumbers.push(rowNumber);
      parsedRows.push({ rowNumber, code, name, quantity, unit, unitPrice, amount, raw, type: "ignored", reason: "空白列" });
      continue;
    }

    if (isStopRow(visibleCells)) {
      stopRowNumber = rowNumber;
      parsedRows.push({ rowNumber, code, name, quantity, unit, unitPrice, amount, raw, type: "stop", reason: "進入結算 / 條款區" });
      break;
    }

    const isMain = /^\d+$/.test(code) || /^\d+\.$/.test(code) || /^\d+\..+/.test(code);
    const isSub = /^\d+-\d+$/.test(code);

    if (isSub) {
      if (!currentMain || !currentItem) {
        failedRowNumbers.push(rowNumber);
        parsedRows.push({ rowNumber, code, name, quantity, unit, unitPrice, amount, raw, type: "failed", reason: "子項目缺少主項目" });
        continue;
      }

      const title = name || code;
      currentSub = {
        id: makeSubItemId(mainOrder, code, rowNumber),
        code,
        title,
        quantity,
        unit,
        unitPrice,
        amount,
        rowNumber,
      };
      currentMain.children.push(currentSub);
      currentItem.children = [
        ...(currentItem.children ?? []),
        { id: currentSub.id, title, status: "待交辦", assignee: "未指派", category: "專案", quantity, unit, amount, note: unitPrice ? `預覽單價：${unitPrice}` : undefined },
      ];
      parsedRows.push({ rowNumber, code, name, quantity, unit, unitPrice, amount, raw, type: "sub", parentMainTitle: currentMain.title });
      continue;
    }

    if (isMain) {
      const mainTitle = name || code.replace(/^\d+\.?/, "").trim();
      if (!mainTitle) {
        ignoredRowNumbers.push(rowNumber);
        parsedRows.push({ rowNumber, code, name, quantity, unit, unitPrice, amount, raw, type: "ignored", reason: "主項目缺少名稱" });
        continue;
      }
      mainOrder += 1;
      currentMain = { id: makeMainItemId(mainOrder, rowNumber), title: mainTitle, rowNumber, children: [] };
      currentItem = { id: currentMain.id, title: name, status: "待交辦", category: "專案", detail: `匯入自 Excel 第 ${rowNumber} 列`, referenceExample: "", designTaskCount: 0, procurementTaskCount: 0, children: [] };
      currentSub = null;
      mainItems.push(currentMain);
      items.push(currentItem);
      parsedRows.push({ rowNumber, code, name, quantity, unit, unitPrice, amount, raw, type: "main" });
      continue;
    }

    ignoredRowNumbers.push(rowNumber);
    parsedRows.push({ rowNumber, code, name, quantity, unit, unitPrice, amount, raw, type: "ignored", reason: "未命中主項目 / 子項目規則" });
  }

  return {
    headerRowNumber: header.headerRowIndex + 1,
    items,
    mainItems,
    rows: parsedRows,
    ignoredRowNumbers,
    failedRowNumbers,
    stopRowNumber,
  };
}
