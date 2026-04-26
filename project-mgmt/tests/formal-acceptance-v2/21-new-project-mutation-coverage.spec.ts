import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';

test.describe.serial('formal acceptance v2 · phase 6 · new project mutation coverage', () => {
  test('fresh project supports overwrite, delete, reopen, and re-closeout on the validated mainline', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收變異覆蓋新案 ${Date.now()}`,
      note: 'fresh project mutation coverage',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: '新案設計主視覺' }] },
            { title: '備品主線', children: [{ title: '新案備品陳列桌' }] },
            { title: '廠商主線', children: [{ title: '新案現場施工' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; item: string; parent_id: string | null }>(
        `select id, title as item, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const childRows = executionRows.filter((row) => row.parent_id !== null);
      const designItem = childRows.find((row) => row.item.includes('設計'))!;
      const procurementItem = childRows.find((row) => row.item.includes('備品'))!;
      const vendorItem = childRows.find((row) => row.item.includes('施工'))!;

      const designDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design', executionItemId: designItem.id, title: '新案設計主視覺', size: 'W120 x H180 cm', material: 'PVC', quantity: '1 式', structure: '立牌', referenceUrl: 'https://example.com/design', note: 'design dispatch',
        },
      });
      const designTaskId = (await designDispatch.json()).taskId as string;
      const procurementDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'procurement', executionItemId: procurementItem.id, title: '新案備品陳列桌', quantity: '1 式', referenceUrl: 'https://example.com/procurement', note: 'procurement dispatch',
        },
      });
      const procurementTaskId = (await procurementDispatch.json()).taskId as string;
      const vendorDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'vendor', executionItemId: vendorItem.id, title: '新案現場施工', requirement: '安裝與撤場', amount: '18000', vendorName: VENDOR_NAME, note: 'vendor dispatch',
        },
      });
      const vendorTaskId = (await vendorDispatch.json()).taskId as string;

      // first confirm round
      await request.post(`/api/design-tasks/${designTaskId}/sync-plans`, { data: { plans: [{ id: `plan-design-a-${created.project.id}`, title: '新案設計主視覺-A', size: 'W120 x H180 cm', material: 'PVC', structure: '立牌', quantity: '1 式', amount: '12000', previewUrl: 'https://example.com/design/a', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
      await request.post(`/api/design-tasks/${designTaskId}/confirm`);
      await request.post(`/api/procurement-tasks/${procurementTaskId}/sync-plans`, { data: { plans: [{ id: `plan-proc-a-${created.project.id}`, title: '新案備品陳列桌-A', quantity: '1 式', amount: '11000', previewUrl: 'https://example.com/proc/a', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
      await request.post(`/api/procurement-tasks/${procurementTaskId}/confirm`);
      await request.post(`/api/vendor-tasks/${vendorTaskId}/sync-plans`, { data: { plans: [{ id: `plan-vendor-a-${created.project.id}`, title: '新案現場施工-A', requirement: '安裝與撤場', amount: '18000', vendorName: VENDOR_NAME }] } });
      await request.post(`/api/vendor-groups/${created.project.id}/${VENDOR_ID}/confirm`);

      // overwrite round
      await request.post(`/api/design-tasks/${designTaskId}/sync-plans`, { data: { plans: [{ id: `plan-design-b-${created.project.id}`, title: '新案設計主視覺-B', size: 'W120 x H180 cm', material: 'PVC', structure: '立牌', quantity: '1 式', amount: '12500', previewUrl: 'https://example.com/design/b', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
      await request.post(`/api/design-tasks/${designTaskId}/confirm`);
      await request.post(`/api/procurement-tasks/${procurementTaskId}/sync-plans`, { data: { plans: [{ id: `plan-proc-b-${created.project.id}`, title: '新案備品陳列桌-B', quantity: '1 式', amount: '11500', previewUrl: 'https://example.com/proc/b', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
      await request.post(`/api/procurement-tasks/${procurementTaskId}/confirm`);
      await request.post(`/api/vendor-tasks/${vendorTaskId}/sync-plans`, { data: { plans: [{ id: `plan-vendor-b-${created.project.id}`, title: '新案現場施工-B', requirement: '安裝與撤場 B', amount: '18500', vendorName: VENDOR_NAME }] } });
      await request.post(`/api/vendor-groups/${created.project.id}/${VENDOR_ID}/confirm`);

      await page.goto(`/projects/${created.routeId}/design-document`);
      await expect(page.getByText('新案設計主視覺-B').first()).toBeVisible();
      await expect(page.getByText('新案設計主視覺-A')).toHaveCount(0);

      await page.goto(`/projects/${created.routeId}/procurement-document`);
      await expect(page.getByText('新案備品陳列桌-B').first()).toBeVisible();
      await expect(page.getByText('新案備品陳列桌-A')).toHaveCount(0);

      // delete dispatch for design, downstream should disappear
      const deleteDispatch = await request.delete(`/api/projects/${created.project.id}/dispatch/design/${designItem.id}`);
      expect(deleteDispatch.ok()).toBeTruthy();

      const deletedConfirmationRows = await queryDb<{ count: number }>(
        `select count(*)::int as count from task_confirmations where flow_type = 'design' and task_id = $1`,
        [designTaskId],
      );
      expect(deletedConfirmationRows[0]?.count ?? 0).toBe(0);

      await page.goto(`/projects/${created.routeId}/design-document`);
      await expect(page.getByText('新案設計主視覺-B')).toHaveCount(0);

      // rebuild design path after delete
      const redesignDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design', executionItemId: designItem.id, title: '新案設計主視覺-C', size: 'W120 x H180 cm', material: 'PVC', quantity: '1 式', structure: '立牌', referenceUrl: 'https://example.com/design/c', note: 'design redispatch',
        },
      });
      const redesignTaskId = (await redesignDispatch.json()).taskId as string;
      await request.post(`/api/design-tasks/${redesignTaskId}/sync-plans`, { data: { plans: [{ id: `plan-design-c-${created.project.id}`, title: '新案設計主視覺-C', size: 'W120 x H180 cm', material: 'PVC', structure: '立牌', quantity: '1 式', amount: '13000', previewUrl: 'https://example.com/design/c', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
      await request.post(`/api/design-tasks/${redesignTaskId}/confirm`);

      await page.goto(`/projects/${created.routeId}/design-document`);
      await expect(page.getByText('新案設計主視覺-C').first()).toBeVisible();

      // downstream closeout / reopen / re-closeout
      await request.post(`/api/financial-projects/${created.project.id}/reconciliation-groups/sync`, {
        data: {
          groups: [
            { sourceType: '設計', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 13000, itemCount: 1 },
            { sourceType: '備品', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 11500, itemCount: 1 },
            { sourceType: '廠商', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 18500, itemCount: 1 },
          ],
        },
      });
      await request.post(`/api/accounting/projects/${created.project.id}/collections`, {
        data: { collectedOn: '2026-04-26', amount: 50000, note: 'fresh project collection A' },
      });
      const firstCloseout = await request.post(`/api/financial-projects/${created.project.id}/closeout`, {
        data: { expectedOutstandingTotal: 0, expectedReconciliationStatus: '已完成' },
      });
      expect(firstCloseout.ok()).toBeTruthy();

      const reopen = await request.post(`/api/financial-projects/${created.project.id}/reopen`);
      expect(reopen.ok()).toBeTruthy();

      const reopenedRows = await queryDb<{ status: string | null }>(`select status from projects where id = $1`, [created.project.id]);
      expect(reopenedRows[0]?.status).toBe('執行中');

      const secondCloseout = await request.post(`/api/financial-projects/${created.project.id}/closeout`, {
        data: { expectedOutstandingTotal: 0, expectedReconciliationStatus: '已完成' },
      });
      expect(secondCloseout.ok()).toBeTruthy();

      await page.goto('/closeout');
      await expect(page.getByText(created.project.name).first()).toBeVisible();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
