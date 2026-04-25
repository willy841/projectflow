import { expect, test } from '@playwright/test';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  ensureFormalAcceptanceBaseline,
  PROJECT_NAME,
  queryDb,
} from './formal-acceptance-helpers';

const TEMP_PROJECT_PREFIX = '正式驗收列表測試';

test.describe.serial('formal acceptance · Project list sorting / filtering / pagination', () => {
  const createdProjectIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    await ensureFormalAcceptanceBaseline();

    for (let index = 0; index < 11; index += 1) {
      const created = await createFormalAcceptanceTempProject(request, {
        name: `${TEMP_PROJECT_PREFIX} ${String(index + 1).padStart(2, '0')}`,
        eventDate: `2026-06-${String(index + 1).padStart(2, '0')}`,
        note: 'formal acceptance project list sorting filtering pagination',
      });
      createdProjectIds.push(created.project.id);

      if (index === 0) {
        await queryDb('update projects set status = $2 where id = $1', [created.project.id, '待發包']);
      }
    }
  });

  test.afterAll(async () => {
    for (const projectId of createdProjectIds) {
      await cleanupProjectById(projectId);
    }
  });

  test('projects list supports keyword filter, date sorting, status filter and pagination', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByText('第 1 / 2 頁').first()).toBeVisible();
    await expect(page.getByRole('button', { name: '下一頁' })).toBeEnabled();
    await expect(page.getByText(`${TEMP_PROJECT_PREFIX} 11`)).toBeVisible();

    await page.getByRole('button', { name: '下一頁' }).click();
    await expect(page.getByText('第 2 / 2 頁').first()).toBeVisible();
    await expect(page.getByText(PROJECT_NAME)).toBeVisible();

    await page.getByRole('button', { name: '上一頁' }).click();
    await expect(page.getByText('第 1 / 2 頁').first()).toBeVisible();

    const sortButton = page.getByRole('button', { name: /活動日期/ });
    await expect(sortButton).toContainText('↓ 最新');
    await sortButton.click();
    await expect(sortButton).toContainText('↑ 最舊');

    const firstProjectLink = page.locator('tbody tr').first().getByRole('link');
    await expect(firstProjectLink).toContainText(PROJECT_NAME);

    const searchInput = page.getByPlaceholder('搜尋專案 / 客戶 / 地點');
    await searchInput.fill(`${TEMP_PROJECT_PREFIX} 11`);
    await expect(page.getByText('第 1 / 1 頁').first()).toBeVisible();
    await expect(page.getByText(`${TEMP_PROJECT_PREFIX} 11`)).toBeVisible();
    await expect(page.getByText(PROJECT_NAME)).not.toBeVisible();

    await searchInput.fill('');
    await page.getByRole('button', { name: '待發包' }).click();
    await expect(page.getByText('第 1 / 1 頁').first()).toBeVisible();
    await expect(page.getByRole('link', { name: `${TEMP_PROJECT_PREFIX} 01` })).toBeVisible();
    await expect(page.getByText(`${TEMP_PROJECT_PREFIX} 11`)).not.toBeVisible();

    await page.getByRole('button', { name: '全部' }).click();
    await expect(page.getByText('第 1 / 2 頁').first()).toBeVisible();
  });
});
