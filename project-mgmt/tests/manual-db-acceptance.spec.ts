import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

function getDrawer(page: Page) {
  return page.getByRole('complementary').filter({
    has: page.getByLabel('關閉交辦抽屜'),
    hasText: '設計交辦',
  });
}

test.describe('Manual DB acceptance flow', () => {
  test('submit whole dispatch form and validate downstream path', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(`/projects/${PROJECT_ID}`);
    await expect(page.getByRole('heading', { name: '專案執行項目' })).toBeVisible();

    const firstExecutionItem = page.locator('[data-execution-item-id]').first();
    const mainTitle = 'POP 與價卡完稿';

    // open design drawer
    await firstExecutionItem.getByRole('button', { name: '交辦' }).click();
    await page.locator('button').filter({ hasText: /^編輯設計$/ }).last().click();

    const drawer = getDrawer(page);
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(`來源項目：${mainTitle}`)).toBeVisible();

    // fill whole form as a unit
    await drawer.getByRole('textbox', { name: '負責人' }).fill('DB Acceptance Dora');
    await drawer.getByRole('textbox', { name: '尺寸' }).fill('A1');
    await drawer.getByRole('textbox', { name: '材質 + 結構' }).fill('PVC+foam');
    await drawer.getByRole('textbox', { name: '數量' }).fill('2');
    await drawer.getByRole('textbox', { name: '參考連結' }).fill('https://example.com/design');
    await drawer.getByRole('textbox', { name: '設計內容 / 需求說明' }).fill('DB acceptance design note');

    // submit whole form
    await drawer.getByRole('button', { name: '儲存設計交辦' }).click();

    // front-end completion state
    await expect(page.getByLabel('關閉交辦抽屜')).toHaveCount(0, { timeout: 10000 });

    // reload and verify summary/downstream persistence on page
    await page.reload();
    const downstreamLink = page.getByRole('link', { name: /前往設計任務/ }).first();
    await expect(downstreamLink).toBeVisible();

    // downstream: design summary -> detail -> document
    await downstreamLink.click();
    await expect(page).toHaveURL(/\/design-tasks\//);

    await expect(page.getByRole('heading', { level: 2, name: mainTitle })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '原始任務資訊' })).toBeVisible();

    await page.getByRole('link', { name: '前往文件' }).click();
    await expect(page).toHaveURL(/\/design-tasks\/.*\/document$/);
    await expect(page.getByText('設計文件')).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '文件' })).toBeVisible();
  });
});
