import { expect, test } from '@playwright/test';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  queryDb,
} from '../formal-acceptance-helpers';

test.describe.serial('formal acceptance v2 · phase 6 · new project end-to-end spot check', () => {
  test('creates a fresh project and verifies upstream project mainline is operable', async ({ page, request }) => {
    const created = await createFormalAcceptanceTempProject(request);

    try {
      await page.goto('/projects');
      await expect(page.getByText(created.project.name).first()).toBeVisible();

      await page.goto(`/projects/${created.routeId}`);
      await expect(page.getByText(created.project.name).first()).toBeVisible();
      await expect(page.getByRole('button', { name: '專案設計' })).toBeVisible();
      await expect(page.getByRole('button', { name: '專案備品' })).toBeVisible();
      await expect(page.getByRole('button', { name: '專案廠商' })).toBeVisible();

      const dbRows = await queryDb<{
        id: string;
        name: string;
        status: string | null;
        client_name: string | null;
      }>(
        `select id, name, status, client_name from projects where id = $1`,
        [created.project.id],
      );

      expect(dbRows[0]?.id).toBe(created.project.id);
      expect(dbRows[0]?.name).toBe(created.project.name);
      expect(dbRows[0]?.client_name).toBe(created.payload.client);
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
