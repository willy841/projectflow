import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const TASK_ID = '88888888-8888-4888-8888-888888888888';
const PACKAGE_ID = `pkg-${PROJECT_ID}-${VENDOR_ID}`;
const GROUP_ROUTE_ID = `${PROJECT_ID}~${VENDOR_ID}`;

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
  if (!databaseUrl) throw new Error('Missing DATABASE_URL for vendor group test');
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

test('vendor group confirm flows into package/document-layer with latest DB truth', async ({ page }) => {
  test.setTimeout(120_000);

  const runId = Date.now();
  const oldTitle = `P1 vendor old ${runId}`;
  const newTitle = `P1 vendor new ${runId}`;

  const beforeRows = await queryDb<{ confirmation_no: number }>(
    `select confirmation_no from task_confirmations where flow_type = 'vendor' and task_id = $1 order by confirmation_no desc limit 1`,
    [TASK_ID],
  );
  const beforeNo = beforeRows[0]?.confirmation_no ?? 0;

  await page.goto(`/vendor-assignments/${GROUP_ROUTE_ID}`);
  await expect(page.getByText('單 vendor 群組執行處理層')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '驗收廠商C' })).toBeVisible();

  const taskSection = page.locator('section.rounded-3xl.bg-white').filter({ has: page.getByText('群組任務 1') }).first();
  const titleInput = taskSection.locator('input').first();

  await titleInput.fill(oldTitle);
  await taskSection.getByRole('button', { name: '儲存' }).click();
  await expect(taskSection.getByText('已儲存 vendor 執行處理')).toBeVisible();

  await page.getByRole('button', { name: '全部確認' }).click();
  await expect(page).toHaveURL(new RegExp(`/vendor-packages/${PACKAGE_ID.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  await expect(page.getByText('驗收廠商C')).toBeVisible();
  await expect(page.getByText(oldTitle)).toBeVisible();

  const firstSnapshotRows = await expect.poll(async () => {
    return await queryDb<{ confirmation_no: number; title: string | null }>(
      `select tc.confirmation_no, (ts.payload_json->>'title') as title
       from task_confirmations tc
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
       where tc.flow_type = 'vendor' and tc.task_id = $1
       order by tc.confirmation_no desc, ts.sort_order asc
       limit 1`,
      [TASK_ID],
    );
  }, { timeout: 15000 }).toHaveLength(1);

  const firstSnapshot = firstSnapshotRows[0]!;
  expect(firstSnapshot.confirmation_no).toBeGreaterThanOrEqual(beforeNo);
  expect(firstSnapshot.title).toBe(oldTitle);

  await page.goto(`/vendor-assignments/${GROUP_ROUTE_ID}`);
  await expect(page.getByText('單 vendor 群組執行處理層')).toBeVisible();

  const taskSection2 = page.locator('section.rounded-3xl.bg-white').filter({ has: page.getByText('群組任務 1') }).first();
  const titleInput2 = taskSection2.locator('input').first();

  await titleInput2.fill(newTitle);
  await taskSection2.getByRole('button', { name: '儲存' }).click();
  await expect(taskSection2.getByText('已儲存 vendor 執行處理')).toBeVisible();

  await page.getByRole('button', { name: '全部確認' }).click();
  await expect(page).toHaveURL(new RegExp(`/vendor-packages/${PACKAGE_ID.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  await expect(page.getByText(newTitle)).toBeVisible();
  await expect(page.getByText(oldTitle)).toHaveCount(0);

  const latestSnapshotRows = await expect.poll(async () => {
    return await queryDb<{ confirmation_no: number; title: string | null }>(
      `select tc.confirmation_no, (ts.payload_json->>'title') as title
       from task_confirmations tc
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
       where tc.flow_type = 'vendor' and tc.task_id = $1
       order by tc.confirmation_no desc, ts.sort_order asc
       limit 1`,
      [TASK_ID],
    );
  }, { timeout: 15000 }).toHaveLength(1);

  const latestSnapshot = latestSnapshotRows[0]!;
  expect(latestSnapshot.confirmation_no).toBeGreaterThanOrEqual(firstSnapshot.confirmation_no);
  expect(latestSnapshot.title).toBe(newTitle);

  const latestPackageRows = await queryDb<{ item_name: string | null }>(
    `with latest as (
       select id
       from task_confirmations
       where flow_type = 'vendor' and task_id = $1
       order by confirmation_no desc
       limit 1
     )
     select (ts.payload_json->>'title') as item_name
     from latest l
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = l.id
     order by ts.sort_order asc
     limit 1`,
    [TASK_ID],
  );

  expect(latestPackageRows[0]?.item_name).toBe(newTitle);
});
