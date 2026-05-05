import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

test.describe.serial('formal acceptance v2 · delete repro', () => {
  test('deleting a live project should delete project row and cascade family data', async ({ request }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `DELETE-REPRO-${Date.now()}`,
      note: 'delete repro cascade validation',
    });

    let projectId = created.project.id;

    try {
      const executionImport = await request.post(`/api/projects/${projectId}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: '刪除重演設計項目' }] },
            { title: '備品主線', children: [{ title: '刪除重演備品項目' }] },
            { title: '廠商主線', children: [{ title: '刪除重演廠商項目' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [projectId],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '刪除重演設計項目');
      const procurementItem = executionRows.find((row) => row.parent_id !== null && row.title === '刪除重演備品項目');
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === '刪除重演廠商項目');
      expect(designItem?.id).toBeTruthy();
      expect(procurementItem?.id).toBeTruthy();
      expect(vendorItem?.id).toBeTruthy();

      expect((await request.post(`/api/projects/${projectId}/dispatch`, { data: { flowType: 'design', executionItemId: designItem!.id, title: '刪除重演設計項目', size: 'A1', material: 'PVC', quantity: '1', structure: '立牌', note: 'delete repro design' } })).ok()).toBeTruthy();
      expect((await request.post(`/api/projects/${projectId}/dispatch`, { data: { flowType: 'procurement', executionItemId: procurementItem!.id, title: '刪除重演備品項目', quantity: '1', note: 'delete repro procurement' } })).ok()).toBeTruthy();
      expect((await request.post(`/api/projects/${projectId}/dispatch`, { data: { flowType: 'vendor', executionItemId: vendorItem!.id, title: '刪除重演廠商項目', requirement: '施工', amount: '1000', vendorName: '驗收廠商C', note: 'delete repro vendor' } })).ok()).toBeTruthy();

      const before = await queryDb<{ project_count: number; design_count: number; procurement_count: number; vendor_count: number }>(
        `select
          (select count(*)::int from projects where id = $1) as project_count,
          (select count(*)::int from design_tasks where project_id = $1) as design_count,
          (select count(*)::int from procurement_tasks where project_id = $1) as procurement_count,
          (select count(*)::int from vendor_tasks where project_id = $1) as vendor_count`,
        [projectId],
      );
      expect(before[0]?.project_count).toBe(1);
      expect((before[0]?.design_count ?? 0) > 0).toBeTruthy();
      expect((before[0]?.procurement_count ?? 0) > 0).toBeTruthy();
      expect((before[0]?.vendor_count ?? 0) > 0).toBeTruthy();

      const del = await request.delete(`/api/projects/${projectId}`, {
        data: { confirmProjectName: created.payload.name },
      });
      const delJson = await del.json();
      expect(del.ok(), JSON.stringify(delJson)).toBeTruthy();
      expect(delJson.ok).toBeTruthy();

      const after = await queryDb<{ project_count: number; design_count: number; procurement_count: number; vendor_count: number }>(
        `select
          (select count(*)::int from projects where id = $1) as project_count,
          (select count(*)::int from design_tasks where project_id = $1) as design_count,
          (select count(*)::int from procurement_tasks where project_id = $1) as procurement_count,
          (select count(*)::int from vendor_tasks where project_id = $1) as vendor_count`,
        [projectId],
      );
      expect(after[0]?.project_count).toBe(0);
      expect(after[0]?.design_count).toBe(0);
      expect(after[0]?.procurement_count).toBe(0);
      expect(after[0]?.vendor_count).toBe(0);

      projectId = '';
    } finally {
      if (projectId) {
        await cleanupProjectById(projectId);
      }
    }
  });
});
