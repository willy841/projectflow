import { expect, test } from '@playwright/test';
import {
  PROCUREMENT_TASK_ID,
  PROJECT_ID,
  ensureFormalAcceptanceBaseline,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Procurement', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('procurement task detail and document stay on formal mainline', async ({ page }) => {
    await page.goto(`/procurement-tasks/${PROCUREMENT_TASK_ID}`);
    await expect(page.getByRole('heading', { level: 2, name: '展示架五金與配件採購' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '原始任務資訊' })).toBeVisible();
    await expect(page.getByRole('link', { name: '前往文件' })).toBeVisible();

    await page.goto(`/procurement-tasks/${PROCUREMENT_TASK_ID}/document`);
    await expect(page.getByText('備品文件')).toBeVisible();
    await expect(page.getByRole('link', { name: '返回任務詳情' })).toBeVisible();

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText('展示架五金正式採購方案').first()).toBeVisible();
  });
});
