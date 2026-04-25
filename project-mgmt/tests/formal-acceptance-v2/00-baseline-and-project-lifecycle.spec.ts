import { expect, test } from '@playwright/test';
import {
  DESIGN_TASK_ID,
  PROCUREMENT_TASK_ID,
  PROJECT_ID,
  PROJECT_NAME,
  PROJECT_ROUTE,
  ensureFormalAcceptanceBaseline,
  expectProjectVisibleInActiveViews,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 0 · baseline and project lifecycle', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('baseline sample remains visible from home, projects, and project detail mainline', async ({ page }) => {
    await expectProjectVisibleInActiveViews(page);

    await page.goto(PROJECT_ROUTE);
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.locator('[data-execution-item-id]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: '專案設計' })).toBeVisible();
    await expect(page.getByRole('button', { name: '專案備品' })).toBeVisible();
    await expect(page.getByRole('button', { name: '專案廠商' })).toBeVisible();
  });

  test('design and procurement task detail pages route to project-level documents, not task-level mainline', async ({ page }) => {
    await page.goto(`/design-tasks/${DESIGN_TASK_ID}`);
    await expect(page.getByRole('link', { name: '前往文件' })).toHaveAttribute(
      'href',
      `/projects/${PROJECT_ID}/design-document`,
    );
    await expect(page.getByRole('link', { name: '返回任務列表' })).toHaveAttribute(
      'href',
      `/design-tasks?project=${PROJECT_ID}`,
    );

    await page.goto(`/procurement-tasks/${PROCUREMENT_TASK_ID}`);
    await expect(page.getByRole('link', { name: '前往文件' })).toHaveAttribute(
      'href',
      `/projects/${PROJECT_ID}/procurement-document`,
    );
    await expect(page.getByRole('link', { name: '返回任務列表' })).toHaveAttribute(
      'href',
      `/procurement-tasks?project=${PROJECT_ID}`,
    );
  });
});
