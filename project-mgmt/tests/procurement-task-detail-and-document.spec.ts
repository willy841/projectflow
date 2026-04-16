// LEGACY / DEPRECATED: 舊正式驗收拆分腳本；已由 formal-acceptance-mainline.spec.ts 接手正式主線。
// 保留作局部回歸參考，不再視為正式 blocker。
import { expect, test } from '@playwright/test';

const PROCUREMENT_TASK_ID = '33333333-3333-4333-8333-333333333334';

test.describe('Procurement task detail and document', () => {
  test('detail page loads and can navigate to document page', async ({ page }) => {
    await page.goto(`/procurement-tasks/${PROCUREMENT_TASK_ID}`);

    await expect(page.getByRole('heading', { level: 2, name: '展示架五金與配件採購' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '原始任務資訊' })).toBeVisible();
    await expect(page.getByRole('link', { name: '前往文件' })).toBeVisible();

    await page.getByRole('link', { name: '前往文件' }).click();

    await expect(page).toHaveURL(new RegExp(`/procurement-tasks/${PROCUREMENT_TASK_ID}/document$`));
    await expect(page.getByRole('heading', { level: 2, name: '展示架五金與配件採購' })).toBeVisible();
    await expect(page.getByText('備品文件')).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '文件' })).toBeVisible();
    await expect(page.getByRole('link', { name: '返回任務詳情' })).toBeVisible();
  });
});
