import { expect, test } from '@playwright/test';
import type { Page, APIRequestContext } from '@playwright/test';
import { Client } from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const PROJECT_NAME = '百貨檔期陳列與贈品備品整合';
const PROJECT_ROUTE = `/projects/${PROJECT_ID}`;
const DESIGN_TASK_ID = '33333333-3333-4333-8333-333333333333';
const PROCUREMENT_TASK_ID = '33333333-3333-4333-8333-333333333334';
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const VENDOR_NAME = '驗收廠商C';
const VENDOR_TASK_ID = '88888888-8888-4888-8888-888888888888';
const VENDOR_PACKAGE_ID = `pkg-${PROJECT_ID}-${VENDOR_ID}`;
const VENDOR_GROUP_ID = `${PROJECT_ID}~${VENDOR_ID}`;
const DESIGN_CONFIRMATION_ID = '55555555-5555-4555-8555-555555555551';
const PROCUREMENT_CONFIRMATION_ID = '55555555-5555-4555-8555-555555555552';

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

function getDatabaseUrl() {
  const databaseUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    readEnvLocalDatabaseUrl();

  if (!databaseUrl) throw new Error('Missing DATABASE_URL for formal acceptance mainline test');
  return databaseUrl;
}

async function queryDb<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

async function expectProjectVisibleInActiveViews(page: Page) {
  await page.goto('/');
  await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();

  await page.goto('/projects');
  await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
}

async function expectSnapshotVendorLinkage(taskConfirmationId: string) {
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

async function createCollection(request: APIRequestContext, note: string, amount: number) {
  const response = await request.post(`/api/accounting/projects/${PROJECT_ID}/collections`, {
    data: {
      collectedOn: '2026-04-16',
      amount,
      note,
    },
  });
  expect(response.ok()).toBeTruthy();
}

test.describe.serial('formal acceptance mainline suite', () => {
  test('covers formal mainline flows from project detail to closeout/reopen/vendors summary', async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);

    await expectSnapshotVendorLinkage(DESIGN_CONFIRMATION_ID);
    await expectSnapshotVendorLinkage(PROCUREMENT_CONFIRMATION_ID);

    await expectProjectVisibleInActiveViews(page);

    await test.step('design → confirm → quote-cost', async () => {
      await page.goto(PROJECT_ROUTE);
      await expect(page.getByText(PROJECT_NAME)).toBeVisible();
      await expect(page.locator('[data-execution-item-id]').first()).toBeVisible();

      await page.goto(`/design-tasks/${DESIGN_TASK_ID}`);
      await expect(page.getByRole('heading', { level: 2, name: 'POP 與價卡完稿' })).toBeVisible();
      await expect(page.getByRole('heading', { level: 3, name: '原始任務資訊' })).toBeVisible();
      await expect(page.getByRole('link', { name: '前往文件' })).toBeVisible();

      await page.goto(`/design-tasks/${DESIGN_TASK_ID}/document`);
      await expect(page.getByText('設計文件')).toBeVisible();
      await expect(page.getByRole('link', { name: '返回任務詳情' })).toBeVisible();

      await page.goto(`/quote-costs/${PROJECT_ID}`);
      await expect(page.getByText('POP / 價卡正式輸出方案').first()).toBeVisible();
    });

    await test.step('procurement → confirm → quote-cost', async () => {
      await page.goto(`/procurement-tasks/${PROCUREMENT_TASK_ID}`);
      await expect(page.getByRole('heading', { level: 2, name: '展示架五金與配件採購' })).toBeVisible();
      await expect(page.getByRole('heading', { level: 3, name: '原始任務資訊' })).toBeVisible();
      await expect(page.getByRole('link', { name: '前往文件' })).toBeVisible();

      await page.goto(`/procurement-tasks/${PROCUREMENT_TASK_ID}/document`);
      await expect(page.getByText('備品文件')).toBeVisible();
      await expect(page.getByRole('link', { name: '返回任務詳情' })).toBeVisible();

      await page.goto(`/quote-costs/${PROJECT_ID}`);
      await expect(page.getByText('展示架五金正式採購方案').first()).toBeVisible();
    });

    await test.step('vendor → assignments → package', async () => {
      const runId = Date.now();
      const packageTitle = `正式驗收廠商發包 ${runId}`;

      const syncPlan = await request.post(`/api/vendor-tasks/${VENDOR_TASK_ID}/sync-plans`, {
        data: {
          plans: [
            {
              id: '99999999-9999-4999-8999-999999999999',
              title: packageTitle,
              requirement: '正式驗收主線：含主體製作、現場安裝、拆除回收。',
              amount: '20210',
              vendorName: VENDOR_NAME,
            },
          ],
        },
      });
      expect(syncPlan.ok()).toBeTruthy();

      const confirmGroup = await request.post(`/api/vendor-groups/${PROJECT_ID}/${VENDOR_ID}/confirm`);
      expect(confirmGroup.ok()).toBeTruthy();

      await page.goto(`/vendor-assignments/${VENDOR_GROUP_ID}`);
      await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
      await expect(page.locator(`input[value="${packageTitle}"]`)).toBeVisible();

      await page.goto(`/vendor-packages/${VENDOR_PACKAGE_ID}`);
      await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
      await expect(page.locator(`input[value="${packageTitle}"]`)).toBeVisible();
    });

    let collectionNote = '';
    await test.step('quote-cost → reconciliation → closeout', async () => {
      collectionNote = `formal acceptance collection ${Date.now()}`;
      await createCollection(request, collectionNote, 43210);

      await page.goto(`/quote-costs/${PROJECT_ID}`);
      await expect(page.getByText(collectionNote)).toBeVisible();
      await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();

      const closeout = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
        data: { expectedOutstandingTotal: 0, expectedReconciliationStatus: '已完成' },
      });
      expect(closeout.ok()).toBeTruthy();

      const statusRows = await queryDb<{ status: string }>(
        `select status from projects where id = $1`,
        [PROJECT_ID],
      );
      expect(statusRows[0]?.status).toBe('已結案');

      await page.goto(`/closeout/${PROJECT_ID}`);
      await expect(page.getByText(PROJECT_NAME)).toBeVisible();
      await expect(page.getByText(collectionNote)).toBeVisible();
    });

    await test.step('closeout → reopen', async () => {
      const reopen = await request.post(`/api/financial-projects/${PROJECT_ID}/reopen`);
      expect(reopen.ok()).toBeTruthy();

      const projectStatusRows = await queryDb<{ status: string }>(
        `select status from projects where id = $1`,
        [PROJECT_ID],
      );
      expect(projectStatusRows[0]?.status).toBe('執行中');

      await expectProjectVisibleInActiveViews(page);
    });

    await test.step('vendors financial summary alignment', async () => {
      const vendorRows = await queryDb<{
        project_name: string;
        total_items: number;
        design_count: number;
        procurement_count: number;
        vendor_count: number;
      }>(
        `select
           p.name as project_name,
           count(*)::int as total_items,
           count(*) filter (where source_type = '設計')::int as design_count,
           count(*) filter (where source_type = '備品')::int as procurement_count,
           count(*) filter (where source_type = '廠商')::int as vendor_count
         from financial_reconciliation_groups frg
         inner join projects p on p.id = frg.project_id
         where frg.project_id = $1 and frg.vendor_id = $2
         group by p.name`,
        [PROJECT_ID, VENDOR_ID],
      );

      expect(vendorRows[0]?.project_name).toBe(PROJECT_NAME);
      expect(vendorRows[0]?.design_count).toBe(1);
      expect(vendorRows[0]?.procurement_count).toBe(1);
      expect(vendorRows[0]?.vendor_count).toBe(1);
      expect(vendorRows[0]?.total_items).toBe(3);

      await page.goto(`/vendors/${VENDOR_ID}`);
      await expect(page.getByText('未付款專案')).toBeVisible();
      await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
    });
  });
});
