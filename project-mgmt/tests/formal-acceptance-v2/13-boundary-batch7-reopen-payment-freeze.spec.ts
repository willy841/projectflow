import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  VENDOR_ID,
  closeoutProject,
  createCollection,
  createVendorPayment,
  deleteVendorPayment,
  ensureFormalAcceptanceBaseline,
  queryDb,
  reopenProject,
  resetVendorPaymentBaseline,
  syncAllReconciliationGroups,
} from './helpers';

test.describe.serial('formal acceptance v2 · boundary batch7 · reopen payment freeze', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('reopen does not silently erase vendor paid history or payment records after a valid closeout', async ({ request }) => {
    await resetVendorPaymentBaseline();
    await createCollection(request, `batch7 lifecycle ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);

    const payment = await createVendorPayment(request, 43210, `batch7 paid ${Date.now()}`);
    expect(payment.id).toBeTruthy();

    await closeoutProject(request);
    let rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('已結案');

    await reopenProject(request);
    rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('執行中');

    const paymentRows = await queryDb<{ id: string; amount: number }>(
      `select id, amount::float8 as amount
       from project_vendor_payment_records
       where id = $1`,
      [payment.id],
    );
    expect(paymentRows).toHaveLength(1);
    expect(Number(paymentRows[0]?.amount ?? 0)).toBe(43210);

    const historyAfterReopen = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyAfterReopen.ok()).toBeTruthy();
    const payload = await historyAfterReopen.json() as { ok?: boolean; records?: Array<{ paymentStatus?: string; unpaidAmount?: number }> };
    expect(payload.ok).toBeTruthy();
    expect(payload.records?.some((record) => record.paymentStatus === '已付款' && Number(record.unpaidAmount ?? -1) === 0)).toBeTruthy();
  });

  test('payment reversal before reopen restores unpaid semantics instead of keeping stale fully-paid history', async ({ request }) => {
    await resetVendorPaymentBaseline();
    await createCollection(request, `batch7 reversal ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);

    const payment = await createVendorPayment(request, 43210, `batch7 reversal paid ${Date.now()}`);
    expect(payment.id).toBeTruthy();

    await closeoutProject(request);
    let rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('已結案');

    const historyWhilePaid = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyWhilePaid.ok()).toBeTruthy();
    const historyWhilePaidPayload = await historyWhilePaid.json() as { ok?: boolean; records?: Array<{ paymentStatus?: string }> };
    expect(historyWhilePaidPayload.ok).toBeTruthy();
    expect(historyWhilePaidPayload.records?.some((record) => record.paymentStatus === '已付款')).toBeTruthy();

    await deleteVendorPayment(request, payment.id);

    const deletedRows = await queryDb<{ id: string }>(
      `select id from project_vendor_payment_records where id = $1`,
      [payment.id],
    );
    expect(deletedRows).toHaveLength(0);

    await reopenProject(request);
    rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('執行中');

    const historyAfterReversal = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyAfterReversal.ok()).toBeTruthy();
    const historyAfterReversalPayload = await historyAfterReversal.json() as { ok?: boolean; records?: Array<{ paymentStatus?: string }> };
    expect(historyAfterReversalPayload.ok).toBeTruthy();
    expect(historyAfterReversalPayload.records?.some((record) => record.paymentStatus === '已付款')).toBeFalsy();

    const openAfterReopen = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=open&includeDetails=false`);
    expect(openAfterReopen.ok()).toBeTruthy();
    const openPayload = await openAfterReopen.json() as { ok?: boolean; records?: Array<{ paymentStatus?: string; unpaidAmount?: number }> };
    expect(openPayload.ok).toBeTruthy();
    expect(openPayload.records?.some((record) => record.paymentStatus === '未付款' && Number(record.unpaidAmount ?? 0) === 43210)).toBeTruthy();
  });
});
