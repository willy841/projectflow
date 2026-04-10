import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function getDrawer(page: Page) {
  return page.getByRole('complementary').filter({
    has: page.getByLabel('關閉交辦抽屜'),
    hasText: '在不改變任務發布 workflow 的前提下，改由右側抽屜完成交辦編輯。',
  });
}

test('step1 main-item design dispatch completion state', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('/projects/department-store-display-2026');
  await expect(page.getByRole('heading', { name: '專案執行項目' })).toBeVisible();

  const firstExecutionItem = page.locator('[data-execution-item-id]').first();
  const mainTitle = 'POP 與價卡完稿';

  await firstExecutionItem.getByRole('button', { name: '交辦' }).click();
  await page.locator('button').filter({ hasText: /^設計$/ }).last().click();

  const drawer = getDrawer(page);
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('heading', { level: 3, name: mainTitle })).toBeVisible();

  await page.getByRole('textbox', { name: '負責人' }).first().fill('DB Acceptance Dora');
  await page.getByRole('textbox', { name: '尺寸' }).first().fill('A1');
  await page.getByRole('textbox', { name: '材質 + 結構' }).first().fill('PVC+foam');
  await page.getByRole('textbox', { name: '數量' }).first().fill('2');
  await page.getByRole('textbox', { name: '執行廠商（預設，可留空）' }).first().fill('Test Vendor');
  await page.getByRole('textbox', { name: '參考連結' }).first().fill('https://example.com/design');
  await page.getByRole('textbox', { name: '設計內容 / 需求說明' }).first().fill('DB acceptance design note');
  await page.getByRole('textbox', { name: '補充註記' }).first().fill('DB acceptance extra note');

  await drawer.getByRole('button', { name: '儲存設計交辦' }).click();

  await expect(page.getByLabel('關閉交辦抽屜')).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByText('已建立，摘要已更新')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: /專案設計.*目前檢視/ })).toBeVisible();
  await expect(firstExecutionItem).toContainText('已建立設計交辦', { timeout: 10000 });
});
