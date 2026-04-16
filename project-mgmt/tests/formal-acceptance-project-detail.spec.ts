import { expect, test } from '@playwright/test';
import {
  ensureFormalAcceptanceBaseline,
  expectSnapshotVendorLinkage,
  DESIGN_CONFIRMATION_ID,
  PROCUREMENT_CONFIRMATION_ID,
  PROJECT_NAME,
  PROJECT_ROUTE,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Project Detail', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
    await expectSnapshotVendorLinkage(DESIGN_CONFIRMATION_ID);
    await expectSnapshotVendorLinkage(PROCUREMENT_CONFIRMATION_ID);
  });

  test('project detail keeps upstream shell and dispatched category summaries readable', async ({ page }) => {
    await page.goto(PROJECT_ROUTE);

    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.locator('[data-execution-item-id]').first()).toBeVisible();
    await expect(page.getByText(/專案設計|設計/).first()).toBeVisible();
    await expect(page.getByText(/專案備品|備品/).first()).toBeVisible();
    await expect(page.getByText(/專案廠商|廠商/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /設計|備品|廠商/ }).first()).toBeVisible();
  });
});
