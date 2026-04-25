import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  VENDOR_ID,
  ensureFormalAcceptanceBaseline,
  queryDb,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Vendor Payments', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor payments create/delete lifecycle persists against formal payment records', async ({ request }) => {
    const baselineRows = await queryDb<{ total: string }>(
      `select coalesce(sum(amount), 0)::text as total
       from project_vendor_payment_records
       where project_id = $1 and vendor_id = $2`,
      [PROJECT_ID, VENDOR_ID],
    );
    const baselineTotal = Number(baselineRows[0]?.total ?? '0');

    const createResponse = await request.post(`/api/vendors/${VENDOR_ID}/payments`, {
      data: {
        projectId: PROJECT_ID,
        paidOn: '2026-04-16',
        amount: 1000,
        note: `formal acceptance vendor payment ${Date.now()}`,
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const createResult = await createResponse.json();
    expect(createResult.ok).toBeTruthy();
    const paymentId = createResult.id as string;
    expect(paymentId).toBeTruthy();

    let paymentRows = await queryDb<{ id: string; amount: number; note: string | null }>(
      `select id, amount::float8 as amount, note
       from project_vendor_payment_records
       where id = $1`,
      [paymentId],
    );
    expect(paymentRows[0]?.amount).toBe(1000);
    expect(paymentRows[0]?.note).toContain('formal acceptance vendor payment');

    let totalRows = await queryDb<{ total: string }>(
      `select coalesce(sum(amount), 0)::text as total
       from project_vendor_payment_records
       where project_id = $1 and vendor_id = $2`,
      [PROJECT_ID, VENDOR_ID],
    );
    expect(Number(totalRows[0]?.total ?? '0')).toBe(baselineTotal + 1000);

    const deleteResponse = await request.delete(`/api/vendor-payments/${paymentId}`);
    expect(deleteResponse.ok()).toBeTruthy();
    const deleteResult = await deleteResponse.json();
    expect(deleteResult.ok).toBeTruthy();

    paymentRows = await queryDb<{ id: string }>(
      `select id from project_vendor_payment_records where id = $1`,
      [paymentId],
    );
    expect(paymentRows).toHaveLength(0);

    totalRows = await queryDb<{ total: string }>(
      `select coalesce(sum(amount), 0)::text as total
       from project_vendor_payment_records
       where project_id = $1 and vendor_id = $2`,
      [PROJECT_ID, VENDOR_ID],
    );
    expect(Number(totalRows[0]?.total ?? '0')).toBe(baselineTotal);
  });
});
