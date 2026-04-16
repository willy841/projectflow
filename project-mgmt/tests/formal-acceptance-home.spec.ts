import { expect, test } from '@playwright/test';
import { ensureFormalAcceptanceBaseline, PROJECT_NAME } from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Home', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('home overview shows active project and formal summary blocks', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/近期專案/)).toBeVisible();
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.getByText(/收款概況/)).toBeVisible();
    await expect(page.getByRole('link', { name: /新增專案/ })).toBeVisible();
  });
});
