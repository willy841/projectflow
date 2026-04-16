import { expect, test } from '@playwright/test';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  ensureFormalAcceptanceBaseline,
  queryDb,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Requirements CRUD', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('project requirements create update delete persist against formal DB', async ({ page, request }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收需求 CRUD ${Date.now()}`,
      note: 'formal acceptance requirements crud',
    });

    try {
      const createResponse = await request.post(`/api/projects/${created.project.id}/requirements`, {
        data: { title: '第一次需求溝通：主視覺方向與現場限制' },
      });
      expect(createResponse.ok()).toBeTruthy();
      const createResult = await createResponse.json();
      expect(createResult.ok).toBeTruthy();
      const requirementId = createResult.item.id as string;

      let rows = await queryDb<{ id: string; title: string }>(
        `select id, title from project_requirements where id = $1`,
        [requirementId],
      );
      expect(rows[0]?.title).toBe('第一次需求溝通：主視覺方向與現場限制');

      const updateResponse = await request.patch(`/api/project-requirements/${requirementId}`, {
        data: { title: '第二次需求溝通：主視覺方向、現場限制與輸出節點' },
      });
      expect(updateResponse.ok()).toBeTruthy();
      const updateResult = await updateResponse.json();
      expect(updateResult.ok).toBeTruthy();

      rows = await queryDb<{ id: string; title: string }>(
        `select id, title from project_requirements where id = $1`,
        [requirementId],
      );
      expect(rows[0]?.title).toBe('第二次需求溝通：主視覺方向、現場限制與輸出節點');

      await page.goto(`/projects/${created.project.id}`);
      await expect(page.getByText('第二次需求溝通：主視覺方向、現場限制與輸出節點').first()).toBeVisible();

      const deleteResponse = await request.delete(`/api/project-requirements/${requirementId}`);
      expect(deleteResponse.ok()).toBeTruthy();
      const deleteResult = await deleteResponse.json();
      expect(deleteResult.ok).toBeTruthy();

      const deletedRows = await queryDb<{ id: string }>(
        `select id from project_requirements where id = $1`,
        [requirementId],
      );
      expect(deletedRows).toHaveLength(0);

      await page.goto(`/projects/${created.project.id}`);
      await expect(page.getByText('第二次需求溝通：主視覺方向、現場限制與輸出節點')).toHaveCount(0);
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
