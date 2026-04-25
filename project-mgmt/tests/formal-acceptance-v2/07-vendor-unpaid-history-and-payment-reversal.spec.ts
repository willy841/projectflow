import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
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

    await page.goto(`/vendors/${VENDOR_ID}`);
    await expect(page.getByRole('heading', { name: '未付款專案' })).toBeVisible();
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.getByText('已對帳 3 筆 / 未對帳 0 筆')).toBeVisible();
    const unpaidProjectRow = page.getByRole('row', { name: new RegExp(PROJECT_NAME) });
    await expect(unpaidProjectRow).toContainText('$43,210');
    await page.getByRole('button', { name: '查看明細' }).first().click();
    await expect(page.getByText('成本明細')).toBeVisible();
    await expect(page.getByText('發包內容明細')).toBeVisible();
    await expect(page.getByText('設計｜設計 對帳內容')).toBeVisible();
    await expect(page.getByText('備品｜備品 對帳內容')).toBeVisible();
    await expect(page.getByText('廠商｜廠商 對帳內容')).toBeVisible();
    await expect(page.getByText('正式 vendor 任務，用於群組確認與 package 驗收。')).toBeVisible();

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
    await expect(page.getByRole('row', { name: new RegExp(PROJECT_NAME) })).toHaveCount(0);
    const historyResponse = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
    expect(historyResponse.ok()).toBeTruthy();
    const historyPayload = await historyResponse.json() as { ok?: boolean; records?: Array<{ projectName?: string; unpaidAmount?: number; paymentStatus?: string }> };
    expect(historyPayload.ok).toBeTruthy();
    expect(historyPayload.records?.some((record) => record.projectName === PROJECT_NAME && Number(record.unpaidAmount ?? -1) === 0 && record.paymentStatus === '已付款')).toBeTruthy();

    await deleteVendorPayment(request, created.id);

    const deletedRows = await queryDb<{ id: string }>(
      `select id from project_vendor_payment_records where id = $1`,
      [created.id],
    );
    expect(deletedRows).toHaveLength(0);

    await page.goto(`/vendors/${VENDOR_ID}`);
    const restoredRow = page.getByRole('row', { name: new RegExp(PROJECT_NAME) });
    await expect(restoredRow).toBeVisible();
    await expect(restoredRow).toContainText('已對帳 3 筆 / 未對帳 0 筆');
    await expect(restoredRow).toContainText('$43,210');
  });
});
