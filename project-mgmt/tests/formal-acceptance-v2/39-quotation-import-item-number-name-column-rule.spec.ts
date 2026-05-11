import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  queryDb,
} from '../formal-acceptance-helpers';

function buildSeparatedItemNoAndNameWorkbookBuffer() {
  const rows = [
    ['酷亞專案系統報價單'],
    ['商品名', '', '單價', '數量', '單位', '金額', '備註'],
    ['1', '98888方案', '', '', '', '98888', ''],
    ['1-1', '音響設備', '', '1', '式', '', '含卡拉OK設備'],
    ['1-2', '晚宴主持人(中文)', '', '1', '式', '', ''],
    ['3-1', '活動紀錄-動態攝影雙機', '28000', '1', '式', '', ''],
    ['', '[總金額]', '', '', '', '104462', ''],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '報價單');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

test.describe.serial('formal acceptance v2 · quotation import item-number/name separated column rule', () => {
  test('quotation import reads item names from the name column while preserving total amount source-of-truth', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收 報價匯入項次商品名分欄 ${Date.now()}`,
      note: 'quotation import item-number name separated column rule',
    });

    try {
      const quotationImport = await request.post(`/api/financial-projects/${created.project.id}/quotation-import`, {
        multipart: {
          file: {
            name: 'quotation-item-no-name-separated.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: buildSeparatedItemNoAndNameWorkbookBuffer(),
          },
        },
      });
      expect(quotationImport.ok()).toBeTruthy();

      const payload = await quotationImport.json();
      expect(payload.totalAmount).toBe(104462);
      expect(payload.itemCount).toBe(4);

      const quotationImportRows = await queryDb<{ total_amount: number }>(
        `select total_amount::int as total_amount from financial_quotation_imports where project_id = $1 and is_active = true order by created_at desc limit 1`,
        [created.project.id],
      );
      expect(quotationImportRows[0]?.total_amount).toBe(104462);

      const lineItems = await queryDb<{ item_name: string; line_amount: number; remark: string | null }>(
        `select item_name, coalesce(line_amount, 0)::int as line_amount, remark
           from financial_quotation_line_items fqli
           inner join financial_quotation_imports fqi on fqi.id = fqli.quotation_import_id
          where fqi.project_id = $1 and fqi.is_active = true
          order by fqli.sort_order asc`,
        [created.project.id],
      );

      expect(lineItems.map((row) => row.item_name)).toEqual([
        '98888方案',
        '音響設備',
        '晚宴主持人(中文)',
        '活動紀錄-動態攝影雙機',
      ]);
      expect(lineItems[0]?.line_amount).toBe(98888);
      expect(lineItems[1]?.remark ?? '').toContain('卡拉OK');

      await page.goto(`/quote-costs/${created.project.id}`);
      await expect(page.getByText('$104,462').first()).toBeVisible();

      await page.getByRole('button', { name: '明細' }).click();
      await expect(page.getByRole('heading', { name: '對外報價單明細' })).toBeVisible();
      await expect(page.getByText('98888方案')).toBeVisible();
      await expect(page.getByText('音響設備')).toBeVisible();
      await expect(page.getByText('晚宴主持人(中文)')).toBeVisible();
      await expect(page.getByText('活動紀錄-動態攝影雙機')).toBeVisible();
      await expect(page.getByText(/^1-1$/)).toHaveCount(0);
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
