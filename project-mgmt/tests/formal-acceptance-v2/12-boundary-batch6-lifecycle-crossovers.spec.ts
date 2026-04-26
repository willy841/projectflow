import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
  VENDOR_ID,
  closeoutProject,
  createCollection,
  createVendorPayment,
  ensureFormalAcceptanceBaseline,
  queryDb,
  reopenProject,
  resetVendorPaymentBaseline,
  syncAllReconciliationGroups,
} from './helpers';

test.describe.serial('formal acceptance v2 · boundary batch6 · lifecycle crossovers', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor fully-paid history remains correct across closeout then reopen lifecycle switch', async ({ page, request }) => {
    await resetVendorPaymentBaseline();
    await createCollection(request, `batch6 lifecycle ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);
    const created = await createVendorPayment(request, 43210, `batch6 paid ${Date.now()}`);
    expect(created.id).toBeTruthy();

    await page.goto(`/vendors/${VENDOR_ID}`);
    await expect(page.getByRole('row', { name: new RegExp(PROJECT_NAME) })).toHaveCount(0);

    const historyBefore = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyBefore.ok()).toBeTruthy();
    const historyBeforePayload = await historyBefore.json() as { ok?: boolean; records?: Array<{ projectName?: string; paymentStatus?: string; unpaidAmount?: number }> };
    expect(historyBeforePayload.ok).toBeTruthy();
    expect(historyBeforePayload.records?.some((record) => record.projectName === PROJECT_NAME && record.paymentStatus === '已付款' && Number(record.unpaidAmount ?? -1) === 0)).toBeTruthy();

    await closeoutProject(request);
    let rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('已結案');

    const historyWhileClosed = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyWhileClosed.ok()).toBeTruthy();
    const historyWhileClosedPayload = await historyWhileClosed.json() as { ok?: boolean; records?: Array<{ projectName?: string; paymentStatus?: string }> };
    expect(historyWhileClosedPayload.ok).toBeTruthy();
    expect(historyWhileClosedPayload.records?.some((record) => record.projectName === PROJECT_NAME && record.paymentStatus === '已付款')).toBeTruthy();

    await reopenProject(request);
    rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('執行中');

    const historyAfterReopen = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyAfterReopen.ok()).toBeTruthy();
    const historyAfterReopenPayload = await historyAfterReopen.json() as { ok?: boolean; records?: Array<{ projectName?: string; paymentStatus?: string; unpaidAmount?: number }> };
    expect(historyAfterReopenPayload.ok).toBeTruthy();
    expect(historyAfterReopenPayload.records?.some((record) => record.projectName === PROJECT_NAME && record.paymentStatus === '已付款' && Number(record.unpaidAmount ?? -1) === 0)).toBeTruthy();

    await page.goto(`/vendors/${VENDOR_ID}`);
    await expect(page.getByRole('row', { name: new RegExp(PROJECT_NAME) })).toHaveCount(0);
  });
});
