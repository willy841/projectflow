import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

test.describe.serial('formal acceptance v2 · delete repro from projects list UI', () => {
  test('deleting from /projects UI actually removes project row from DB', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `DELETE-UI-REPRO-${Date.now()}`,
      note: 'delete repro from projects list ui',
    });

    let projectId = created.project.id;

    try {
      await page.goto('/projects');
      const row = page.locator('tr').filter({ has: page.getByRole('link', { name: created.payload.name }) }).first();
      await expect(row).toBeVisible();
      await row.getByRole('button', { name: '刪除' }).click();

      await expect(page.getByRole('heading', { name: '確認刪除專案' })).toBeVisible();
      await page.getByPlaceholder('輸入專案名稱').fill(created.payload.name);
      await page.getByRole('button', { name: '確認刪除專案' }).click();

      await expect(page.getByRole('link', { name: created.payload.name })).toHaveCount(0);

      const rows = await queryDb<{ count: number }>(`select count(*)::int as count from projects where id = $1`, [projectId]);
      expect(rows[0]?.count).toBe(0);
      projectId = '';
    } finally {
      if (projectId) {
        await cleanupProjectById(projectId);
      }
    }
  });
});
