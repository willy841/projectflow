import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  VENDOR_ID,
  createVendorPayment,
  deleteVendorPayment,
  ensureFormalAcceptanceBaseline,
  queryDb,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 4 · vendor unpaid, history, and payment reversal', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor detail keeps reconciled project in unpaid, moves fully-paid project into history, and restores unpaid after deletion', async ({ page, request }) => {
    const projectRows = await queryDb<{ name: string }>(
      `select name from projects where id = $1`,
      [PROJECT_ID],
    );
    const projectName = projectRows[0]?.name;
    expect(projectName).toBeTruthy();

    const payableRows = await queryDb<{ total: number }>(
      `with latest as (
         select distinct on (tc.task_id, tc.flow_type)
           tc.task_id,
           tc.id as confirmation_id
         from task_confirmations tc
         where tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.task_id, tc.flow_type, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
       )
       select coalesce(sum(coalesce(nullif(ts.payload_json->>'amount', ''), '0')::numeric), 0)::int as total
       from latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.confirmation_id`,
      [PROJECT_ID],
    );
    const payableTotal = Number(payableRows[0]?.total ?? 0);
    expect(payableTotal).toBe(43210);

    const openBeforeResponse = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=open&includeDetails=false`);
    expect(openBeforeResponse.ok()).toBeTruthy();
    const openBeforePayload = await openBeforeResponse.json() as { ok?: boolean; records?: Array<{ projectName?: string; unpaidAmount?: number; reconciliationSummary?: string }> };
    expect(openBeforePayload.ok).toBeTruthy();
    expect(openBeforePayload.records?.some((record) => record.projectName === projectName && Number(record.unpaidAmount ?? 0) === 43210 && record.reconciliationSummary === '已對帳群組 3 筆 / 未對帳群組 0 筆')).toBeTruthy();

    const paymentNote = `v2 vendor full paid ${Date.now()}`;
    const created = await createVendorPayment(request, payableTotal, paymentNote);

    const paymentRows = await queryDb<{ amount: number; note: string | null }>(
      `select amount::float8 as amount, note
       from project_vendor_payment_records
       where id = $1`,
      [created.id],
    );
    expect(paymentRows[0]?.amount).toBe(payableTotal);
    expect(paymentRows[0]?.note).toBe(paymentNote);

    await page.goto(`/vendors/${VENDOR_ID}`);
    await expect(page.getByRole('row', { name: new RegExp(projectName as string) })).toHaveCount(0);
    const historyResponse = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyResponse.ok()).toBeTruthy();
    const historyPayload = await historyResponse.json() as { ok?: boolean; records?: Array<{ projectName?: string; unpaidAmount?: number; paymentStatus?: string }> };
    expect(historyPayload.ok).toBeTruthy();
    expect(historyPayload.records?.some((record) => record.projectName === projectName && Number(record.unpaidAmount ?? -1) === 0 && record.paymentStatus === '已付款')).toBeTruthy();

    await deleteVendorPayment(request, created.id);

    const deletedRows = await queryDb<{ id: string }>(
      `select id from project_vendor_payment_records where id = $1`,
      [created.id],
    );
    expect(deletedRows).toHaveLength(0);

    await page.goto(`/vendors/${VENDOR_ID}`);
    const restoredRow = page.getByRole('row', { name: new RegExp(projectName as string) });
    await expect(restoredRow).toBeVisible();
    await expect(restoredRow).toContainText('已對帳群組 3 筆 / 未對帳群組 0 筆');
    await expect(restoredRow).toContainText('$43,210');
  });
});
