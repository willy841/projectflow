import { test, expect } from '@playwright/test';
import pg from 'pg';

const { Client } = pg;
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.vkjabxekxnnczpulumod:9RnTuDvsNruISgaE@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function getPaidTotal() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(
      `select coalesce(sum(amount), 0)::int as paid_total from project_vendor_payment_records where project_id = $1 and (vendor_id = $2 or vendor_name = $3)`,
      [PROJECT_ID, VENDOR_ID, '驗收廠商C'],
    );
    return Number(result.rows[0]?.paid_total ?? 0);
  } finally {
    await client.end();
  }
}

test('vendor payment create/delete closes the loop across UI and DB-backed readback', async ({ request, page }) => {
  const note = `vendor payment e2e ${Date.now()}`;
  const baselinePaid = await getPaidTotal();
  const expectedPaidAfterCreate = baselinePaid + 1000;
  const expectedUnpaidAfterCreate = 28000 - expectedPaidAfterCreate;

  const createResponse = await request.post(`${BASE_URL}/api/vendors/${VENDOR_ID}/payments`, {
    data: {
      projectId: PROJECT_ID,
      paidOn: '2026-04-13',
      amount: 1000,
      note,
    },
  });
  expect(createResponse.ok()).toBeTruthy();
  const createJson = await createResponse.json();
  expect(createJson.ok).toBeTruthy();
  expect(createJson.id).toBeTruthy();

  expect(await getPaidTotal()).toBe(expectedPaidAfterCreate);

  await page.goto(`${BASE_URL}/vendors/${VENDOR_ID}`);
  await expect(page.getByText('部分付款').first()).toBeVisible();
  await expect(page.getByText(`$${expectedUnpaidAfterCreate.toLocaleString('en-US')}`).first()).toBeVisible();
  await expect(page.getByText(`NT$ 28,000 / $${expectedUnpaidAfterCreate.toLocaleString('en-US')}`)).toBeVisible();
  await expect(page.getByText(note)).toBeVisible();

  const deleteResponse = await request.delete(`${BASE_URL}/api/vendor-payments/${createJson.id}`);
  expect(deleteResponse.ok()).toBeTruthy();
  const deleteJson = await deleteResponse.json();
  expect(deleteJson.ok).toBeTruthy();
  expect(await getPaidTotal()).toBe(baselinePaid);

  const expectedUnpaidAfterDelete = 28000 - baselinePaid;
  await page.goto(`${BASE_URL}/vendors/${VENDOR_ID}`);
  await expect(page.getByText(`$${expectedUnpaidAfterDelete.toLocaleString('en-US')}`).first()).toBeVisible();
  await expect(page.getByText(`NT$ 28,000 / $${expectedUnpaidAfterDelete.toLocaleString('en-US')}`)).toBeVisible();
  await expect(page.getByText(note)).toHaveCount(0);
});
