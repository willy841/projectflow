import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import { parseQuotationWorkbook } from '../src/lib/quotation-import';

function buildWorkbookBuffer() {
  const rows = [
    ['酷亞專案系統報價單'],
    ['商品名稱', '單價', '數量', '單位', '金額', '備註'],
    ['1. 入口主背板製作', '55000', '1', '式', '55000', '主輸出'],
    ['1.1 導視系統與立牌', '10000', '1', '式', '10000', '桌卡'],
    ['總金額', '65000'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '報價單');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

test('quotation import itemName strips numeric prefixes but keeps total amount rule unchanged', () => {
  const result = parseQuotationWorkbook(buildWorkbookBuffer(), 'prefixed-quotation.xlsx');

  expect(result.totalAmount).toBe(65000);
  expect(result.items).toHaveLength(2);
  expect(result.items[0]?.itemName).toBe('入口主背板製作');
  expect(result.items[1]?.itemName).toBe('導視系統與立牌');
  expect(result.items[0]?.amount).toBe(55000);
  expect(result.items[1]?.amount).toBe(10000);
});
