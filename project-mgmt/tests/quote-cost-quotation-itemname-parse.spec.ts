import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import { parseQuotationWorkbook } from '../src/lib/quotation-import';

function buildWorkbookBuffer() {
  const rows = [
    ['酷亞專案系統報價單'],
    ['商品名', '', '單價', '數量', '單位', '金額', '備註'],
    ['1', '98888方案', '', '', '', '98888', ''],
    ['1-1', '音響設備', '', '1', '式', '', '含卡拉OK設備'],
    ['3-1', '活動紀錄-動態攝影雙機', '28000', '1', '式', '', ''],
    ['', '[總金額]', '', '', '', '104462', ''],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '報價單');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

test('quotation import reads item name from the column after item number while keeping total amount rule unchanged', () => {
  const result = parseQuotationWorkbook(buildWorkbookBuffer(), 'prefixed-quotation.xlsx');

  expect(result.totalAmount).toBe(104462);
  expect(result.items).toHaveLength(3);
  expect(result.items[0]?.itemName).toBe('98888方案');
  expect(result.items[1]?.itemName).toBe('音響設備');
  expect(result.items[2]?.itemName).toBe('活動紀錄-動態攝影雙機');
  expect(result.items[0]?.amount).toBe(98888);
  expect(result.items[1]?.remark).toBe('含卡拉OK設備');
  expect(result.items[2]?.unitPrice).toBe(28000);
});
