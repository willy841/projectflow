import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';

test.describe.serial('formal acceptance v2 · phase 6 · new project full-chain spot check', () => {
  test('fresh project can run upstream dispatch, three-line confirm, and downstream closeout chain', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收全鏈新案 ${Date.now()}`,
      note: 'full-chain fresh project validation',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            {
              title: '設計主線',
              children: [{ title: '新案設計主視覺' }],
            },
            {
              title: '備品主線',
              children: [{ title: '新案備品陳列桌' }],
            },
            {
              title: '廠商主線',
              children: [{ title: '新案現場施工' }],
            },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; item: string; parent_id: string | null }>(
        `select id, title as item, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      expect(executionRows.length).toBe(6);

      const childRows = executionRows.filter((row) => row.parent_id !== null);
      const designItem = childRows.find((row) => row.item.includes('設計'));
      const procurementItem = childRows.find((row) => row.item.includes('備品'));
      const vendorItem = childRows.find((row) => row.item.includes('施工'));
      expect(designItem?.id).toBeTruthy();
      expect(procurementItem?.id).toBeTruthy();
      expect(vendorItem?.id).toBeTruthy();

      const designDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: '新案設計主視覺',
          size: 'W120 x H180 cm',
          material: 'PVC',
          quantity: '1 式',
          structure: '立牌',
          referenceUrl: 'https://example.com/design',
          note: 'spot check design dispatch',
        },
      });
      expect(designDispatch.ok()).toBeTruthy();
      const designPayload = await designDispatch.json();
      const designTaskId = designPayload.taskId as string;

      const procurementDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'procurement',
          executionItemId: procurementItem!.id,
          title: '新案備品陳列桌',
          quantity: '1 式',
          referenceUrl: 'https://example.com/procurement',
          note: 'spot check procurement dispatch',
        },
      });
      expect(procurementDispatch.ok()).toBeTruthy();
      const procurementPayload = await procurementDispatch.json();
      const procurementTaskId = procurementPayload.taskId as string;

      const vendorDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'vendor',
          executionItemId: vendorItem!.id,
          title: '新案現場施工',
          requirement: '安裝與撤場',
          amount: '18000',
          vendorName: VENDOR_NAME,
          note: 'spot check vendor dispatch',
        },
      });
      expect(vendorDispatch.ok()).toBeTruthy();
      const vendorPayload = await vendorDispatch.json();
      const vendorTaskId = vendorPayload.taskId as string;

      const designSync = await request.post(`/api/design-tasks/${designTaskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `plan-design-${created.project.id}`,
              title: '新案設計主視覺-正式版',
              size: 'W120 x H180 cm',
              material: 'PVC',
              structure: '立牌',
              quantity: '1 式',
              amount: '12000',
              previewUrl: 'https://example.com/design/final',
              vendor: VENDOR_NAME,
              vendorId: VENDOR_ID,
            },
          ],
        },
      });
      expect(designSync.ok()).toBeTruthy();
      const designConfirm = await request.post(`/api/design-tasks/${designTaskId}/confirm`);
      expect(designConfirm.ok()).toBeTruthy();

      const procurementSync = await request.post(`/api/procurement-tasks/${procurementTaskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `plan-proc-${created.project.id}`,
              title: '新案備品陳列桌-正式版',
              quantity: '1 式',
              amount: '11000',
              previewUrl: 'https://example.com/proc/final',
              vendor: VENDOR_NAME,
              vendorId: VENDOR_ID,
            },
          ],
        },
      });
      expect(procurementSync.ok()).toBeTruthy();
      const procurementConfirm = await request.post(`/api/procurement-tasks/${procurementTaskId}/confirm`);
      expect(procurementConfirm.ok()).toBeTruthy();

      const vendorSync = await request.post(`/api/vendor-tasks/${vendorTaskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `plan-vendor-${created.project.id}`,
              title: '新案現場施工-正式版',
              requirement: '安裝與撤場',
              amount: '18000',
              vendorName: VENDOR_NAME,
            },
          ],
        },
      });
      expect(vendorSync.ok()).toBeTruthy();
      const vendorGroupConfirm = await request.post(`/api/vendor-groups/${created.project.id}/${VENDOR_ID}/confirm`);
      expect(vendorGroupConfirm.ok()).toBeTruthy();

      await page.goto(`/projects/${created.routeId}/design-document`);
      await expect(page.getByText('新案設計主視覺-正式版').first()).toBeVisible();

      await page.goto(`/projects/${created.routeId}/procurement-document`);
      await expect(page.getByText('新案備品陳列桌-正式版').first()).toBeVisible();

      const syncGroups = await request.post(`/api/financial-projects/${created.project.id}/reconciliation-groups/sync`, {
        data: {
          groups: [
            { sourceType: '設計', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 12000, itemCount: 1 },
            { sourceType: '備品', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 11000, itemCount: 1 },
            { sourceType: '廠商', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 18000, itemCount: 1 },
          ],
        },
      });
      expect(syncGroups.ok()).toBeTruthy();

      const collection = await request.post(`/api/accounting/projects/${created.project.id}/collections`, {
        data: {
          collectedOn: '2026-04-26',
          amount: 50000,
          note: 'fresh project collection',
        },
      });
      expect(collection.ok()).toBeTruthy();

      const closeout = await request.post(`/api/financial-projects/${created.project.id}/closeout`, {
        data: {
          expectedOutstandingTotal: 0,
          expectedReconciliationStatus: '已完成',
        },
      });
      expect(closeout.ok()).toBeTruthy();

      const closeoutRows = await queryDb<{ status: string | null }>(
        `select status from projects where id = $1`,
        [created.project.id],
      );
      expect(closeoutRows[0]?.status).toMatch(/結案/);

      const retainedRows = await queryDb<{ project_id: string }>(
        `select project_id from financial_closeout_snapshots where project_id = $1`,
        [created.project.id],
      );
      expect(retainedRows[0]?.project_id).toBe(created.project.id);

      await page.goto('/closeout');
      await expect(page.getByText(created.project.name).first()).toBeVisible();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
