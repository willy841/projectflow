import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  VENDOR_ID,
  closeoutProject,
  createCollection,
  ensureFormalAcceptanceBaseline,
  queryDb,
  reopenProject,
  syncAllReconciliationGroups,
} from './helpers';

test.describe.serial('formal acceptance v2 · boundary batch11 · reconciliation fallback second closeout', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('second closeout is blocked again if one reconciliation group falls back after reopen', async ({ request }) => {
    await createCollection(request, `batch11 first closeout ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    let rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('已結案');

    await reopenProject(request);
    rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('執行中');

    const revertResponse = await request.post(`/api/financial-projects/${PROJECT_ID}/reconciliation-groups/sync`, {
      data: {
        groups: [
          { sourceType: '設計', vendorId: VENDOR_ID, vendorName: '驗收廠商C', reconciliationStatus: '已對帳', amountTotal: 12000, itemCount: 1 },
          { sourceType: '備品', vendorId: VENDOR_ID, vendorName: '驗收廠商C', reconciliationStatus: '待確認', amountTotal: 11000, itemCount: 1 },
          { sourceType: '廠商', vendorId: VENDOR_ID, vendorName: '驗收廠商C', reconciliationStatus: '已對帳', amountTotal: 20210, itemCount: 1 },
        ],
      },
    });
    expect(revertResponse.ok()).toBeTruthy();

    const secondCloseoutResponse = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
      data: {
        expectedOutstandingTotal: 0,
        expectedReconciliationStatus: '已完成',
      },
    });

    expect(secondCloseoutResponse.ok()).toBeFalsy();
    expect(secondCloseoutResponse.status()).toBe(409);
    const payload = await secondCloseoutResponse.json() as { error?: string; reconciliationStatus?: string };
    expect(String(payload.error ?? '')).toContain('reconciliation');
    expect(String(payload.reconciliationStatus ?? '')).toContain('待確認');

    rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('執行中');
  });
});
