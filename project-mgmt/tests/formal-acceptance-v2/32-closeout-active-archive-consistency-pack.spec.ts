import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · pack H · closeout active archive consistency', () => {
  test('closeout, reopen, and second closeout keep active and retained truth aligned', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收結案封存一致性 ${Date.now()}`,
      note: 'closeout active archive consistency pack',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: 'Pack H 設計項目' }] },
            { title: '備品主線', children: [{ title: 'Pack H 備品項目' }] },
            { title: '廠商主線', children: [{ title: 'Pack H 廠商項目' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Pack H 設計項目');
      const procurementItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Pack H 備品項目');
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Pack H 廠商項目');
      expect(designItem?.id).toBeTruthy();
      expect(procurementItem?.id).toBeTruthy();
      expect(vendorItem?.id).toBeTruthy();

      const designDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design', executionItemId: designItem!.id, title: 'Pack H 設計項目', size: 'W120 x H180 cm', material: 'PVC', quantity: '1 式', structure: '立牌', note: 'pack h design'
        },
      });
      const designTaskId = (await designDispatch.json()).taskId as string;

      const procurementDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'procurement', executionItemId: procurementItem!.id, title: 'Pack H 備品項目', quantity: '1 式', note: 'pack h procurement'
        },
      });
      const procurementTaskId = (await procurementDispatch.json()).taskId as string;

      const vendorDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'vendor', executionItemId: vendorItem!.id, title: 'Pack H 廠商項目', requirement: '安裝與撤場', amount: '18000', vendorName: VENDOR_NAME, note: 'pack h vendor'
        },
      });
      const vendorTaskId = (await vendorDispatch.json()).taskId as string;

      await request.post(`/api/design-tasks/${designTaskId}/sync-plans`, { data: { plans: [{ id: `pack-h-design-${created.project.id}`, title: 'Pack H 設計項目', size: 'W120 x H180 cm', material: 'PVC', structure: '立牌', quantity: '1 式', amount: '12000', previewUrl: 'https://example.com/pack-h-design', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
      await request.post(`/api/design-tasks/${designTaskId}/confirm`);

      await request.post(`/api/procurement-tasks/${procurementTaskId}/sync-plans`, { data: { plans: [{ id: `pack-h-proc-${created.project.id}`, title: 'Pack H 備品項目', quantity: '1 式', amount: '11000', previewUrl: 'https://example.com/pack-h-proc', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
      await request.post(`/api/procurement-tasks/${procurementTaskId}/confirm`);

      await request.post(`/api/vendor-tasks/${vendorTaskId}/sync-plans`, { data: { plans: [{ id: `pack-h-vendor-${created.project.id}`, title: 'Pack H 廠商項目', requirement: '安裝與撤場', amount: '18000', vendorName: VENDOR_NAME }] } });
      await request.post(`/api/vendor-groups/${created.project.id}/${VENDOR_ID}/confirm`);

      await request.post(`/api/financial-projects/${created.project.id}/reconciliation-groups/sync`, {
        data: {
          groups: [
            { sourceType: '設計', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 12000, itemCount: 1 },
            { sourceType: '備品', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 11000, itemCount: 1 },
            { sourceType: '廠商', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 18000, itemCount: 1 },
          ],
        },
      });
      await request.post(`/api/accounting/projects/${created.project.id}/collections`, {
        data: { collectedOn: '2026-04-30', amount: 50000, note: 'pack h first collection' },
      });

      const firstCloseout = await request.post(`/api/financial-projects/${created.project.id}/closeout`, {
        data: { expectedOutstandingTotal: 0, expectedReconciliationStatus: '已完成' },
      });
      expect(firstCloseout.ok()).toBeTruthy();

      const firstSnapshotRows = await queryDb<{ project_id: string; project_cost_total: number }>(
        `select project_id, project_cost_total::int as project_cost_total from financial_closeout_snapshots where project_id = $1 order by captured_at desc limit 1`,
        [created.project.id],
      );
      expect(firstSnapshotRows[0]?.project_id).toBe(created.project.id);
      expect(firstSnapshotRows[0]?.project_cost_total).toBe(41000);

      await page.goto(`/closeouts/${created.project.id}`);
      await expect(page.getByText('$41,000').first()).toBeVisible();

      const reopen = await request.post(`/api/financial-projects/${created.project.id}/reopen`);
      expect(reopen.ok()).toBeTruthy();

      const statusRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [created.project.id]);
      expect(statusRows[0]?.status).toBe('執行中');

      const collection2 = await request.post(`/api/accounting/projects/${created.project.id}/collections`, {
        data: { collectedOn: '2026-05-01', amount: 10000, note: 'pack h second collection' },
      });
      expect(collection2.ok()).toBeTruthy();

      const secondCloseout = await request.post(`/api/financial-projects/${created.project.id}/closeout`, {
        data: { expectedOutstandingTotal: 0, expectedReconciliationStatus: '已完成' },
      });
      expect(secondCloseout.ok()).toBeTruthy();

      const secondSnapshotRows = await queryDb<{ project_cost_total: number }>(
        `select project_cost_total::int as project_cost_total from financial_closeout_snapshots where project_id = $1 order by captured_at desc limit 1`,
        [created.project.id],
      );
      expect(secondSnapshotRows[0]?.project_cost_total).toBe(41000);

      await page.goto(`/closeouts/${created.project.id}`);
      await expect(page.getByText('$60,000').first()).toBeVisible();
      await expect(page.getByText('$41,000').first()).toBeVisible();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
