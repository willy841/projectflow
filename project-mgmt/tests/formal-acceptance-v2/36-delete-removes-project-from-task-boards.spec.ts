import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · delete should remove project from task boards', () => {
  test('after deleting a project from /projects, design/procurement/vendor boards should no longer list that project', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `DELETE-BOARD-SYNC-${Date.now()}`,
      note: 'delete should remove project from task boards',
    });

    let projectId = created.project.id;

    try {
      const executionImport = await request.post(`/api/projects/${projectId}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: '板同步設計項目' }] },
            { title: '備品主線', children: [{ title: '板同步備品項目' }] },
            { title: '廠商主線', children: [{ title: '板同步廠商項目' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [projectId],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '板同步設計項目');
      const procurementItem = executionRows.find((row) => row.parent_id !== null && row.title === '板同步備品項目');
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === '板同步廠商項目');
      expect(designItem?.id).toBeTruthy();
      expect(procurementItem?.id).toBeTruthy();
      expect(vendorItem?.id).toBeTruthy();

      expect((await request.post(`/api/projects/${projectId}/dispatch`, { data: { flowType: 'design', executionItemId: designItem!.id, title: '板同步設計項目', size: 'A1', material: 'PVC', quantity: '1', structure: '立牌', note: 'board sync design' } })).ok()).toBeTruthy();
      expect((await request.post(`/api/projects/${projectId}/dispatch`, { data: { flowType: 'procurement', executionItemId: procurementItem!.id, title: '板同步備品項目', quantity: '1', note: 'board sync procurement' } })).ok()).toBeTruthy();
      expect((await request.post(`/api/projects/${projectId}/dispatch`, { data: { flowType: 'vendor', executionItemId: vendorItem!.id, title: '板同步廠商項目', requirement: '施工', amount: '1000', vendorName: VENDOR_NAME, note: 'board sync vendor' } })).ok()).toBeTruthy();

      await page.goto('/design-tasks');
      await expect(page.getByText(created.payload.name).first()).toBeVisible();
      await page.goto('/procurement-tasks');
      await expect(page.getByText(created.payload.name).first()).toBeVisible();
      await page.goto('/vendor-assignments');
      await expect(page.getByText(created.payload.name).first()).toBeVisible();

      const del = await request.delete(`/api/projects/${projectId}`, {
        data: { confirmProjectName: created.payload.name },
      });
      const delPayload = await del.json();
      expect(del.ok(), JSON.stringify(delPayload)).toBeTruthy();
      expect(delPayload.ok).toBeTruthy();

      await page.goto('/design-tasks');
      await expect(page.getByText(created.payload.name)).toHaveCount(0);
      await page.goto('/procurement-tasks');
      await expect(page.getByText(created.payload.name)).toHaveCount(0);
      await page.goto('/vendor-assignments');
      await expect(page.getByText(created.payload.name)).toHaveCount(0);

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
