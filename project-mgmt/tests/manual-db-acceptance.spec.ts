import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function getDrawer(page: Page) {
  return page.getByRole('complementary').filter({
    has: page.getByLabel('關閉交辦抽屜'),
    hasText: '在不改變任務發布 workflow 的前提下，改由右側抽屜完成交辦編輯。',
  });
}

test.describe('Manual DB acceptance flow', () => {
  test('submit whole dispatch form and validate downstream path', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto('/projects/department-store-display-2026');
    await expect(page.getByRole('heading', { name: '專案執行項目' })).toBeVisible();

    const firstExecutionItem = page.locator('[data-execution-item-id]').first();
    const mainTitle = 'POP 與價卡完稿';

    // open design drawer
    await firstExecutionItem.getByRole('button', { name: '交辦' }).click();
    await page.locator('button').filter({ hasText: /^設計$/ }).last().click();

    const drawer = getDrawer(page);
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading', { level: 3, name: mainTitle })).toBeVisible();

    // fill whole form as a unit
    await page.getByRole('textbox', { name: '負責人' }).first().fill('DB Acceptance Dora');
    await page.getByRole('textbox', { name: '尺寸' }).first().fill('A1');
    await page.getByRole('textbox', { name: '材質 + 結構' }).first().fill('PVC+foam');
    await page.getByRole('textbox', { name: '數量' }).first().fill('2');
    await page.getByRole('textbox', { name: '執行廠商（預設，可留空）' }).first().fill('Test Vendor');
    await page.getByRole('textbox', { name: '參考連結' }).first().fill('https://example.com/design');
    await page.getByRole('textbox', { name: '設計內容 / 需求說明' }).first().fill('DB acceptance design note');
    await page.getByRole('textbox', { name: '補充註記' }).first().fill('DB acceptance extra note');

    // submit whole form
    await drawer.getByRole('button', { name: '儲存設計交辦' }).click();

    // front-end completion state
    await expect(page.getByLabel('關閉交辦抽屜')).toHaveCount(0, { timeout: 10000 });
    await expect(firstExecutionItem).toContainText('已建立設計交辦', { timeout: 10000 });

    // reload and verify summary/downstream persistence on page
    await page.reload();
    await expect(page.getByRole('button', { name: /專案設計.*目前檢視/ })).toBeVisible();
    await expect(page.getByRole('link', { name: '前往設計任務板' }).first()).toBeVisible();

    // downstream: design board -> detail -> document
    await page.getByRole('link', { name: '前往設計任務板' }).first().click();
    await expect(page).toHaveURL(/\/design-tasks\?project=department-store-display-2026/);

    const firstTaskLink = page.getByRole('link', { name: '查看任務' }).first();
    await expect(firstTaskLink).toBeVisible();
    await firstTaskLink.click();

    await expect(page.getByText('設計任務詳情頁')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: mainTitle })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '原始任務資訊' })).toBeVisible();

    await page.getByRole('link', { name: '前往最終文件頁' }).click();
    await expect(page.getByText('設計文件整理頁')).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '最終文件頁' })).toBeVisible();
  });
});
