// LEGACY / DEPRECATED: 舊正式驗收拆分腳本；已由 formal-acceptance-mainline.spec.ts 接手正式主線。
// 保留作局部回歸參考，不再視為正式 blocker。
import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const TASK_ID = '88888888-8888-4888-8888-888888888888';
const PLAN_ID = '99999999-9999-4999-8999-999999999999';
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

async function getLatestConfirmation() {
  const rows = await queryDb<{ confirmation_no: number; title: string | null }>(
    `select tc.confirmation_no, (ts.payload_json->>'title') as title
     from task_confirmations tc
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
     where tc.flow_type = 'vendor' and tc.task_id = $1
     order by tc.confirmation_no desc, ts.sort_order asc
     limit 1`,
    [TASK_ID],
  );
  return rows[0] ?? null;
}

test('vendor group confirm flows into package/document-layer with latest DB truth', async ({ request, page }) => {
  test.setTimeout(120_000);

  const runId = Date.now();
  const oldTitle = `P1 vendor old ${runId}`;
  const newTitle = `P1 vendor new ${runId}`;

  const before = await getLatestConfirmation();
  const beforeNo = before?.confirmation_no ?? 0;

  const syncOld = await request.post(`/api/vendor-tasks/${TASK_ID}/sync-plans`, {
    data: {
      plans: [
        {
          id: PLAN_ID,
          title: oldTitle,
          requirement: 'P1 vendor requirement old',
          amount: '28000',
          vendorName: '驗收廠商C',
        },
      ],
    },
  });
  expect(syncOld.ok()).toBeTruthy();

  const groupConfirmOld = await request.post(`/api/vendor-groups/${PROJECT_ID}/${VENDOR_ID}/confirm`);
  expect(groupConfirmOld.ok()).toBeTruthy();

  const first = await getLatestConfirmation();
  expect(first).not.toBeNull();
  expect(first!.confirmation_no).toBeGreaterThanOrEqual(beforeNo);
  expect(first!.title).toBe(oldTitle);

  await page.goto(`/vendor-packages/${PACKAGE_ID}`);
  await expect(page.getByText('驗收廠商C')).toBeVisible();
  await expect(page.getByText(oldTitle)).toBeVisible();

  const syncNew = await request.post(`/api/vendor-tasks/${TASK_ID}/sync-plans`, {
    data: {
      plans: [
        {
          id: PLAN_ID,
          title: newTitle,
          requirement: 'P1 vendor requirement new',
          amount: '28000',
          vendorName: '驗收廠商C',
        },
      ],
    },
  });
  expect(syncNew.ok()).toBeTruthy();

  const groupConfirmNew = await request.post(`/api/vendor-groups/${PROJECT_ID}/${VENDOR_ID}/confirm`);
  expect(groupConfirmNew.ok()).toBeTruthy();

  const latest = await getLatestConfirmation();
  expect(latest).not.toBeNull();
  expect(latest!.confirmation_no).toBeGreaterThanOrEqual(first!.confirmation_no);
  expect(latest!.title).toBe(newTitle);

  await page.goto(`/vendor-assignments/${GROUP_ROUTE_ID}`);
  await expect(page.getByText('單 vendor 群組執行處理層')).toBeVisible();
  await page.goto(`/vendor-packages/${PACKAGE_ID}`);
  await expect(page.getByText(newTitle)).toBeVisible();
  await expect(page.getByText(oldTitle)).toHaveCount(0);

  const olderSnapshotStillExists = await queryDb<{ count: number }>(
    `select count(*)::int as count
     from task_confirmations tc
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
     where tc.flow_type = 'vendor' and tc.task_id = $1 and ts.payload_json->>'title' = $2`,
    [TASK_ID, oldTitle],
  );
  expect((olderSnapshotStillExists[0]?.count ?? 0)).toBeGreaterThan(0);

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
