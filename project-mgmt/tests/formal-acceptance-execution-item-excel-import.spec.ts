import { expect, test } from '@playwright/test';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  ensureFormalAcceptanceBaseline,
  queryDb,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Execution Item Excel Import', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('execution item import overwrites existing main/child tree instead of appending', async ({ page, request }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收 Excel 匯入 ${Date.now()}`,
      note: 'formal acceptance execution item import',
    });

    try {
      const firstImportResponse = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            {
              title: '入口主視覺與導視',
              children: [{ title: '入口背板輸出' }, { title: '導視立牌製作' }],
            },
            {
              title: '贈品區陳列',
              children: [{ title: '陳列桌卡' }],
            },
          ],
        },
      });
      expect(firstImportResponse.ok()).toBeTruthy();
      const firstImportResult = await firstImportResponse.json();
      expect(firstImportResult.ok).toBeTruthy();
      expect(firstImportResult.items).toHaveLength(2);

      const secondImportResponse = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            {
              title: '第二版主舞台輸出',
              children: [{ title: '第二版主背板' }],
            },
          ],
        },
      });
      expect(secondImportResponse.ok()).toBeTruthy();
      const secondImportResult = await secondImportResponse.json();
      expect(secondImportResult.ok).toBeTruthy();
      expect(secondImportResult.items).toHaveLength(1);

      const mainRows = await queryDb<{ title: string; parent_id: string | null; sort_order: number }>(
        `select title, parent_id, sort_order
         from project_execution_items
         where project_id = $1 and parent_id is null
         order by sort_order asc`,
        [created.project.id],
      );
      expect(mainRows.map((row) => row.title)).toEqual(['第二版主舞台輸出']);
      expect(mainRows.map((row) => row.sort_order)).toEqual([1]);

      const childRows = await queryDb<{ title: string }>(
        `select child.title
         from project_execution_items child
         inner join project_execution_items parent on parent.id = child.parent_id
         where child.project_id = $1
         order by parent.sort_order asc, child.sort_order asc`,
        [created.project.id],
      );
      expect(childRows.map((row) => row.title)).toEqual(['第二版主背板']);

      await page.goto(`/projects/${created.project.id}`);
      await expect(page.getByText('第二版主舞台輸出').first()).toBeVisible();
      await expect(page.getByText('入口主視覺與導視')).toHaveCount(0);
      await page.getByRole('button', { name: '展開主項目' }).first().click();
      await expect(page.getByText('第二版主背板').first()).toBeVisible();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
