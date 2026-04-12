import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

function readEnvLocalDatabaseUrl() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf8');
  const line = content.split('\n').find((entry) => entry.startsWith('DATABASE_URL='));
  if (!line) return null;
  return line.slice('DATABASE_URL='.length).trim().replace(/^['\"]|['\"]$/g, '');
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? readEnvLocalDatabaseUrl();
  if (!databaseUrl) throw new Error('Missing DATABASE_URL for quote-cost full chain test');
  return databaseUrl;
}

async function queryDb<T>(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

test('quote-cost collection + closeout retained readback chain matches DB truth', async ({ page, request }) => {
  test.setTimeout(120_000);

  const runId = Date.now();
  const note = `P1 full-chain collection ${runId}`;
  const collectedOn = '2026-04-13';
  const amount = 43210;

  await page.goto(`/quote-costs/${PROJECT_ID}`);
  await expect(page.getByText('收款管理')).toBeVisible();
  await expect(page.getByText('廠商付款狀態')).toBeVisible();
  await expect(page.getByRole('heading', { name: '成本管理' })).toBeVisible();

  await page.getByRole('button', { name: '新增收款' }).click();
  const modal = page.locator('div').filter({ has: page.getByRole('heading', { name: '新增收款' }) }).last();
  const inputs = modal.getByRole('textbox');
  await inputs.nth(0).fill(collectedOn);
  await inputs.nth(1).fill(String(amount));
  await inputs.nth(2).fill(note);
  await modal.getByRole('button', { name: '建立收款' }).click();

  const collectionInDb = await expect.poll(async () => {
    return await queryDb<{ id: string; collected_on: string; amount: number; note: string }>(
      `select id, to_char(collected_on, 'YYYY-MM-DD') as collected_on, amount::float8 as amount, coalesce(note, '') as note
       from project_collection_records
       where project_id = $1 and note = $2
       order by created_at desc
       limit 1`,
      [PROJECT_ID, note],
    );
  }, { timeout: 15000 }).toHaveLength(1);

  expect(collectionInDb[0]?.collected_on).toBe(collectedOn);
  expect(Number(collectionInDb[0]?.amount)).toBe(amount);

  await expect(page.getByText(note)).toBeVisible();
  await expect(page.getByText('$43,210')).toBeVisible();

  const reconciliationRows = await queryDb<{ vendor_name: string; reconciliation_status: string }>(
    `select vendor_name, reconciliation_status
     from financial_reconciliation_groups
     where project_id = $1
     order by vendor_name asc`,
    [PROJECT_ID],
  );
  expect(reconciliationRows.length).toBeGreaterThan(0);

  const closeoutProbe = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
    data: {
      expectedOutstandingTotal: 999999,
      expectedReconciliationStatus: '待確認',
    },
  });
  expect(closeoutProbe.ok()).toBeFalsy();
  const closeoutProbeJson = await closeoutProbe.json();
  expect(['stale-outstanding-total', 'stale-reconciliation-status', 'outstanding-not-zero', 'reconciliation-not-complete']).toContain(closeoutProbeJson.error);

  await page.goto(`/closeout/${PROJECT_ID}`);
  await expect(page.getByText('結案留存')).toBeVisible();
  await expect(page.getByText(note)).toBeVisible();

  const retainedRows = await queryDb<{ count: number }>(
    `select count(*)::int as count
     from project_collection_records
     where project_id = $1 and note = $2`,
    [PROJECT_ID, note],
  );
  expect((retainedRows[0]?.count ?? 0)).toBeGreaterThan(0);
});
