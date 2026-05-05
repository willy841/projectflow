import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · pack F · dispatch family routing downstream readback', () => {
  test('dispatch to design / procurement / vendor creates family tasks and reads back across family list, family detail, and project detail', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收派工分流讀回 ${Date.now()}`,
      note: 'dispatch family routing downstream readback',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: 'Pack F 設計項目' }] },
            { title: '備品主線', children: [{ title: 'Pack F 備品項目' }] },
            { title: '廠商主線', children: [{ title: 'Pack F 廠商項目' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Pack F 設計項目');
      const procurementItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Pack F 備品項目');
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Pack F 廠商項目');
      expect(designItem?.id).toBeTruthy();
      expect(procurementItem?.id).toBeTruthy();
      expect(vendorItem?.id).toBeTruthy();

      const designDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: 'Pack F 設計項目',
          size: 'W120 x H180 cm',
          material: 'PVC',
          quantity: '1 式',
          structure: '立牌',
          note: 'pack f design dispatch',
        },
      });
      const designTaskId = (await designDispatch.json()).taskId as string;

      const procurementDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'procurement',
          executionItemId: procurementItem!.id,
          title: 'Pack F 備品項目',
          quantity: '1 式',
          note: 'pack f procurement dispatch',
        },
      });
      const procurementTaskId = (await procurementDispatch.json()).taskId as string;

      const vendorDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'vendor',
          executionItemId: vendorItem!.id,
          title: 'Pack F 廠商項目',
          requirement: '安裝與撤場',
          amount: '18000',
          vendorName: VENDOR_NAME,
          note: 'pack f vendor dispatch',
        },
      });
      const vendorTaskId = (await vendorDispatch.json()).taskId as string;

      expect(designTaskId).toBeTruthy();
      expect(procurementTaskId).toBeTruthy();
      expect(vendorTaskId).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      await expect(page.getByText('Pack F 設計項目').first()).toBeVisible();
      await page.getByRole('button', { name: /專案備品 1/ }).click();
      await expect(page.getByText('Pack F 備品項目').first()).toBeVisible();
      await page.getByRole('button', { name: /專案廠商 1/ }).click();
      await expect(page.getByText('Pack F 廠商項目').first()).toBeVisible();

      await page.goto(`/design-tasks?project=${encodeURIComponent(created.project.id)}`);
      await expect(page.getByText('Pack F 設計項目').first()).toBeVisible();
      await page.goto(`/design-tasks/${designTaskId}`);
      await expect(page.getByText('Pack F 設計項目').first()).toBeVisible();

      await page.goto(`/procurement-tasks?project=${encodeURIComponent(created.project.id)}`);
      await expect(page.getByText('Pack F 備品項目').first()).toBeVisible();
      await page.goto(`/procurement-tasks/${procurementTaskId}`);
      await expect(page.getByText('Pack F 備品項目').first()).toBeVisible();

      await page.goto(`/vendor-assignments/${vendorTaskId}`);
      await expect(page.getByText('Pack F 廠商項目').first()).toBeVisible();
      await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();

      await page.goto(`/projects/${created.routeId}`);
      await page.reload();
      await expect(page.getByText('Pack F 設計項目').first()).toBeVisible();
      await page.getByRole('button', { name: /專案備品 1/ }).click();
      await expect(page.getByText('Pack F 備品項目').first()).toBeVisible();
      await page.getByRole('button', { name: /專案廠商 1/ }).click();
      await expect(page.getByText('Pack F 廠商項目').first()).toBeVisible();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
