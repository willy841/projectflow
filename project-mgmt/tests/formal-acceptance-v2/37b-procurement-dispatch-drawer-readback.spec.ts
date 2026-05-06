import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

test.describe.serial('formal acceptance v2 · procurement dispatch drawer readback', () => {
  test('procurement dispatch drawer retains saved fields after refresh and reopen', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `PROC-DRAWER-READBACK-${Date.now()}`,
      note: 'procurement dispatch drawer readback',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [{ title: '備品主線', children: [{ title: 'Readback 備品項目' }] }],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const procurementItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Readback 備品項目');
      expect(procurementItem?.id).toBeTruthy();

      const dispatchResponse = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'procurement',
          executionItemId: procurementItem!.id,
          title: '壓克力桌牌',
          assignee: 'Mina',
          item: '壓克力桌牌',
          quantity: '3',
          size: 'A4 直式',
          material: '透明壓克力',
          referenceUrl: 'https://example.com/proc',
          note: '備品需求備註',
        },
      });
      expect(dispatchResponse.ok()).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      await page.reload();

      await page.getByRole('button', { name: '展開主項目' }).first().click();
      const childRow = page.locator('h5', { hasText: 'Readback 備品項目' }).locator('xpath=ancestor::div[contains(@class,"relative")][1]');
      await childRow.getByRole('button', { name: '交辦' }).click();
      await page.getByRole('button', { name: '編輯備品' }).click();

      const drawer = page.locator('aside').filter({ has: page.getByRole('button', { name: '儲存備品交辦' }) });
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('textbox', { name: '負責人' })).toHaveValue('Mina');
      await expect(drawer.getByRole('textbox', { name: '項目' })).toHaveValue('壓克力桌牌');
      await expect(drawer.getByRole('textbox', { name: '數量' })).toHaveValue('3');
      await expect(drawer.getByRole('textbox', { name: '尺寸' })).toHaveValue('A4 直式');
      await expect(drawer.getByRole('textbox', { name: '材質' })).toHaveValue('透明壓克力');
      await expect(drawer.getByRole('textbox', { name: '參考連結' })).toHaveValue('https://example.com/proc');
      await expect(drawer.getByRole('textbox', { name: '需求說明' })).toHaveValue('備品需求備註');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
