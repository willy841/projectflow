import { expect, test } from '@playwright/test';
import { Client } from 'pg';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

async function queryDb<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
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

test('vendor payable lifecycle v1', async ({ page }) => {
  test.setTimeout(120_000);

  const note = `vendor payment e2e ${Date.now()}`;

  const vendorRows = await queryDb<{ id: string; name: string }>(`select id, name from vendors where name = '驗收廠商C' limit 1`);
  const vendorId = vendorRows[0]?.id;
  if (!vendorId) throw new Error('Vendor not found: 驗收廠商C');

  await page.goto(`/vendors/${vendorId}`);
  await expect(page.getByText('未付款專案')).toBeVisible();

  await page.getByRole('button', { name: '登記付款' }).first().click();
  const modal = page.locator('div').filter({ has: page.getByRole('heading', { name: '登記付款' }) }).last();
  const inputs = modal.getByRole('textbox');
  await inputs.nth(0).fill('2026-04-12');
  await inputs.nth(1).fill('1000');
  await inputs.nth(2).fill(note);
  await modal.getByRole('button', { name: '建立付款' }).click();

  const paymentRow = await expect.poll(async () => {
    const rows = await queryDb<{ id: string; amount: number; note: string }>(
      `select id, amount::float8 as amount, coalesce(note, '') as note from project_vendor_payment_records where project_id = $1 and note = $2 order by created_at desc limit 1`,
      [PROJECT_ID, note],
    );
    return rows[0] ?? null;
  }, { timeout: 15000 }).not.toBeNull();

  const paymentEntry = page.locator('div.rounded-2xl.bg-white').filter({ has: page.getByText(note) }).first();
  await expect(paymentEntry).toContainText(note);
  await expect(paymentEntry).toContainText('$1,000');
  const projectCard = page.locator('div').filter({ has: page.getByText('Projectflow 驗收測試專案') }).first();
  await expect(projectCard).toContainText(/部分付款|已付款/);

  page.once('dialog', (dialog) => dialog.accept());
  await paymentEntry.getByRole('button', { name: '刪除' }).click();

  await expect.poll(async () => {
    const rows = await queryDb<{ count: number }>(`select count(*)::int as count from project_vendor_payment_records where project_id = $1 and note = $2`, [PROJECT_ID, note]);
    return rows[0]?.count ?? 0;
  }, { timeout: 15000 }).toBe(0);
});
