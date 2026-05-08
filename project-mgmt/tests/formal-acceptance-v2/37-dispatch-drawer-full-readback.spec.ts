import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · dispatch drawer full readback', () => {
  test('design, procurement, and vendor dispatch drawers retain saved fields after refresh and reopen', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `DISPATCH-READBACK-${Date.now()}`,
      note: 'dispatch drawer full readback',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: 'Readback 設計項目' }] },
            { title: '備品主線', children: [{ title: 'Readback 備品項目' }] },
            { title: '廠商主線', children: [{ title: 'Readback 廠商項目' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Readback 設計項目');
      const procurementItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Readback 備品項目');
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Readback 廠商項目');
      expect(designItem?.id).toBeTruthy();
      expect(procurementItem?.id).toBeTruthy();
      expect(vendorItem?.id).toBeTruthy();

      expect((await request.post(`/api/projects/${created.project.id}/dispatch`, { data: {
        flowType: 'design', executionItemId: designItem!.id, title: 'Readback 設計項目', assignee: 'Aster', size: 'W240 x H300 cm', material: '珍珠板＋輸出＋木作結構', quantity: '1 式', referenceUrl: 'https://example.com/design', note: '設計需求備註'
      }})).ok()).toBeTruthy();

      expect((await request.post(`/api/projects/${created.project.id}/dispatch`, { data: {
        flowType: 'procurement', executionItemId: procurementItem!.id, title: 'Readback 備品項目', assignee: 'Mina', item: '壓克力桌牌', quantity: '3', size: 'A4 直式', material: '透明壓克力', referenceUrl: 'https://example.com/proc', note: '備品需求備註'
      }})).ok()).toBeTruthy();

      expect((await request.post(`/api/projects/${created.project.id}/dispatch`, { data: {
        flowType: 'vendor', executionItemId: vendorItem!.id, title: 'Readback 廠商項目', assignee: 'Dora', item: '木作', vendorName: VENDOR_NAME, requirement: '需確認施工方式', size: '木作包柱＋烤漆面', referenceUrl: 'https://example.com/vendor', amount: '120000'
      }})).ok()).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      await page.reload();

      await page.getByRole('button', { name: '展開主項目' }).nth(0).click();
      await page.locator('h5', { hasText: 'Readback 設計項目' }).locator('xpath=ancestor::div[contains(@class,"relative")][1]').getByRole('button', { name: '交辦' }).click();
      await page.getByRole('button', { name: '編輯設計' }).click();
      const designDrawer = page.locator('aside').filter({ has: page.getByRole('button', { name: '儲存設計交辦' }) });
      await expect(designDrawer).toBeVisible();
      await expect(designDrawer.getByRole('textbox').nth(0)).toHaveValue('Aster');
      await expect(designDrawer.getByRole('textbox').nth(1)).toHaveValue('W240 x H300 cm');
      await expect(designDrawer.getByRole('textbox').nth(2)).toHaveValue('珍珠板＋輸出＋木作結構');
      await expect(designDrawer.getByRole('textbox').nth(3)).toHaveValue('1 式');
      await expect(designDrawer.getByRole('textbox').nth(4)).toHaveValue('https://example.com/design');
      await expect(designDrawer.getByRole('textbox').nth(5)).toHaveValue('設計需求備註');

      await page.getByRole('button', { name: '取消' }).click();
      await page.getByRole('button', { name: '展開主項目' }).nth(1).click();
      await page.locator('h5', { hasText: 'Readback 備品項目' }).locator('xpath=ancestor::div[contains(@class,"relative")][1]').getByRole('button', { name: '交辦' }).click();
      await page.getByRole('button', { name: '編輯備品' }).click();
      const procurementDrawer = page.locator('aside').filter({ has: page.getByRole('button', { name: '儲存備品交辦' }) });
      await expect(procurementDrawer).toBeVisible();
      await expect(procurementDrawer.getByRole('textbox').nth(0)).toHaveValue('Mina');
      await expect(procurementDrawer.getByRole('textbox').nth(1)).toHaveValue('壓克力桌牌');
      await expect(procurementDrawer.getByRole('textbox').nth(2)).toHaveValue('3');
      await expect(procurementDrawer.getByRole('textbox').nth(3)).toHaveValue('A4 直式');
      await expect(procurementDrawer.getByRole('textbox').nth(4)).toHaveValue('透明壓克力');
      await expect(procurementDrawer.getByRole('textbox').nth(5)).toHaveValue('https://example.com/proc');
      await expect(procurementDrawer.getByRole('textbox').nth(6)).toHaveValue('備品需求備註');

      await page.getByRole('button', { name: '取消' }).click();
      await page.getByRole('button', { name: '展開主項目' }).nth(2).click();
      await page.locator('h5', { hasText: 'Readback 廠商項目' }).locator('xpath=ancestor::div[contains(@class,"relative")][1]').getByRole('button', { name: '交辦' }).click();
      await page.getByRole('button', { name: '編輯廠商' }).click();
      const vendorDrawer = page.locator('aside').filter({ has: page.getByRole('button', { name: '儲存廠商交辦' }) });
      await expect(vendorDrawer).toBeVisible();
      await expect(vendorDrawer.getByRole('textbox').nth(0)).toHaveValue('Dora');
      await expect(vendorDrawer.locator('select')).toHaveValue('木作');
      await expect(vendorDrawer.getByRole('textbox').nth(1)).toHaveValue('Readback 廠商項目');
      await expect(vendorDrawer.getByRole('textbox').nth(2)).toHaveValue(VENDOR_NAME);
      await expect(vendorDrawer.getByRole('textbox').nth(3)).toHaveValue('120000');
      await expect(vendorDrawer.getByRole('textbox').nth(4)).toHaveValue('木作包柱＋烤漆面');
      await expect(vendorDrawer.getByRole('textbox').nth(5)).toHaveValue('https://example.com/vendor');
      await expect(vendorDrawer.getByRole('textbox').nth(6)).toHaveValue('需確認施工方式');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
