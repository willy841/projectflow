import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  ensureFormalAcceptanceBaseline,
} from './formal-acceptance-helpers';

test.describe.serial('quote-cost top quote card UI', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('top-left quote card shows import/detail actions and detail modal still opens after import-backed state', async ({ page }) => {
    await page.goto(`/quote-costs/${PROJECT_ID}`);

    const quoteCard = page.locator('article').filter({ has: page.getByText('對外報價單') }).first();
    const receivableCard = page.locator('article').filter({ has: page.getByText('應收總金額') }).first();

    await expect(quoteCard.getByText('對外報價單')).toBeVisible();
    await expect(quoteCard.getByRole('button', { name: '匯入' })).toBeVisible();
    await expect(quoteCard.getByRole('button', { name: '明細' })).toBeVisible();

    const quoteValue = (await quoteCard.locator('p').nth(1).textContent())?.trim();
    const receivableValue = (await receivableCard.locator('p').nth(1).textContent())?.trim();
    expect(quoteValue).toBeTruthy();
    expect(quoteValue).toBe(receivableValue);

    await quoteCard.getByRole('button', { name: '明細' }).click();
    const detailModal = page.getByRole('heading', { name: '對外報價單明細' });
    await expect(detailModal).toBeVisible();
    await expect(page.getByText('目前版本：').first()).toBeVisible();
    await expect(page.getByText(`總金額 ${String(quoteValue)}`).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '商品名稱' })).toBeVisible();
    await page.getByRole('button', { name: '關閉' }).click();
    await expect(page.getByRole('heading', { name: '對外報價單明細' })).toHaveCount(0);
  });
});
