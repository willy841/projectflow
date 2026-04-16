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

  test('execution item import persists imported main/child tree into formal DB', async ({ page, request }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收 Excel 匯入 ${Date.now()}`,
      note: 'formal acceptance execution item import',
    });

    try {
      const importResponse = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
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
      expect(importResponse.ok()).toBeTruthy();
      const importResult = await importResponse.json();
      expect(importResult.ok).toBeTruthy();
      expect(importResult.items).toHaveLength(2);

      const mainRows = await queryDb<{ title: string; parent_id: string | null; sort_order: number }>(
        `select title, parent_id, sort_order
         from project_execution_items
         where project_id = $1 and parent_id is null
         order by sort_order asc`,
        [created.project.id],
      );
      expect(mainRows.map((row) => row.title)).toEqual(['入口主視覺與導視', '贈品區陳列']);

      const childRows = await queryDb<{ title: string }>(
        `select child.title
         from project_execution_items child
         inner join project_execution_items parent on parent.id = child.parent_id
         where child.project_id = $1
         order by parent.sort_order asc, child.sort_order asc`,
        [created.project.id],
      );
      expect(childRows.map((row) => row.title)).toEqual(['入口背板輸出', '導視立牌製作', '陳列桌卡']);

      await page.goto(`/projects/${created.project.id}`);
      await expect(page.getByText('入口主視覺與導視').first()).toBeVisible();
      await page.getByRole('button', { name: '展開主項目' }).first().click();
      await expect(page.getByText('入口背板輸出').first()).toBeVisible();
      await expect(page.getByText('贈品區陳列').first()).toBeVisible();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
