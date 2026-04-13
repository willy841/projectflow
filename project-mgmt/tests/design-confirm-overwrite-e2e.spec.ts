import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const TASK_ID = '65697caf-1bc8-4646-9fe4-0cc4e5621699';
const PLAN_ID = '78aca637-16ed-458a-a453-62422c5fc3de';

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
  if (!databaseUrl) throw new Error('Missing DATABASE_URL for design overwrite test');
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
  const rows = await queryDb<{ confirmation_no: number; title: string; vendor_name_text: string | null }>(
    `select tc.confirmation_no, (ts.payload_json->>'title') as title, (ts.payload_json->>'vendor_name_text') as vendor_name_text
     from task_confirmations tc
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
     where tc.flow_type = 'design' and tc.task_id = $1
     order by tc.confirmation_no desc, ts.sort_order asc
     limit 1`,
    [TASK_ID],
  );
  return rows[0] ?? null;
}

test('design line latest confirmation overwrites prior snapshot and DB truth uses newest value', async ({ request }) => {
  test.setTimeout(120_000);

  const runId = Date.now();
  const oldTitle = `P1 design old ${runId}`;
  const newTitle = `P1 design new ${runId}`;
  const oldVendor = `P1設計舊廠商${runId}`;
  const newVendor = `P1設計新廠商${runId}`;

  const before = await getLatestConfirmation();
  const beforeNo = before?.confirmation_no ?? 0;

  const syncOld = await request.post(`/api/design-tasks/${TASK_ID}/sync-plans`, {
    data: {
      plans: [
        {
          id: PLAN_ID,
          title: oldTitle,
          size: 'W180 x H240',
          material: 'PVC + 木作背架',
          structure: '沿用 merged field',
          quantity: '1',
          amount: '18000',
          previewUrl: 'https://example.com/design-preview',
          vendor: oldVendor,
        },
      ],
    },
  });
  expect(syncOld.ok()).toBeTruthy();

  const confirmOld = await request.post(`/api/design-tasks/${TASK_ID}/confirm`);
  expect(confirmOld.ok()).toBeTruthy();

  const first = await getLatestConfirmation();
  expect(first).not.toBeNull();
  expect(first!.confirmation_no).toBeGreaterThan(beforeNo);
  expect(first!.title).toBe(oldTitle);
  expect(first!.vendor_name_text).toBe(oldVendor);

  const syncNew = await request.post(`/api/design-tasks/${TASK_ID}/sync-plans`, {
    data: {
      plans: [
        {
          id: PLAN_ID,
          title: newTitle,
          size: 'W180 x H240',
          material: 'PVC + 木作背架',
          structure: '沿用 merged field',
          quantity: '1',
          amount: '18000',
          previewUrl: 'https://example.com/design-preview',
          vendor: newVendor,
        },
      ],
    },
  });
  expect(syncNew.ok()).toBeTruthy();

  const confirmNew = await request.post(`/api/design-tasks/${TASK_ID}/confirm`);
  expect(confirmNew.ok()).toBeTruthy();

  const latest = await getLatestConfirmation();
  expect(latest).not.toBeNull();
  expect(latest!.confirmation_no).toBeGreaterThan(first!.confirmation_no);
  expect(latest!.title).toBe(newTitle);
  expect(latest!.vendor_name_text).toBe(newVendor);

  const olderSnapshotStillExists = await queryDb<{ count: number }>(
    `select count(*)::int as count
     from task_confirmations tc
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
     where tc.flow_type = 'design' and tc.task_id = $1 and ts.payload_json->>'title' = $2`,
    [TASK_ID, oldTitle],
  );
  expect((olderSnapshotStillExists[0]?.count ?? 0)).toBeGreaterThan(0);

  const currentDocument = await queryDb<{ title: string; vendor_name_text: string | null }>(
    `with latest as (
       select id
       from task_confirmations
       where flow_type = 'design' and task_id = $1
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
