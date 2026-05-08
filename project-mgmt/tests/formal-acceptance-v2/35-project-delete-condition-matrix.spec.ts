import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const VENDOR_NAME = '驗收廠商C';

function buildQuotationWorkbookBuffer() {
  const rows = [
    ['酷亞專案系統報價單'],
    ['商品名稱', '單價', '數量', '單位', '金額', '備註'],
    ['主背板輸出', '55000', '1', '式', '55000', '主輸出'],
    ['桌卡輸出', '10000', '1', '式', '10000', '桌卡'],
    ['總金額', '65000'],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '報價單');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

async function seedExecutionAndDispatch(request: Parameters<typeof test>[1]['request'], projectId: string) {
  const executionImport = await request.post(`/api/projects/${projectId}/execution-items/import`, {
    data: {
      items: [
        { title: '設計主線', children: [{ title: '條件矩陣設計項目' }] },
        { title: '備品主線', children: [{ title: '條件矩陣備品項目' }] },
        { title: '廠商主線', children: [{ title: '條件矩陣廠商項目' }] },
      ],
    },
  });
  expect(executionImport.ok()).toBeTruthy();

  const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
    `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
    [projectId],
  );
  const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '條件矩陣設計項目');
  const procurementItem = executionRows.find((row) => row.parent_id !== null && row.title === '條件矩陣備品項目');
  const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === '條件矩陣廠商項目');
  expect(designItem?.id).toBeTruthy();
  expect(procurementItem?.id).toBeTruthy();
  expect(vendorItem?.id).toBeTruthy();

  const designDispatch = await request.post(`/api/projects/${projectId}/dispatch`, {
    data: { flowType: 'design', executionItemId: designItem!.id, title: '條件矩陣設計項目', size: 'A1', material: 'PVC', quantity: '1', structure: '立牌', note: 'matrix design' },
  });
  const designTaskId = (await designDispatch.json()).taskId as string;

  const procurementDispatch = await request.post(`/api/projects/${projectId}/dispatch`, {
    data: { flowType: 'procurement', executionItemId: procurementItem!.id, title: '條件矩陣備品項目', quantity: '1', note: 'matrix procurement' },
  });
  const procurementTaskId = (await procurementDispatch.json()).taskId as string;

  const vendorDispatch = await request.post(`/api/projects/${projectId}/dispatch`, {
    data: { flowType: 'vendor', executionItemId: vendorItem!.id, title: '條件矩陣廠商項目', requirement: '施工', amount: '18000', vendorName: VENDOR_NAME, note: 'matrix vendor' },
  });
  const vendorTaskId = (await vendorDispatch.json()).taskId as string;

  return { designTaskId, procurementTaskId, vendorTaskId };
}

test.describe.serial('formal acceptance v2 · delete condition matrix', () => {
  test('delete remains a real delete across basic, with-family, and near-closeout project conditions', async ({ request }) => {
    const cases = [
      { label: 'basic', setup: async (_projectId: string) => {} },
      {
        label: 'with-family',
        setup: async (projectId: string) => {
          await seedExecutionAndDispatch(request, projectId);
        },
      },
      {
        label: 'near-closeout',
        setup: async (projectId: string) => {
          const { designTaskId, procurementTaskId, vendorTaskId } = await seedExecutionAndDispatch(request, projectId);

          const quotationImport = await request.post(`/api/financial-projects/${projectId}/quotation-import`, {
            multipart: {
              file: {
                name: 'matrix-quotation.xlsx',
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                buffer: buildQuotationWorkbookBuffer(),
              },
            },
          });
          expect(quotationImport.ok()).toBeTruthy();

          await request.post(`/api/design-tasks/${designTaskId}/sync-plans`, { data: { plans: [{ id: `d-${projectId}`, title: '條件矩陣設計項目', size: 'A1', material: 'PVC', structure: '立牌', quantity: '1', amount: '12000', previewUrl: 'https://example.com/d', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
          await request.post(`/api/design-tasks/${designTaskId}/confirm`);

          await request.post(`/api/procurement-tasks/${procurementTaskId}/sync-plans`, { data: { plans: [{ id: `p-${projectId}`, title: '條件矩陣備品項目', quantity: '1', amount: '11000', previewUrl: 'https://example.com/p', vendor: VENDOR_NAME, vendorId: VENDOR_ID }] } });
          await request.post(`/api/procurement-tasks/${procurementTaskId}/confirm`);

          await request.post(`/api/vendor-tasks/${vendorTaskId}/sync-plans`, { data: { plans: [{ id: `v-${projectId}`, title: '條件矩陣廠商項目', requirement: '施工', amount: '18000', vendorName: VENDOR_NAME }] } });
          await request.post(`/api/vendor-groups/${projectId}/${VENDOR_ID}/confirm`);

          await request.post(`/api/financial-projects/${projectId}/reconciliation-groups/sync`, {
            data: {
              groups: [
                { sourceType: '設計', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 12000, itemCount: 1 },
                { sourceType: '備品', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 11000, itemCount: 1 },
                { sourceType: '廠商', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳', amountTotal: 18000, itemCount: 1 },
              ],
            },
          });
          await request.post(`/api/accounting/projects/${projectId}/collections`, {
            data: { collectedOn: '2026-05-01', amount: 30000, note: 'matrix collection' },
          });
        },
      },
    ] as const;

    for (const testCase of cases) {
      const created = await createFormalAcceptanceTempProject(request, {
        name: `DELETE-MATRIX-${testCase.label}-${Date.now()}`,
        note: `delete condition matrix ${testCase.label}`,
      });
      let projectId = created.project.id;

      try {
        await testCase.setup(projectId);

        const before = await queryDb<{ status: string | null }>(`select status from projects where id = $1`, [projectId]);
        expect(before[0]?.status).not.toBe('已結案');

        const del = await request.delete(`/api/projects/${projectId}`, {
          data: { confirmProjectName: created.payload.name },
        });
        const payload = await del.json();
        expect(del.ok(), `${testCase.label}: ${JSON.stringify(payload)}`).toBeTruthy();
        expect(payload.ok).toBeTruthy();

        const after = await queryDb<{ count: number }>(`select count(*)::int as count from projects where id = $1`, [projectId]);
        expect(after[0]?.count, `${testCase.label} should really delete project row`).toBe(0);

        projectId = '';
      } finally {
        if (projectId) {
          await cleanupProjectById(projectId);
        }
      }
    }
  });
});
