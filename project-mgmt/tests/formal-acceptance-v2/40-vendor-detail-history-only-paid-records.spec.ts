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

test.describe.serial('formal acceptance v2 · vendor detail history only shows paid records', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('history tab excludes unpaid records and shows fully-paid history records', async ({ page, request }) => {
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

    const openResponse = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=open&includeDetails=false`);
    expect(openResponse.ok()).toBeTruthy();
    const openPayload = await openResponse.json() as { ok?: boolean; records?: Array<{ projectName?: string; unpaidAmount?: number }> };
    expect(openPayload.ok).toBeTruthy();
    expect(openPayload.records?.some((record) => record.projectName === PROJECT_NAME && Number(record.unpaidAmount ?? 0) === 43210)).toBeTruthy();

    await page.goto(`/vendors/${VENDOR_ID}`);
    await page.getByRole('button', { name: '往來紀錄' }).click();
    await expect(page.getByRole('button', { name: '未結帳' })).toHaveCount(0);
    await expect(page.getByText('目前顯示 0 筆往來紀錄')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('目前沒有符合條件的往來紀錄。')).toBeVisible();

    const created = await createVendorPayment(request, payableTotal, `vendor history paid ${Date.now()}`);

    try {
      const historyResponse = await request.get(`/api/vendors/${VENDOR_ID}/records?scope=history&includeDetails=false`);
      expect(historyResponse.ok()).toBeTruthy();
      const historyPayload = await historyResponse.json() as { ok?: boolean; records?: Array<{ projectName?: string; unpaidAmount?: number; paymentStatus?: string }> };
      expect(historyPayload.ok).toBeTruthy();
      expect(historyPayload.records?.some((record) => record.projectName === PROJECT_NAME && Number(record.unpaidAmount ?? -1) === 0 && record.paymentStatus === '已付款')).toBeTruthy();

      await page.goto(`/vendors/${VENDOR_ID}`);
      await page.getByRole('button', { name: '往來紀錄' }).click();
      await expect(page.getByRole('button', { name: '未結帳' })).toHaveCount(0);
      await expect(page.getByText(PROJECT_NAME)).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('已付款')).toBeVisible();
    } finally {
      await deleteVendorPayment(request, created.id);
    }
  });
});
