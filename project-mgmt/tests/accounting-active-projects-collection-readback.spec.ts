import { expect, test } from '@playwright/test';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

test('accounting center active projects reads quote-cost collection truth', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto(`/quote-costs/${PROJECT_ID}`);
  await expect(page.getByText('收款管理')).toBeVisible();

  const projectName = (await page.locator('h2').first().textContent())?.trim() ?? '';
  const expectedReceivable = await page.locator('section').filter({ has: page.getByText('應收總金額') }).getByText(/\$/).first().textContent();
  const expectedCollected = await page.locator('section').filter({ has: page.getByText('已收款') }).getByText(/\$/).first().textContent();
  const expectedOutstanding = await page.locator('section').filter({ has: page.getByText('未收款') }).getByText(/\$/).first().textContent();

  await page.goto('/accounting-center');
  await page.getByRole('button', { name: '執行中專案' }).click();

  const row = page.getByRole('row', { name: new RegExp(projectName) });
  await expect(row).toContainText(expectedReceivable ?? '');
  await expect(row).toContainText(expectedCollected ?? '');
  await expect(row).toContainText(expectedOutstanding ?? '');

  await row.getByRole('link', { name: '查看詳情' }).click();
  await expect(page).toHaveURL(new RegExp(`/quote-costs/${PROJECT_ID}$`));
});
