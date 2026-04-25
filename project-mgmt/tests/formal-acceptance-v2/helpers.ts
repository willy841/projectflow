import { expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import { Client, type QueryResultRow } from 'pg';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
export const PROJECT_NAME = '百貨檔期陳列與贈品備品整合';
export const PROJECT_ROUTE = `/projects/${PROJECT_ID}`;

export const DESIGN_TASK_ID = '33333333-3333-4333-8333-333333333333';
export const DESIGN_PLAN_ID = '44444444-4444-4444-8444-444444444441';
export const DESIGN_CONFIRMATION_ID = '55555555-5555-4555-8555-555555555551';

export const PROCUREMENT_TASK_ID = '33333333-3333-4333-8333-333333333334';
export const PROCUREMENT_PLAN_ID = '44444444-4444-4444-8444-444444444442';
export const PROCUREMENT_CONFIRMATION_ID = '55555555-5555-4555-8555-555555555552';

export const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
export const VENDOR_NAME = '驗收廠商C';
export const VENDOR_TASK_ID = '88888888-8888-4888-8888-888888888888';
export const VENDOR_PLAN_ID = '99999999-9999-4999-8999-999999999999';
export const VENDOR_CONFIRMATION_ID = '55555555-5555-4555-8555-555555555553';
export const VENDOR_PACKAGE_ID = `pkg-${PROJECT_ID}-${VENDOR_ID}`;
export const VENDOR_GROUP_ID = `${PROJECT_ID}~${VENDOR_ID}`;

function readEnvLocalDatabaseUrl() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf8');
  const line = content.split('\n').find((entry) => entry.startsWith('DATABASE_URL='));
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

  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL for formal acceptance v2 suite');
  }

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
    await client.query(readFileSync(sqlPath, 'utf8'));
  } finally {
    await client.end();
  }
}

export async function ensureFormalAcceptanceBaseline() {
  await seedFormalAcceptanceSample();

  const rows = await queryDb<{ id: string; name: string }>(
    'select id, name from projects where id = $1',
    [PROJECT_ID],
  );

  expect(rows[0]?.id).toBe(PROJECT_ID);
  expect(rows[0]?.name).toBe(PROJECT_NAME);
}

export async function expectProjectVisibleInActiveViews(page: Page) {
  await page.goto('/');
  await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();

  await page.goto('/projects');
  await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
}

export async function countConfirmations(flowType: 'design' | 'procurement' | 'vendor', taskId: string) {
  const rows = await queryDb<{ count: number }>(
    `select count(*)::int as count
     from task_confirmations
     where flow_type = $1 and task_id = $2`,
    [flowType, taskId],
  );
  return rows[0]?.count ?? 0;
}

export async function getLatestSnapshotRow(
  flowType: 'design' | 'procurement' | 'vendor',
  taskId: string,
) {
  const rows = await queryDb<{
    confirmation_no: number;
    title: string | null;
    vendor_name_text: string | null;
    amount: string | null;
  }>(
    `select tc.confirmation_no,
            ts.payload_json->>'title' as title,
            ts.payload_json->>'vendor_name_text' as vendor_name_text,
            ts.payload_json->>'amount' as amount
     from task_confirmations tc
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
     where tc.flow_type = $1
       and tc.task_id = $2
     order by tc.confirmation_no desc, ts.sort_order asc
     limit 1`,
    [flowType, taskId],
  );

  return rows[0] ?? null;
}

export async function expectProjectDocumentRows(
  flowType: 'design' | 'procurement',
  expectedItemTitle: string,
) {
  if (flowType === 'design') {
    const rows = await queryDb<{ item: string; task_title: string }>(
      `with latest as (
         select distinct on (tc.task_id)
           tc.task_id,
           tc.id as confirmation_id
         from task_confirmations tc
         where tc.flow_type = 'design'
           and tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
       )
       select ts.payload_json->>'title' as item,
              dt.title as task_title
       from latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.confirmation_id
       inner join design_tasks dt on dt.id = latest.task_id
       order by dt.title asc, ts.sort_order asc`,
      [PROJECT_ID],
    );

    expect(rows.some((row) => row.item === expectedItemTitle)).toBeTruthy();
    return rows;
  }

  const rows = await queryDb<{ item: string; task_title: string }>(
    `with latest as (
       select distinct on (tc.task_id)
         tc.task_id,
         tc.id as confirmation_id
       from task_confirmations tc
       where tc.flow_type = 'procurement'
         and tc.project_id = $1
         and tc.status = 'confirmed'
       order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
     )
     select ts.payload_json->>'title' as item,
            pt.title as task_title
     from latest
     inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.confirmation_id
     inner join procurement_tasks pt on pt.id = latest.task_id
     order by pt.title asc, ts.sort_order asc`,
    [PROJECT_ID],
  );

  expect(rows.some((row) => row.item === expectedItemTitle)).toBeTruthy();
  return rows;
}

export async function syncSingleDesignPlan(
  request: APIRequestContext,
  title: string,
  vendor = VENDOR_NAME,
  amount = '12000',
) {
  const response = await request.post(`/api/design-tasks/${DESIGN_TASK_ID}/sync-plans`, {
    data: {
      plans: [
        {
          id: DESIGN_PLAN_ID,
          title,
          size: 'W120 x H180 cm / A6',
          material: 'PVC 輸出 / 紙卡',
          structure: '桌上立牌 + 吊卡',
          quantity: '1 式',
          amount,
          previewUrl: 'https://example.com/formal-acceptance/design/preview',
          vendor,
          vendorId: VENDOR_ID,
        },
      ],
    },
  });
  expect(response.ok()).toBeTruthy();
}

export async function syncSingleProcurementPlan(
  request: APIRequestContext,
  title: string,
  vendor = VENDOR_NAME,
  amount = '11000',
) {
  const response = await request.post(`/api/procurement-tasks/${PROCUREMENT_TASK_ID}/sync-plans`, {
    data: {
      plans: [
        {
          id: PROCUREMENT_PLAN_ID,
          title,
          quantity: '1 式',
          amount,
          previewUrl: 'https://example.com/formal-acceptance/procurement/preview',
          vendor,
          vendorId: VENDOR_ID,
        },
      ],
    },
  });
  expect(response.ok()).toBeTruthy();
}

export async function confirmDesignPlans(request: APIRequestContext) {
  const response = await request.post(`/api/design-tasks/${DESIGN_TASK_ID}/confirm`);
  expect(response.ok()).toBeTruthy();
}

export async function confirmProcurementPlans(request: APIRequestContext) {
  const response = await request.post(`/api/procurement-tasks/${PROCUREMENT_TASK_ID}/confirm`);
  expect(response.ok()).toBeTruthy();
}

export async function syncSingleVendorPlan(
  request: APIRequestContext,
  title: string,
  requirement = '含主體製作、現場安裝、拆除回收。',
  amount = '20210',
) {
  const response = await request.post(`/api/vendor-tasks/${VENDOR_TASK_ID}/sync-plans`, {
    data: {
      plans: [
        {
          id: VENDOR_PLAN_ID,
          title,
          requirement,
          amount,
          vendorName: VENDOR_NAME,
        },
      ],
    },
  });
  expect(response.ok()).toBeTruthy();
}

export async function confirmVendorPlans(request: APIRequestContext) {
  const response = await request.post(`/api/vendor-groups/${PROJECT_ID}/${VENDOR_ID}/confirm`);
  expect(response.ok()).toBeTruthy();
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
}

export async function closeoutProject(request: APIRequestContext) {
  const response = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
    data: {
      expectedOutstandingTotal: 0,
      expectedReconciliationStatus: '已完成',
    },
  });
  expect(response.ok()).toBeTruthy();
}

export async function reopenProject(request: APIRequestContext) {
  const response = await request.post(`/api/financial-projects/${PROJECT_ID}/reopen`);
  expect(response.ok()).toBeTruthy();
}

export async function syncAllReconciliationGroups(request: APIRequestContext) {
  const response = await request.post(`/api/financial-projects/${PROJECT_ID}/reconciliation-groups/sync`, {
    data: {
      groups: [
        { sourceType: '設計', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳' },
        { sourceType: '備品', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳' },
        { sourceType: '廠商', vendorId: VENDOR_ID, vendorName: VENDOR_NAME, reconciliationStatus: '已對帳' },
      ],
    },
  });
  expect(response.ok()).toBeTruthy();
}
