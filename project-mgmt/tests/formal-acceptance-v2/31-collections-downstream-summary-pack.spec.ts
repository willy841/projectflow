import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

function buildQuotationWorkbookBuffer() {
  const rows = [
    ['酷亞專案系統報價單'],
    ['商品名稱', '單價', '數量', '單位', '金額', '備註'],
    ['主背板輸出', '55000', '1', '式', '55000', '主輸出'],
    ['桌卡輸出', '10000', '1', '式', '10000', '桌卡'],
    ['總金額', '65000'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '報價單');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

test.describe.serial('formal acceptance v2 · pack G · collections downstream summary', () => {
  test('collection mutation stays aligned between quote-cost detail and accounting active-project read model', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收收款下游摘要 ${Date.now()}`,
      note: 'collections downstream summary pack',
    });

    try {
      const quotationImport = await request.post(`/api/financial-projects/${created.project.id}/quotation-import`, {
        multipart: {
          file: {
            name: 'formal-acceptance-quotation.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: buildQuotationWorkbookBuffer(),
          },
        },
      });
      expect(quotationImport.ok()).toBeTruthy();

      const collection = await request.post(`/api/accounting/projects/${created.project.id}/collections`, {
        data: {
          collectedOn: '2026-04-30',
          amount: 20000,
          note: 'pack g collection readback',
        },
      });
      expect(collection.ok()).toBeTruthy();

      await page.goto(`/quote-costs/${created.project.id}`);
      await expect(page.getByText('$65,000').first()).toBeVisible();
      await expect(page.getByText('$20,000').first()).toBeVisible();
      await expect(page.getByText('$45,000').first()).toBeVisible();

      const collectionRows = await queryDb<{ total: number }>(
        `select coalesce(sum(amount), 0)::int as total from project_collection_records where project_id = $1`,
        [created.project.id],
      );
      expect(collectionRows[0]?.total).toBe(20000);

      const quotationRows = await queryDb<{ total: number }>(
        `select total_amount::int as total from financial_quotation_imports where project_id = $1 and is_active = true order by created_at desc limit 1`,
        [created.project.id],
      );
      expect(quotationRows[0]?.total).toBe(65000);

      const outstanding = (quotationRows[0]?.total ?? 0) - (collectionRows[0]?.total ?? 0);
      expect(outstanding).toBe(45000);

      const accountingLikeRows = await queryDb<{ project_id: string; collected_amount: number }>(
        `select project_id, coalesce(sum(amount), 0)::int as collected_amount from project_collection_records where project_id = $1 group by project_id`,
        [created.project.id],
      );
      expect(accountingLikeRows[0]?.project_id).toBe(created.project.id);
      expect(accountingLikeRows[0]?.collected_amount).toBe(20000);
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
