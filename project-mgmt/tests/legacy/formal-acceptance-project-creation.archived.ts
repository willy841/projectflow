import { expect, test } from '@playwright/test';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  ensureFormalAcceptanceBaseline,
  queryDb,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Project Creation', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('project creation persists to formal DB and is readable from projects/detail views', async ({ page, request }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收專案建立 ${Date.now()}`,
      note: 'formal acceptance project creation',
    });

    try {
      const rows = await queryDb<{
        id: string;
        name: string;
        client_name: string | null;
        status: string;
      }>(
        `select id, name, client_name, status from projects where id = $1`,
        [created.project.id],
      );

      expect(rows[0]?.id).toBe(created.project.id);
      expect(rows[0]?.name).toBe(created.payload.name);
      expect(rows[0]?.client_name).toBe(created.payload.client);
      expect(rows[0]?.status).toBe('執行中');

      await page.goto('/projects');
      await expect(page.getByText(created.payload.name).first()).toBeVisible();

      await page.goto(`/projects/${created.project.id}`);
      await expect(page.getByText(created.payload.name).first()).toBeVisible();
      await expect(page.getByText(created.payload.client).first()).toBeVisible();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
