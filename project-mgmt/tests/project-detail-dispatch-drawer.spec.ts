// LEGACY / DEPRECATED: 舊正式驗收拆分腳本；已由 formal-acceptance-mainline.spec.ts 接手正式主線。
// 保留作局部回歸參考，不再視為正式 blocker。
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

function getDrawer(page: Page) {
  return page.locator('div').filter({
    has: page.getByLabel('關閉交辦抽屜'),
    hasText: '在不改變任務發布 workflow 的前提下，改由右側抽屜完成交辦編輯。',
  }).last();
}

test.describe('Project Detail dispatch drawer', () => {
  test('main item can open design drawer', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}`);

    const firstExecutionItem = page.locator('[data-execution-item-id]').first();
    const mainTitle = (await firstExecutionItem.getByRole('heading', { level: 4 }).textContent())?.trim() ?? '';

    await firstExecutionItem.getByRole('button', { name: '交辦' }).click();
    const designMenuItem = page.locator('button').filter({ hasText: /^設計$/ }).last();
    await expect(designMenuItem).toBeVisible();
    await designMenuItem.click();

    const drawer = getDrawer(page);
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('設計交辦')).toBeVisible();
    await expect(drawer.getByRole('heading', { level: 3, name: mainTitle })).toBeVisible();
  });

  test('first execution item can expand and show child content', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}`);

    const firstExecutionItem = page.locator('[data-execution-item-id]').first();
    const expandButton = firstExecutionItem.getByRole('button', { name: /展開主項目|收合主項目/ });
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    await expect(firstExecutionItem.getByText('次項目', { exact: true })).toBeVisible();
    await expect(firstExecutionItem.getByText('價卡尺寸整理')).toBeVisible();
  });

  test('child item can open procurement drawer after expand', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}`);

    const firstExecutionItem = page.locator('[data-execution-item-id]').first();
    const expandButton = firstExecutionItem.getByRole('button', { name: /展開主項目|收合主項目/ });
    await expandButton.click();

    const childTitle = '價卡尺寸整理';
    const childTitleText = firstExecutionItem.getByText(childTitle);
    await expect(childTitleText).toBeVisible();

    const childCard = childTitleText.locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
    await childCard.getByRole('button', { name: '交辦' }).click();

    const procurementMenuItem = page.locator('button').filter({ hasText: /^備品$/ }).last();
    await expect(procurementMenuItem).toBeVisible();
    await procurementMenuItem.click();

    const drawer = getDrawer(page);
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('備品交辦')).toBeVisible();
    await expect(drawer.getByRole('heading', { level: 3, name: childTitle })).toBeVisible();
  });
});
