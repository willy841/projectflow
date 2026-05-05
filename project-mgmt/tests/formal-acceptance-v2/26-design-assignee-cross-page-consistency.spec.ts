import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

test.describe.serial('formal acceptance v2 · pack B · design assignee cross-page consistency', () => {
  test('dispatching design with assignee stays consistent across project detail, design list, and design detail', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收設計負責人一致性 ${Date.now()}`,
      note: 'design assignee cross-page consistency',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: '設計負責人驗收項目' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '設計負責人驗收項目');
      expect(designItem?.id).toBeTruthy();

      const dispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: '設計負責人驗收項目',
          assignee: 'Design Owner QA',
          size: 'W120 x H180 cm',
          material: 'PVC',
          quantity: '1 式',
          structure: '立牌',
          referenceUrl: 'https://example.com/design-assignee',
          note: '設計負責人一致性驗收',
        },
      });
      expect(dispatch.ok()).toBeTruthy();
      const dispatchResult = await dispatch.json();
      const taskId = dispatchResult.taskId as string;
      expect(taskId).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      await expect(page.getByRole('link', { name: '前往設計任務詳情' })).toBeVisible();
      await expect(page.getByText('設計負責人驗收項目').first()).toBeVisible();

      await page.goto(`/design-tasks?project=${encodeURIComponent(created.project.id)}`);
      const row = page.locator('tr').filter({ has: page.getByText('設計負責人驗收項目') }).first();
      await expect(row).toContainText('Design Owner QA');

      await page.goto(`/design-tasks/${taskId}`);
      await expect(page.getByText('設計負責人', { exact: true })).toBeVisible();
      await expect(page.getByText('Design Owner QA').first()).toBeVisible();

      const taskRows = await queryDb<{ assignee: string | null }>(
        `select assignee from design_tasks where id = $1`,
        [taskId],
      );
      expect(taskRows[0]?.assignee).toBe('Design Owner QA');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
