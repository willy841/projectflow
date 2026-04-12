import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const TASK_ID = 'a2bbb2c4-23b7-4331-a327-25976c072480';

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
  if (!databaseUrl) throw new Error('Missing DATABASE_URL for procurement overwrite test');
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

test('procurement line latest confirmation overwrites prior snapshot and document readback uses newest DB truth', async ({ page }) => {
  test.setTimeout(120_000);

  const runId = Date.now();
  const oldTitle = `P1 procurement old ${runId}`;
  const newTitle = `P1 procurement new ${runId}`;
  const oldVendor = `P1備品舊廠商${runId}`;
  const newVendor = `P1備品新廠商${runId}`;

  const beforeRows = await queryDb<{ confirmation_no: number }>(
    `select confirmation_no from task_confirmations where flow_type = 'procurement' and task_id = $1 order by confirmation_no desc limit 1`,
    [TASK_ID],
  );
  const beforeNo = beforeRows[0]?.confirmation_no ?? 0;

  await page.goto(`/procurement-tasks/${TASK_ID}`);
  await expect(page.getByText('採購備品任務詳情頁')).toBeVisible();

  const firstCard = page.locator('article.rounded-2xl.border.border-slate-200').first();
  const inputs = firstCard.locator('input');

  await inputs.nth(0).fill(oldTitle);
  await inputs.nth(4).fill(oldVendor);
  await page.getByRole('button', { name: '全部確認' }).click();
  await expect(page).toHaveURL(new RegExp(`/procurement-tasks/${TASK_ID}/document$`));
  await expect(page.getByText(oldTitle)).toBeVisible();

  const firstRows = await expect.poll(async () => {
    return await queryDb<{ confirmation_no: number; title: string; vendor_name_text: string | null }>(
      `select tc.confirmation_no, (ts.payload_json->>'title') as title, (ts.payload_json->>'vendor_name_text') as vendor_name_text
       from task_confirmations tc
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
       where tc.flow_type = 'procurement' and tc.task_id = $1
       order by tc.confirmation_no desc, ts.sort_order asc
       limit 1`,
      [TASK_ID],
    );
  }, { timeout: 15000 }).toHaveLength(1);

  const firstConfirmation = firstRows[0]!;
  expect(firstConfirmation.confirmation_no).toBeGreaterThan(beforeNo);
  expect(firstConfirmation.title).toBe(oldTitle);
  expect(firstConfirmation.vendor_name_text).toBe(oldVendor);

  await page.goto(`/procurement-tasks/${TASK_ID}`);
  await expect(page.getByText('採購備品任務詳情頁')).toBeVisible();

  const firstCard2 = page.locator('article.rounded-2xl.border.border-slate-200').first();
  const inputs2 = firstCard2.locator('input');

  await inputs2.nth(0).fill(newTitle);
  await inputs2.nth(4).fill(newVendor);
  await page.getByRole('button', { name: '全部確認' }).click();
  await expect(page).toHaveURL(new RegExp(`/procurement-tasks/${TASK_ID}/document$`));
  await expect(page.getByText(newTitle)).toBeVisible();
  await expect(page.getByText(oldTitle)).toHaveCount(0);

  const latestRows = await expect.poll(async () => {
    return await queryDb<{ confirmation_no: number; title: string; vendor_name_text: string | null }>(
      `select tc.confirmation_no, (ts.payload_json->>'title') as title, (ts.payload_json->>'vendor_name_text') as vendor_name_text
       from task_confirmations tc
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
       where tc.flow_type = 'procurement' and tc.task_id = $1
       order by tc.confirmation_no desc, ts.sort_order asc
       limit 1`,
      [TASK_ID],
    );
  }, { timeout: 15000 }).toHaveLength(1);

  const latestConfirmation = latestRows[0]!;
  expect(latestConfirmation.confirmation_no).toBeGreaterThan(firstConfirmation.confirmation_no);
  expect(latestConfirmation.title).toBe(newTitle);
  expect(latestConfirmation.vendor_name_text).toBe(newVendor);

  const olderSnapshotStillExists = await queryDb<{ count: number }>(
    `select count(*)::int as count
     from task_confirmations tc
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
     where tc.flow_type = 'procurement' and tc.task_id = $1 and ts.payload_json->>'title' = $2`,
    [TASK_ID, oldTitle],
  );
  expect((olderSnapshotStillExists[0]?.count ?? 0)).toBeGreaterThan(0);

  const currentDocument = await queryDb<{ title: string; vendor_name_text: string | null }>(
    `with latest as (
       select id
       from task_confirmations
       where flow_type = 'procurement' and task_id = $1
       order by confirmation_no desc
       limit 1
     )
     select (ts.payload_json->>'title') as title, (ts.payload_json->>'vendor_name_text') as vendor_name_text
     from latest l
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = l.id
     order by ts.sort_order asc
     limit 1`,
    [TASK_ID],
  );

  expect(currentDocument[0]?.title).toBe(newTitle);
  expect(currentDocument[0]?.vendor_name_text).toBe(newVendor);
});
