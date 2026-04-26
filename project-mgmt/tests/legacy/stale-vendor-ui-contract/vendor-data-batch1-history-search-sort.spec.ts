import { test, expect } from '@playwright/test';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test('vendor history supports search and sort controls on DB detail page', async ({ page }) => {
  await page.goto(`${BASE_URL}/vendors/${VENDOR_ID}`);

  await expect(page.getByPlaceholder('搜尋專案名稱、摘要或發包內容')).toBeVisible();
  await expect(page.locator('select').first()).toHaveValue('project-asc');

  await page.getByPlaceholder('搜尋專案名稱、摘要或發包內容').fill('Projectflow 驗收測試專案');
  await expect(page.getByText('Projectflow 驗收測試專案').first()).toBeVisible();

  await page.getByPlaceholder('搜尋專案名稱、摘要或發包內容').fill('不存在的關鍵字');
  await expect(page.getByText('目前沒有符合條件的 DB 往來紀錄。')).toBeVisible();

  await page.getByPlaceholder('搜尋專案名稱、摘要或發包內容').fill('');
  await page.getByRole('combobox').selectOption('amount-desc');
  await expect(page.locator('select').first()).toHaveValue('amount-desc');
});
