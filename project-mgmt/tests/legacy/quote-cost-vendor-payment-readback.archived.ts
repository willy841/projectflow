import { expect, test } from '@playwright/test';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

test('quote-cost detail reads vendor payable/payment status', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto(`/quote-costs/${PROJECT_ID}`);
  await expect(page.getByText('廠商付款狀態')).toBeVisible();

  const row = page.getByRole('row', { name: /驗收廠商C/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText(/未付款|部分付款|已付款/);

  const cells = await row.locator('td').allTextContents();
  expect(cells.length).toBeGreaterThanOrEqual(5);
});
