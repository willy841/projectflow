import { expect, test } from '@playwright/test';

test.describe('Design task detail and document', () => {
  test('detail page loads and can navigate to document page', async ({ page }) => {
    await page.goto('/design-tasks/department-store-display-2026-0');

    await expect(page.getByText('設計任務詳情頁')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'POP 與價卡完稿' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '原始任務資訊' })).toBeVisible();
    await expect(page.getByRole('link', { name: '前往最終文件頁' })).toBeVisible();

    await page.getByRole('link', { name: '前往最終文件頁' }).click();

    await expect(page).toHaveURL(/\/design-tasks\/department-store-display-2026-0\/document$/);
    await expect(page.getByText('設計文件整理頁')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'POP 與價卡完稿' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '最終文件頁' })).toBeVisible();
    await expect(page.getByRole('link', { name: '返回任務詳情' })).toBeVisible();
  });
});
