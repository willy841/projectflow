import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · vendor dispatch drawer readback', () => {
  test('vendor dispatch drawer retains saved fields after refresh and reopen', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `VENDOR-DRAWER-READBACK-${Date.now()}`,
      note: 'vendor dispatch drawer readback',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [{ title: '廠商主線', children: [{ title: 'Readback 廠商項目' }] }],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Readback 廠商項目');
      expect(vendorItem?.id).toBeTruthy();

      const dispatchResponse = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'vendor',
          executionItemId: vendorItem!.id,
          title: 'Readback 廠商項目',
          assignee: 'Dora',
          item: '施工',
          vendorName: VENDOR_NAME,
          requirement: '需確認施工方式',
          size: '木作包柱＋烤漆面',
          referenceUrl: 'https://example.com/vendor',
          amount: '120000',
        },
      });
      expect(dispatchResponse.ok()).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      await page.reload();

      await page.getByRole('button', { name: '展開主項目' }).first().click();
      const childRow = page.locator('h5', { hasText: 'Readback 廠商項目' }).locator('xpath=ancestor::div[contains(@class,"relative")][1]');
      await childRow.getByRole('button', { name: '交辦' }).click();
      await page.getByRole('button', { name: '編輯廠商' }).click();

      const drawer = page.locator('aside').filter({ has: page.getByRole('button', { name: '儲存廠商交辦' }) });
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('textbox', { name: '負責人' })).toHaveValue('Dora');
      await expect(drawer.getByRole('combobox', { name: '類別 / 工種' })).toHaveValue('施工');
      await expect(drawer.getByRole('textbox', { name: '項目' })).toHaveValue('Readback 廠商項目');
      await expect(drawer.getByRole('textbox', { name: /執行廠商/ })).toHaveValue(VENDOR_NAME);
      await expect(drawer.getByRole('textbox', { name: '廠商報價' })).toHaveValue('120000');
      await expect(drawer.getByRole('textbox', { name: '規格 / 尺寸' })).toHaveValue('木作包柱＋烤漆面');
      await expect(drawer.getByRole('textbox', { name: '參考連結 / 參考資料' })).toHaveValue('https://example.com/vendor');
      await expect(drawer.getByRole('textbox', { name: '需求說明' })).toHaveValue('需確認施工方式');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
