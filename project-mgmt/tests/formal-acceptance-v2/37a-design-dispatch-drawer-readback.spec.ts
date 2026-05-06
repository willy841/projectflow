import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

test.describe.serial('formal acceptance v2 · design dispatch drawer readback', () => {
  test('design dispatch drawer retains saved fields after refresh and reopen', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `DESIGN-DRAWER-READBACK-${Date.now()}`,
      note: 'design dispatch drawer readback',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [{ title: '設計主線', children: [{ title: 'Readback 設計項目' }] }],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Readback 設計項目');
      expect(designItem?.id).toBeTruthy();

      const dispatchResponse = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: 'Readback 設計項目',
          assignee: 'Aster',
          size: 'W240 x H300 cm',
          material: '珍珠板＋輸出＋木作結構',
          quantity: '1 式',
          referenceUrl: 'https://example.com/design',
          note: '設計需求備註',
        },
      });
      expect(dispatchResponse.ok()).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      await page.reload();

      await page.getByRole('button', { name: '展開主項目' }).first().click();
      const childRow = page.locator('h5', { hasText: 'Readback 設計項目' }).locator('xpath=ancestor::div[contains(@class,"relative")][1]');
      await childRow.getByRole('button', { name: '交辦' }).click();
      await page.getByRole('button', { name: '編輯設計' }).click();

      const drawer = page.locator('aside').filter({ has: page.getByRole('button', { name: '儲存設計交辦' }) });
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('textbox', { name: '設計負責人' })).toHaveValue('Aster');
      await expect(drawer.getByRole('textbox', { name: '尺寸' })).toHaveValue('W240 x H300 cm');
      await expect(drawer.getByRole('textbox', { name: '材質 + 結構' })).toHaveValue('珍珠板＋輸出＋木作結構');
      await expect(drawer.getByRole('textbox', { name: '數量' })).toHaveValue('1 式');
      await expect(drawer.getByRole('textbox', { name: '參考連結' })).toHaveValue('https://example.com/design');
      await expect(drawer.getByRole('textbox', { name: '設計內容 / 需求說明' })).toHaveValue('設計需求備註');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
