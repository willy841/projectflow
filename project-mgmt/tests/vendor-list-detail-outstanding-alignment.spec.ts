import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  VENDOR_ID,
  VENDOR_NAME,
  ensureFormalAcceptanceBaseline,
} from './formal-acceptance-helpers';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe.serial('vendor list/detail outstanding alignment', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor list outstanding total matches vendor detail unpaid total', async ({ page }) => {
    await page.goto('/vendors');

    const vendorLink = page.getByRole('link', { name: VENDOR_NAME });
    await expect(vendorLink).toBeVisible();
    const vendorCard = vendorLink.locator('xpath=ancestor::div[contains(@class,"pf-card")][1]');
    const listAmount = (await vendorCard.locator('p.text-3xl').textContent())?.trim();
    expect(listAmount).toBeTruthy();

    await page.goto(`/vendors/${VENDOR_ID}`);
    await expect(page.getByText('• 未付款專案')).toBeVisible();

    const summaryText = await page.getByText(/待付款 .*未付款總額 \$[\d,]+/).first().textContent();
    const detailAmountMatch = summaryText?.match(/\$[\d,]+/g) ?? [];
    expect(detailAmountMatch.length).toBeGreaterThan(0);
    const detailAmount = detailAmountMatch[detailAmountMatch.length - 1];

    expect(listAmount).toBe(detailAmount);
  });
});
