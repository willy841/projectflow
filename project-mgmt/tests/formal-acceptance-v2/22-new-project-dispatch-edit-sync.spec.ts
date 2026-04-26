import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';

test.describe.serial('formal acceptance v2 · phase 6 · new project dispatch edit sync', () => {
  test('editing task title in execution/disptach layer syncs into downstream accepted board task', async ({ request }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收任務發布同步新案 ${Date.now()}`,
      note: 'dispatch edit sync validation',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            { title: '設計主線', children: [{ title: '原始設計任務標題' }] },
            { title: '備品主線', children: [{ title: '原始備品任務標題' }] },
            { title: '廠商主線', children: [{ title: '原始廠商任務標題' }] },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const childRows = executionRows.filter((row) => row.parent_id !== null);
      const designItem = childRows.find((row) => row.title === '原始設計任務標題')!;
      const procurementItem = childRows.find((row) => row.title === '原始備品任務標題')!;
      const vendorItem = childRows.find((row) => row.title === '原始廠商任務標題')!;

      const designDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: { flowType: 'design', executionItemId: designItem.id, title: '原始設計任務標題', size: 'W120 x H180 cm', material: 'PVC', quantity: '1 式', structure: '立牌', referenceUrl: 'https://example.com/design', note: '設計任務發布' },
      });
      const designTaskId = (await designDispatch.json()).taskId as string;

      const procurementDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: { flowType: 'procurement', executionItemId: procurementItem.id, title: '原始備品任務標題', quantity: '1 式', referenceUrl: 'https://example.com/procurement', note: '備品任務發布' },
      });
      const procurementTaskId = (await procurementDispatch.json()).taskId as string;

      const vendorDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: { flowType: 'vendor', executionItemId: vendorItem.id, title: '原始廠商任務標題', requirement: '施工與撤場', amount: '18000', vendorName: VENDOR_NAME, note: '廠商任務發布' },
      });
      const vendorTaskId = (await vendorDispatch.json()).taskId as string;

      const editDesign = await request.patch(`/api/projects/${created.project.id}/execution-items/${designItem.id}`, {
        data: { title: '修改後設計任務標題' },
      });
      expect(editDesign.ok()).toBeTruthy();
      const editProc = await request.patch(`/api/projects/${created.project.id}/execution-items/${procurementItem.id}`, {
        data: { title: '修改後備品任務標題' },
      });
      expect(editProc.ok()).toBeTruthy();
      const editVendor = await request.patch(`/api/projects/${created.project.id}/execution-items/${vendorItem.id}`, {
        data: { title: '修改後廠商任務標題' },
      });
      expect(editVendor.ok()).toBeTruthy();

      const taskRows = await queryDb<{
        flow: string;
        title: string;
      }>(
        `select 'design' as flow, title from design_tasks where id = $1
         union all
         select 'procurement' as flow, title from procurement_tasks where id = $2
         union all
         select 'vendor' as flow, title from vendor_tasks where id = $3`,
        [designTaskId, procurementTaskId, vendorTaskId],
      );

      expect(taskRows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ flow: 'design', title: '修改後設計任務標題' }),
          expect.objectContaining({ flow: 'procurement', title: '修改後備品任務標題' }),
          expect.objectContaining({ flow: 'vendor', title: '修改後廠商任務標題' }),
        ]),
      );

      await request.post(`/api/design-tasks/${designTaskId}/sync-plans`, {
        data: { plans: [{ id: `plan-design-sync-${created.project.id}`, title: '修改後設計任務標題', size: 'W120 x H180 cm', material: 'PVC', structure: '立牌', quantity: '1 式', amount: '12000', previewUrl: 'https://example.com/design/final', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] },
      });
      await request.post(`/api/design-tasks/${designTaskId}/confirm`);

      await request.post(`/api/procurement-tasks/${procurementTaskId}/sync-plans`, {
        data: { plans: [{ id: `plan-proc-sync-${created.project.id}`, title: '修改後備品任務標題', quantity: '1 式', amount: '11000', previewUrl: 'https://example.com/proc/final', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] },
      });
      await request.post(`/api/procurement-tasks/${procurementTaskId}/confirm`);

      await request.post(`/api/vendor-tasks/${vendorTaskId}/sync-plans`, {
        data: { plans: [{ id: `plan-vendor-sync-${created.project.id}`, title: '修改後廠商任務標題', requirement: '施工與撤場', amount: '18000', vendorName: VENDOR_NAME }] },
      });
      await request.post(`/api/vendor-groups/${created.project.id}/${VENDOR_ID}/confirm`);

      const latestTitles = await queryDb<{ flow_type: string; title: string | null }>(
        `select tc.flow_type, ts.payload_json->>'title' as title
         from task_confirmations tc
         inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
         where tc.project_id = $1
         order by tc.flow_type asc, tc.confirmation_no desc`,
        [created.project.id],
      );

      expect(latestTitles.some((row) => row.flow_type === 'design' && row.title === '修改後設計任務標題')).toBeTruthy();
      expect(latestTitles.some((row) => row.flow_type === 'procurement' && row.title === '修改後備品任務標題')).toBeTruthy();
      expect(latestTitles.some((row) => row.flow_type === 'vendor' && row.title === '修改後廠商任務標題')).toBeTruthy();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
