import { expect, test } from '@playwright/test';
import {
  DESIGN_TASK_ID,
  PROJECT_ID,
  ensureFormalAcceptanceBaseline,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Design', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('design task detail and document stay on formal mainline', async ({ page }) => {
    await page.goto(`/design-tasks/${DESIGN_TASK_ID}`);
    await expect(page.getByRole('heading', { level: 2, name: 'POP 與價卡完稿' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '原始任務資訊' })).toBeVisible();
    await expect(page.getByRole('link', { name: '前往文件' })).toBeVisible();

    await page.goto(`/design-tasks/${DESIGN_TASK_ID}/document`);
    await expect(page.getByText('設計文件')).toBeVisible();
    await expect(page.getByRole('link', { name: '返回任務詳情' })).toBeVisible();

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText('POP / 價卡正式輸出方案').first()).toBeVisible();
  });
});
