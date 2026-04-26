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

test('vendor becomes fully paid and exits unpaid list after full payment', async ({ request, page }) => {
  const baselinePaid = await getPaidTotal();
  const remaining = 28000 - baselinePaid;
  expect(remaining).toBeGreaterThan(0);
  const note = `vendor full paid e2e ${Date.now()}`;

  const createResponse = await request.post(`${BASE_URL}/api/vendors/${VENDOR_ID}/payments`, {
    data: {
      projectId: PROJECT_ID,
      paidOn: '2026-04-13',
      amount: remaining,
      note,
    },
  });
  expect(createResponse.ok()).toBeTruthy();
  const createJson = await createResponse.json();
  expect(createJson.ok).toBeTruthy();

  expect(await getPaidTotal()).toBe(28000);

  await page.goto(`${BASE_URL}/vendors/${VENDOR_ID}`);
  await expect(page.getByText('目前沒有未付款專案。')).toBeVisible();
  await expect(page.getByText('已付款').first()).toBeVisible();
  await expect(page.getByText('NT$ 28,000 / $0')).toBeVisible();
  await expect(page.getByText(note)).toBeVisible();

  const deleteResponse = await request.delete(`${BASE_URL}/api/vendor-payments/${createJson.id}`);
  expect(deleteResponse.ok()).toBeTruthy();
  const deleteJson = await deleteResponse.json();
  expect(deleteJson.ok).toBeTruthy();
  expect(await getPaidTotal()).toBe(baselinePaid);
});
