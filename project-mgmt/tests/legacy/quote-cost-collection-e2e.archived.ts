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

test('quote-cost detail client collection flow', async ({ page }) => {
  test.setTimeout(120_000);

  const collectedOn = '2026-04-12';
  const note = `e2e collection ${Date.now()}`;

  await page.goto(`/quote-costs/${PROJECT_ID}`);
  await expect(page.getByText('收款管理')).toBeVisible();
  await page.getByRole('button', { name: '新增收款' }).click();

  const modal = page.locator('div').filter({ has: page.getByRole('heading', { name: '新增收款' }) }).last();
  const inputs = modal.getByRole('textbox');
  await inputs.nth(0).fill(collectedOn);
  await inputs.nth(1).fill('50000');
  await inputs.nth(2).fill(note);
  await modal.getByRole('button', { name: '建立收款' }).click();

  const created = await expect.poll(async () => {
    const rows = await queryDb<{ id: string; collected_on: string; amount: number; note: string }>(
      `select id, to_char(collected_on, 'YYYY-MM-DD') as collected_on, amount::float8 as amount, coalesce(note, '') as note from project_collection_records where project_id = $1 and note = $2 order by created_at desc limit 1`,
      [PROJECT_ID, note],
    );
    return rows[0] ?? null;
  }, { timeout: 15000 }).not.toBeNull();

  await expect(page.getByText(note)).toBeVisible();
  await expect(page.getByText('$50,000')).toBeVisible();
  await expect(page.getByText('應收總金額')).toBeVisible();
  await expect(page.getByText('已收款')).toBeVisible();
  await expect(page.getByText('未收款')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('row', { name: new RegExp(`${collectedOn}.*\\$50,000.*${note}`) }).getByRole('button', { name: '刪除' }).click();

  await expect.poll(async () => {
    const rows = await queryDb<{ count: number }>(`select count(*)::int as count from project_collection_records where project_id = $1 and note = $2`, [PROJECT_ID, note]);
    return rows[0]?.count ?? 0;
  }, { timeout: 15000 }).toBe(0);
});
