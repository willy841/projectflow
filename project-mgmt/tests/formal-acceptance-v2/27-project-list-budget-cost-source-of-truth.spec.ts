import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  queryDb,
} from '../formal-acceptance-helpers';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const VENDOR_NAME = '驗收廠商C';

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

test.describe.serial('formal acceptance v2 · pack C · project list budget/cost source of truth', () => {
  test('quotation total and confirmed cost total stay aligned between quote-cost detail and projects list', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收專案列表金額一致性 ${Date.now()}`,
      note: 'project list budget cost source of truth',
    });

    try {
      const importExecutionItems = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: '設計成本項' }] },
            { title: '備品主線', children: [{ title: '備品成本項' }] },
            { title: '廠商主線', children: [{ title: '廠商成本項' }] },
          ],
        },
      });
      expect(importExecutionItems.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '設計成本項');
      const procurementItem = executionRows.find((row) => row.parent_id !== null && row.title === '備品成本項');
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === '廠商成本項');
      expect(designItem?.id).toBeTruthy();
      expect(procurementItem?.id).toBeTruthy();
      expect(vendorItem?.id).toBeTruthy();

      const designDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: '設計成本項',
          size: 'W120 x H180 cm',
          material: 'PVC',
          quantity: '1 式',
          structure: '立牌',
          note: '設計成本一致性',
        },
      });
      const designTaskId = (await designDispatch.json()).taskId as string;

      const procurementDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'procurement',
          executionItemId: procurementItem!.id,
          title: '備品成本項',
          quantity: '1 式',
          note: '備品成本一致性',
        },
      });
      const procurementTaskId = (await procurementDispatch.json()).taskId as string;

      const vendorDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'vendor',
          executionItemId: vendorItem!.id,
          title: '廠商成本項',
          requirement: '施工與撤場',
          amount: '7000',
          vendorName: VENDOR_NAME,
          note: '廠商成本一致性',
        },
      });
      const vendorTaskId = (await vendorDispatch.json()).taskId as string;
      expect(designTaskId).toBeTruthy();
      expect(procurementTaskId).toBeTruthy();
      expect(vendorTaskId).toBeTruthy();

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

      const quotationPayload = await quotationImport.json();
      expect(quotationPayload.totalAmount).toBe(65000);

      const quotationRows = await queryDb<{ total_amount: number }>(
        `select total_amount::int as total_amount from financial_quotation_imports where project_id = $1 and is_active = true order by created_at desc limit 1`,
        [created.project.id],
      );
      expect(quotationRows[0]?.total_amount).toBe(65000);

      const designSync = await request.post(`/api/design-tasks/${designTaskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `design-plan-${created.project.id}`,
              title: '設計成本項',
              size: 'W120 x H180 cm',
              material: 'PVC',
              structure: '立牌',
              quantity: '1 式',
              amount: '12000',
              previewUrl: 'https://example.com/design-cost',
              vendor: VENDOR_NAME,
              vendorId: VENDOR_ID,
            },
          ],
        },
      });
      expect(designSync.ok()).toBeTruthy();
      expect((await request.post(`/api/design-tasks/${designTaskId}/confirm`)).ok()).toBeTruthy();

      const procurementSync = await request.post(`/api/procurement-tasks/${procurementTaskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `proc-plan-${created.project.id}`,
              title: '備品成本項',
              quantity: '1 式',
              amount: '11000',
              previewUrl: 'https://example.com/proc-cost',
              vendor: VENDOR_NAME,
              vendorId: VENDOR_ID,
            },
          ],
        },
      });
      expect(procurementSync.ok()).toBeTruthy();
      expect((await request.post(`/api/procurement-tasks/${procurementTaskId}/confirm`)).ok()).toBeTruthy();

      const vendorSync = await request.post(`/api/vendor-tasks/${vendorTaskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `vendor-plan-${created.project.id}`,
              title: '廠商成本項',
              requirement: '施工與撤場',
              amount: '7000',
              vendorName: VENDOR_NAME,
            },
          ],
        },
      });
      expect(vendorSync.ok()).toBeTruthy();
      expect((await request.post(`/api/vendor-groups/${created.project.id}/${VENDOR_ID}/confirm`)).ok()).toBeTruthy();

      await page.goto(`/quote-costs/${created.project.id}`);
      await expect(page.getByText('$65,000').first()).toBeVisible();
      await expect(page.getByText('$12,000').first()).toBeVisible();
      await expect(page.getByRole('button', { name: /備品 \$11,000 1 筆/ }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /廠商 \$7,000 1 筆/ }).first()).toBeVisible();

      await page.goto('/projects');
      const row = page.locator('tr').filter({ has: page.getByRole('link', { name: created.project.name }) }).first();
      await expect(row).toContainText('$65,000');
      await expect(row).toContainText('$30,000');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
