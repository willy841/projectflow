import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · phase 6 · project detail card sync after dispatch edit', () => {
  test('editing a dispatched item updates the task-view card on the same project detail page', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收同頁同步新案 ${Date.now()}`,
      note: 'same-page task card sync validation',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: '原始設計任務標題' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '原始設計任務標題');
      expect(designItem?.id).toBeTruthy();

      const dispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: '原始設計任務標題',
          size: 'W120 x H180 cm',
          material: 'PVC',
          quantity: '1 式',
          structure: '立牌',
          referenceUrl: 'https://example.com/design',
          note: '設計任務發布',
        },
      });
      expect(dispatch.ok()).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      await expect(page.getByText('原始設計任務標題').first()).toBeVisible();
      await expect(page.getByRole('button', { name: '專案設計' })).toBeVisible();

      const patch = await request.patch(`/api/projects/${created.project.id}/execution-items/${designItem!.id}`, {
        data: { title: '修改後設計任務標題' },
      });
      expect(patch.ok()).toBeTruthy();

      await page.reload();

      await expect(page.getByText('修改後設計任務標題').first()).toBeVisible();
      await expect(page.getByText('原始設計任務標題')).toHaveCount(0);
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
