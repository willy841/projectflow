import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
  VENDOR_ID,
  createCollection,
  ensureFormalAcceptanceBaseline,
  queryDb,
  resetVendorPaymentBaseline,
  syncAllReconciliationGroups,
} from './helpers';

test.describe.serial('formal acceptance v2 · boundary batch5 · product completeness', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor fully-paid history does not retain the project after one group falls back out of fully reconciled state', async ({ page, request }) => {
    await resetVendorPaymentBaseline();
    await createCollection(request, `batch5 paid history ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);

    const paymentResponse = await request.post(`/api/vendors/${VENDOR_ID}/payments`, {
      data: {
        projectId: PROJECT_ID,
        paidOn: '2026-04-26',
        amount: 43210,
        note: `batch5 full paid ${Date.now()}`,
      },
    });
    if (!paymentResponse.ok()) {
      throw new Error(`vendor payment create failed: ${paymentResponse.status()} ${await paymentResponse.text()}`);
    }

    const historyBefore = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyBefore.ok()).toBeTruthy();
    const historyBeforePayload = await historyBefore.json() as { ok?: boolean; records?: Array<{ projectName?: string; paymentStatus?: string }> };
    expect(historyBeforePayload.ok).toBeTruthy();
    expect(historyBeforePayload.records?.some((record) => record.projectName === PROJECT_NAME && record.paymentStatus === '已付款')).toBeTruthy();

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

    const historyAfter = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyAfter.ok()).toBeTruthy();
    const historyAfterPayload = await historyAfter.json() as { ok?: boolean; records?: Array<{ projectName?: string }> };
    expect(historyAfterPayload.ok).toBeTruthy();
    expect(historyAfterPayload.records?.some((record) => record.projectName === PROJECT_NAME)).toBeFalsy();

    await page.goto(`/vendors/${VENDOR_ID}`);
    await page.getByRole('button', { name: '往來紀錄' }).click();
    await page.getByRole('button', { name: '過往紀錄' }).click();
    await expect(page.getByText(PROJECT_NAME)).toHaveCount(0);
  });

  test('closeout write stays blocked after a fully reconciled project falls back to partial reconciliation before closeout submit', async ({ request }) => {
    await createCollection(request, `batch5 closeout fallback ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);

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

    const closeoutResponse = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
      data: {
        expectedOutstandingTotal: 0,
        expectedReconciliationStatus: '已完成',
      },
    });

    expect(closeoutResponse.ok()).toBeFalsy();
    expect(closeoutResponse.status()).toBe(409);
    const payload = await closeoutResponse.json() as { error?: string; reconciliationStatus?: string };
    expect(String(payload.error ?? '')).toContain('reconciliation');
    expect(String(payload.reconciliationStatus ?? '')).toContain('待確認');

    const rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('執行中');
  });
});
