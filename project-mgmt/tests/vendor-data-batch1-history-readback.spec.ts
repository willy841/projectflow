import { test, expect } from '@playwright/test';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test('vendor history/detail readback shows project-level ledger and expandable source details', async ({ page }) => {
  await page.goto(`${BASE_URL}/vendors/${VENDOR_ID}`);

  await expect(page.getByRole('heading', { name: '付款紀錄' })).toBeVisible();
  await expect(page.getByText('Projectflow 驗收測試專案').first()).toBeVisible();
  await expect(page.getByText('目前應付 / 未付款')).toBeVisible();
  await page.getByRole('button', { name: '查看明細' }).first().click();
  await expect(page.getByText('成本明細')).toBeVisible();
  await expect(page.getByText('發包內容明細')).toBeVisible();
  await expect(page.getByText(/廠商｜|設計｜|備品｜/).first()).toBeVisible();
});
