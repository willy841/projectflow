import { expect, test } from '@playwright/test';
import { PROJECT_ID, PROJECT_NAME, PROJECT_ROUTE, ensureFormalAcceptanceBaseline } from './helpers';

test.describe.serial('formal acceptance v2 · phase 1 · project detail dispatch and family routing', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('project detail summaries route into the correct project family boards and task details', async ({ page }) => {
    await page.goto(PROJECT_ROUTE);

    await page.getByRole('button', { name: '專案設計' }).click();
    await expect(page.getByText('POP 與價卡完稿').first()).toBeVisible();
    const designDetailLink = page.getByRole('link', { name: '前往設計任務詳情' }).first();
    await expect(designDetailLink).toHaveAttribute('href', /\/design-tasks\/.+/);
    await designDetailLink.click();
    await expect(page).toHaveURL(/\/design-tasks\/.+/);
    await expect(page.getByRole('link', { name: '返回任務列表' })).toHaveAttribute(
      'href',
      `/design-tasks?project=${PROJECT_ID}`,
    );

    await page.goto(PROJECT_ROUTE);
    await page.getByRole('button', { name: '專案備品' }).click();
    await expect(page.getByText('展示架五金與配件採購').first()).toBeVisible();
    await page.getByRole('link', { name: '前往備品任務詳情' }).first().click();
    await expect(page).toHaveURL(/\/procurement-tasks\/.+/);
    await expect(page.getByRole('link', { name: '返回任務列表' })).toHaveAttribute(
      'href',
      `/procurement-tasks?project=${PROJECT_ID}`,
    );
  });

  test('vendor dispatch drawer uses vendor data trade family as source and filters vendors by selected trade', async ({ page }) => {
    await page.goto(PROJECT_ROUTE);
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();

    const firstExecutionItem = page.locator('[data-execution-item-id]').first();
    await firstExecutionItem.getByRole('button', { name: '交辦' }).click();
    await page.locator('button').filter({ hasText: /^廠商$/ }).last().click();

    const tradeSelect = page.getByLabel('類別 / 工種');
    const vendorInput = page.getByLabel('執行廠商');

    await expect
      .poll(async () => tradeSelect.locator('option').count())
      .toBeGreaterThan(1);

    const tradeOptionsText = (await tradeSelect.locator('option').allTextContents()).join(' | ');
    expect(tradeOptionsText).not.toContain('其他');
    expect(tradeOptionsText).toContain('輸出');

    await tradeSelect.selectOption({ label: '輸出' });
    await vendorInput.fill('阿');
    await expect(page.getByRole('button', { name: /阿周/ })).toBeVisible();
    await page.getByRole('button', { name: /阿周/ }).click();
    await expect(vendorInput).toHaveValue('阿周');

    await tradeSelect.selectOption({ index: 0 });
    await expect(vendorInput).toHaveValue('');
  });
});
