import { expect, test } from '@playwright/test';
import {
  VENDOR_NAME,
  VENDOR_PACKAGE_ID,
  ensureFormalAcceptanceBaseline,
  syncVendorPlanAndConfirm,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Vendor Packages', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor package detail reads latest confirmed package payload', async ({ page, request }) => {
    const title = `正式驗收 package ${Date.now()}`;
    await syncVendorPlanAndConfirm(request, title, '正式驗收 package payload：含發包項目整理與文件承接。');

    await page.goto(`/vendor-packages/${VENDOR_PACKAGE_ID}`);
    await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
    await expect(page.locator(`input[value="${title}"]`)).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '發包項目整理' })).toBeVisible();
  });
});
