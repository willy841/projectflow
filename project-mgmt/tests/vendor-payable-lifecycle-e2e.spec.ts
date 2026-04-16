// LEGACY / DEPRECATED: 舊正式驗收拆分腳本；已由 formal-acceptance-mainline.spec.ts 接手正式主線。
// 保留作局部回歸參考，不再視為正式 blocker。
import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const VENDOR_TASK_ID = '88888888-8888-4888-8888-888888888888';
const PLAN_ID = '99999999-9999-4999-8999-999999999999';

function readEnvLocalDatabaseUrl() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf8');
  const line = content.split('\n').find((entry) => entry.startsWith('DATABASE_URL='));
  if (!line) return null;
  return line.slice('DATABASE_URL='.length).trim().replace(/^['\"]|['\"]$/g, '');
}

async function queryDb<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || readEnvLocalDatabaseUrl();
  if (!connectionString) throw new Error('Missing DATABASE_URL');
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

test('vendor payable lifecycle v1', async ({ page, request }) => {
  test.setTimeout(120_000);

  const vendorRows = await queryDb<{ id: string; name: string }>(`select id, name from vendors where name = '驗收廠商C' limit 1`);
  const vendorId = vendorRows[0]?.id;
  if (!vendorId) throw new Error('Vendor not found: 驗收廠商C');

  await queryDb(
    `delete from project_vendor_payment_records where project_id = $1 and vendor_id = $2`,
    [PROJECT_ID, vendorId],
  );
  const baselinePaid = 0;

  const syncPlan = await request.post(`/api/vendor-tasks/${VENDOR_TASK_ID}/sync-plans`, {
    data: {
      plans: [{
        id: PLAN_ID,
        title: '展示架主體製作與進場',
        requirement: '含主體製作、現場安裝、拆除回收。',
        amount: '28000',
        vendorName: '驗收廠商C',
      }],
    },
  });
  expect(syncPlan.ok()).toBeTruthy();
  const confirmGroup = await request.post(`/api/vendor-groups/${PROJECT_ID}/${vendorId}/confirm`);
  expect(confirmGroup.ok()).toBeTruthy();

  await page.goto(`/vendors/${vendorId}`);
  await expect(page.getByText('未付款專案')).toBeVisible();

  const targetCard = page.locator('label').filter({ has: page.getByText('百貨檔期陳列與贈品備品整合') }).first();
  await expect(targetCard).toBeVisible();
  const checkbox = targetCard.locator('input[type="checkbox"]');
  await expect(checkbox).toBeEnabled();
  await checkbox.check();

  await page.getByRole('button', { name: '標記為已付款' }).click();

  await expect.poll(async () => {
    const rows = await queryDb<{ count: number }>(
      `select count(*)::int as count
       from project_vendor_payment_records
       where project_id = $1 and vendor_id = $2`,
      [PROJECT_ID, vendorId],
    );
    return rows[0]?.count ?? 0;
  }, { timeout: 15000 }).toBeGreaterThan(0);

  const paymentRows = await queryDb<{ id: string; amount: number; note: string }>(
    `select id, amount::float8 as amount, coalesce(note, '') as note
     from project_vendor_payment_records
     where project_id = $1 and vendor_id = $2
     order by created_at desc
     limit 1`,
    [PROJECT_ID, vendorId],
  );
  const paymentRow = paymentRows[0];
  expect(paymentRow).toBeTruthy();
  const paidAmount = Number(paymentRow!.amount);
  expect(paidAmount).toBeGreaterThan(0);
  expect(paymentRow!.note).toBe('批次標記為已付款');

  await page.waitForLoadState('networkidle');
  await expect(page.getByText('目前沒有待付款專案。')).toBeVisible();

  const deleteResponse = await request.delete(`/api/vendor-payments/${paymentRow!.id}`);
  expect(deleteResponse.ok()).toBeTruthy();

  await expect.poll(async () => {
    const rows = await queryDb<{ paid_amount: number }>(
      `select coalesce(sum(amount), 0)::float8 as paid_amount from project_vendor_payment_records where project_id = $1 and vendor_id = $2`,
      [PROJECT_ID, vendorId],
    );
    return rows[0]?.paid_amount ?? 0;
  }, { timeout: 15000 }).toBe(baselinePaid);

  await page.goto(`/vendors/${vendorId}`);
  await expect(page.getByText('未付款專案')).toBeVisible();
  await expect(page.getByText('百貨檔期陳列與贈品備品整合').first()).toBeVisible();
});
