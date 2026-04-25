import { expect, test } from '@playwright/test';
import { ensureFormalAcceptanceBaseline, PROJECT_ID, PROJECT_NAME, PROJECT_ROUTE } from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Projects', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('projects list keeps active project in mainline list and routes to detail', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByRole('link', { name: /新增專案/ })).toBeVisible();
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();

    await page.goto(PROJECT_ROUTE);
    await expect(page).toHaveURL(new RegExp(`/projects/${PROJECT_ID}$`));
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
  });
});
