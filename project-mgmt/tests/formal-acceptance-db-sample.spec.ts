import { expect, test } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const PROJECT_ROUTE = `/projects/${PROJECT_ID}`;
const DESIGN_TASK_ID = '33333333-3333-4333-8333-333333333333';
const PROCUREMENT_TASK_ID = '33333333-3333-4333-8333-333333333334';
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const VENDOR_TASK_ID = '88888888-8888-4888-8888-888888888888';
const VENDOR_PACKAGE_ID = `pkg-${PROJECT_ID}-${VENDOR_ID}`;
const VENDOR_GROUP_ID = `${PROJECT_ID}~${VENDOR_ID}`;

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
  if (!databaseUrl) throw new Error('Missing DATABASE_URL for formal acceptance sample test');
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

test.describe.serial('formal acceptance sample (DB-first)', () => {
  test('seeded project supports the required closed-loop flows', async ({ page, request }) => {
    test.setTimeout(180_000);

    const designSnapshot = await queryDb<{ vendor_id: string | null; vendor_name_text: string | null }>(
      `select payload_json->>'vendor_id' as vendor_id, payload_json->>'vendor_name_text' as vendor_name_text
       from task_confirmation_plan_snapshots
       where task_confirmation_id = '55555555-5555-4555-8555-555555555551'`,
    );
    expect(designSnapshot[0]?.vendor_id).toBe(VENDOR_ID);
    expect(designSnapshot[0]?.vendor_name_text).toBe('驗收廠商C');

    const procurementSnapshot = await queryDb<{ vendor_id: string | null; vendor_name_text: string | null }>(
      `select payload_json->>'vendor_id' as vendor_id, payload_json->>'vendor_name_text' as vendor_name_text
       from task_confirmation_plan_snapshots
       where task_confirmation_id = '55555555-5555-4555-8555-555555555552'`,
    );
    expect(procurementSnapshot[0]?.vendor_id).toBe(VENDOR_ID);

    await page.goto(PROJECT_ROUTE);
    await expect(page.getByText('百貨檔期陳列與贈品備品整合')).toBeVisible();

    await page.goto(`/design-tasks/${DESIGN_TASK_ID}`);
    await expect(page.getByRole('heading', { name: 'POP 與價卡完稿' })).toBeVisible();
    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText('POP / 價卡正式輸出方案').first()).toBeVisible();

    await page.goto(`/procurement-tasks/${PROCUREMENT_TASK_ID}`);
    await expect(page.getByRole('heading', { name: '展示架五金與配件採購' })).toBeVisible();
    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText('展示架五金正式採購方案').first()).toBeVisible();

    await page.goto(`/vendor-assignments/${VENDOR_GROUP_ID}`);
    await expect(page.getByText('驗收廠商C').first()).toBeVisible();
    await expect(page.getByText('展示架現場製作發包').first()).toBeVisible();
    await page.goto(`/vendor-packages/${VENDOR_PACKAGE_ID}`);
    await expect(page.getByText('驗收廠商C').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '發包項目整理' })).toBeVisible();

    const latestBefore = await queryDb<{ confirmation_no: number }>(
      `select confirmation_no from task_confirmations where flow_type = 'vendor' and task_id = $1 order by confirmation_no desc limit 1`,
      [VENDOR_TASK_ID],
    );
    const syncPlan = await request.post(`/api/vendor-tasks/${VENDOR_TASK_ID}/sync-plans`, {
      data: {
        plans: [{
          id: '99999999-9999-4999-8999-999999999999',
          title: '展示架主體製作與進場',
          requirement: '含主體製作、現場安裝、拆除回收。',
          amount: '20210',
          vendorName: '驗收廠商C',
        }],
      },
    });
    expect(syncPlan.ok()).toBeTruthy();
    const confirmGroup = await request.post(`/api/vendor-groups/${PROJECT_ID}/${VENDOR_ID}/confirm`);
    expect(confirmGroup.ok()).toBeTruthy();
    const latestAfter = await queryDb<{ confirmation_no: number }>(
      `select confirmation_no from task_confirmations where flow_type = 'vendor' and task_id = $1 order by confirmation_no desc limit 1`,
      [VENDOR_TASK_ID],
    );
    expect((latestAfter[0]?.confirmation_no ?? 0)).toBeGreaterThanOrEqual(latestBefore[0]?.confirmation_no ?? 0);

    const note = `formal acceptance collection ${Date.now()}`;
    const createCollection = await request.post(`/api/accounting/projects/${PROJECT_ID}/collections`, {
      data: { collectedOn: '2026-04-16', amount: 43210, note },
    });
    expect(createCollection.ok()).toBeTruthy();

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText(note)).toBeVisible();
    await expect(page.getByText('驗收廠商C').first()).toBeVisible();

    const closeout = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
      data: { expectedOutstandingTotal: 0, expectedReconciliationStatus: '已完成' },
    });
    expect(closeout.ok()).toBeTruthy();

    await page.goto(`/closeout/${PROJECT_ID}`);
    await expect(page.getByText('百貨檔期陳列與贈品備品整合')).toBeVisible();
    await expect(page.getByText(note)).toBeVisible();

    const reopen = await request.post(`/api/financial-projects/${PROJECT_ID}/reopen`);
    expect(reopen.ok()).toBeTruthy();
    const projectStatusRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(projectStatusRows[0]?.status).toBe('執行中');

    await page.goto('/vendors/77777777-7777-4777-8777-777777777777');
    await expect(page.getByRole('heading', { name: '驗收廠商C' })).toBeVisible();
    await expect(page.getByText('未付款專案')).toBeVisible();
  });
});
