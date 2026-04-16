import { expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import { Client, type QueryResultRow } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
export const PROJECT_NAME = '百貨檔期陳列與贈品備品整合';
export const PROJECT_ROUTE = `/projects/${PROJECT_ID}`;
export const DESIGN_TASK_ID = '33333333-3333-4333-8333-333333333333';
export const PROCUREMENT_TASK_ID = '33333333-3333-4333-8333-333333333334';
export const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
export const VENDOR_NAME = '驗收廠商C';
export const VENDOR_TASK_ID = '88888888-8888-4888-8888-888888888888';
export const VENDOR_PACKAGE_ID = `pkg-${PROJECT_ID}-${VENDOR_ID}`;
export const VENDOR_GROUP_ID = `${PROJECT_ID}~${VENDOR_ID}`;
export const DESIGN_CONFIRMATION_ID = '55555555-5555-4555-8555-555555555551';
export const PROCUREMENT_CONFIRMATION_ID = '55555555-5555-4555-8555-555555555552';
export const PLAN_ID = '99999999-9999-4999-8999-999999999999';

function readEnvLocalDatabaseUrl() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf8');
  const line = content
    .split('\n')
    .find((entry) => entry.startsWith('DATABASE_URL='));
  if (!line) return null;
  return line.slice('DATABASE_URL='.length).trim().replace(/^['\"]|['\"]$/g, '');
}

export function getDatabaseUrl() {
  const databaseUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    readEnvLocalDatabaseUrl();

  if (!databaseUrl) throw new Error('Missing DATABASE_URL for formal acceptance suite');
  return databaseUrl;
}

export async function queryDb<T extends QueryResultRow = Record<string, unknown>>(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

export async function seedFormalAcceptanceSample() {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  try {
    const sqlPath = path.resolve(process.cwd(), 'db/seeds/projectflow-formal-acceptance-sample.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    await client.query(sql);
  } finally {
    await client.end();
  }
}

export async function ensureFormalAcceptanceBaseline() {
  await seedFormalAcceptanceSample();

  const rows = await queryDb<{ id: string }>('select id from projects where id = $1', [PROJECT_ID]);
  expect(rows[0]?.id).toBe(PROJECT_ID);
}

export async function expectProjectVisibleInActiveViews(page: Page) {
  await page.goto('/');
  await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();

  await page.goto('/projects');
  await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
}

export async function expectSnapshotVendorLinkage(taskConfirmationId: string) {
  const rows = await queryDb<{ vendor_id: string | null; vendor_name_text: string | null }>(
    `select payload_json->>'vendor_id' as vendor_id, payload_json->>'vendor_name_text' as vendor_name_text
     from task_confirmation_plan_snapshots
     where task_confirmation_id = $1
     order by sort_order asc`,
    [taskConfirmationId],
  );

  expect(rows.length).toBeGreaterThan(0);
  expect(rows[0]?.vendor_id).toBe(VENDOR_ID);
  expect(rows[0]?.vendor_name_text).toBe(VENDOR_NAME);
}

export async function createCollection(request: APIRequestContext, note: string, amount: number) {
  const response = await request.post(`/api/accounting/projects/${PROJECT_ID}/collections`, {
    data: {
      collectedOn: '2026-04-16',
      amount,
      note,
    },
  });
  expect(response.ok()).toBeTruthy();
  return response;
}

export async function syncVendorPlanAndConfirm(request: APIRequestContext, title: string, requirement: string, amount = '20210') {
  const syncPlan = await request.post(`/api/vendor-tasks/${VENDOR_TASK_ID}/sync-plans`, {
    data: {
      plans: [
        {
          id: PLAN_ID,
          title,
          requirement,
          amount,
          vendorName: VENDOR_NAME,
        },
      ],
    },
  });
  expect(syncPlan.ok()).toBeTruthy();

  const confirmGroup = await request.post(`/api/vendor-groups/${PROJECT_ID}/${VENDOR_ID}/confirm`);
  expect(confirmGroup.ok()).toBeTruthy();
}
