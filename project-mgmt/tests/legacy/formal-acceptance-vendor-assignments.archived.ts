import { expect, test } from '@playwright/test';
import {
  VENDOR_GROUP_ID,
  VENDOR_NAME,
  ensureFormalAcceptanceBaseline,
  syncVendorPlanAndConfirm,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Vendor Assignments', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor group workbench reflects latest confirmed plan set', async ({ page, request }) => {
    const title = `正式驗收廠商發包 ${Date.now()}`;
    await syncVendorPlanAndConfirm(request, title, '正式驗收主線：含主體製作、現場安裝、拆除回收。');

    await page.goto(`/vendor-assignments/${VENDOR_GROUP_ID}`);
    await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
    await expect(page.locator(`input[value="${title}"]`)).toBeVisible();
  });
});
