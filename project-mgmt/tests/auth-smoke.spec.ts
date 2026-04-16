import { test, expect } from '@playwright/test';

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/projects');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: '登入 projectflow' })).toBeVisible();
});

test('forbidden page renders correctly', async ({ page }) => {
  await page.goto('/forbidden');
  await expect(page.getByRole('heading', { name: '你目前沒有權限進入這個區域' })).toBeVisible();
});
