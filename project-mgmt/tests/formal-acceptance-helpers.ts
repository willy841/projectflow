import { expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import { Client, type QueryResultRow } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { slugifyProjectName } from '@/components/project-data';

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

export async function createFormalAcceptanceTempProject(request: APIRequestContext, overrides?: {
  name?: string;
  client?: string;
  eventDate?: string;
  location?: string;
  eventType?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactLine?: string;
  owner?: string;
  note?: string;
  loadInTime?: string;
}) {
  const runId = Date.now();
  const payload = {
    name: overrides?.name ?? `正式驗收暫時專案 ${runId}`,
    client: overrides?.client ?? '正式驗收客戶',
    eventDate: overrides?.eventDate ?? '2026-05-01',
    location: overrides?.location ?? '台北南港展覽館',
    eventType: overrides?.eventType ?? '正式驗收活動',
    contactName: overrides?.contactName ?? '驗收聯絡人',
    contactPhone: overrides?.contactPhone ?? '0900-000-000',
    contactEmail: overrides?.contactEmail ?? 'formal-acceptance@example.com',
    contactLine: overrides?.contactLine ?? 'formal-acceptance-line',
    owner: overrides?.owner ?? 'Formal Acceptance Bot',
    note: overrides?.note ?? 'formal acceptance temp project',
    loadInTime: overrides?.loadInTime ?? '08:30',
  };

  const response = await request.post('/api/projects', { data: payload });
  expect(response.ok()).toBeTruthy();
  const result = await response.json();
  expect(result.ok).toBeTruthy();
  expect(result.project?.id).toBeTruthy();

  return {
    payload,
    project: result.project as { id: string; name: string; code?: string | null },
    routeId: slugifyProjectName(result.project.name as string),
  };
}

export async function cleanupProjectById(projectId: string) {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  try {
    await client.query('begin');
    await client.query(`delete from project_vendor_payment_records where project_id = $1`, [projectId]);
    await client.query(`delete from project_collection_records where project_id = $1`, [projectId]);
    await client.query(`delete from financial_reconciliation_groups where project_id = $1`, [projectId]);
    await client.query(`delete from financial_quotation_line_items where quotation_import_id in (select id from financial_quotation_imports where project_id = $1)`, [projectId]);
    await client.query(`delete from financial_quotation_imports where project_id = $1`, [projectId]);
    await client.query(`delete from task_confirmation_plan_snapshots where task_confirmation_id in (select id from task_confirmations where project_id = $1)`, [projectId]);
    await client.query(`delete from task_confirmations where project_id = $1`, [projectId]);
    await client.query(`delete from design_task_plans where design_task_id in (select id from design_tasks where project_id = $1)`, [projectId]);
    await client.query(`delete from procurement_task_plans where procurement_task_id in (select id from procurement_tasks where project_id = $1)`, [projectId]);
    await client.query(`delete from vendor_task_plans where vendor_task_id in (select id from vendor_tasks where project_id = $1)`, [projectId]);
    await client.query(`delete from design_tasks where project_id = $1`, [projectId]);
    await client.query(`delete from procurement_tasks where project_id = $1`, [projectId]);
    await client.query(`delete from vendor_tasks where project_id = $1`, [projectId]);
    await client.query(`delete from project_requirements where project_id = $1`, [projectId]);
    await client.query(`delete from project_execution_items where project_id = $1`, [projectId]);
    await client.query(`delete from projects where id = $1`, [projectId]);
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}
