import { test, expect } from '@playwright/test';
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
  if (!databaseUrl) throw new Error('Missing DATABASE_URL for quote-cost batch2 test');
  return databaseUrl;
}

async function queryOne<T>(sql: string, params: unknown[] = []) {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows[0] ?? null;
  } finally {
    await client.end();
  }
}

test('batch2 closeout gating + write path works with DB truth', async ({ page, request, baseURL }) => {
  const before = await queryOne<{ status: string }>('select status from projects where id = $1', [PROJECT_ID]);
  expect(before).not.toBeNull();

  const closeoutPage = `${baseURL}/quote-costs/${PROJECT_ID}`;
  await page.goto(closeoutPage);
  await expect(page.getByText('報價成本')).toBeVisible();

  const closeButton = page.getByRole('button', { name: '確認結案' });
  await expect(closeButton).toBeVisible();

  const positiveHint = page.getByText(/已符合結案條件/);
  const negativeHint = page.getByText(/尚未符合結案條件/);
  const positiveVisible = await positiveHint.isVisible().catch(() => false);
  const negativeVisible = await negativeHint.isVisible().catch(() => false);

  if (positiveVisible) {
    await expect(closeButton).toBeEnabled();
  } else {
    expect(negativeVisible).toBeTruthy();
    await expect(closeButton).toBeDisabled();
  }

  const forced = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
    data: {
      expectedOutstandingTotal: 999999,
      expectedReconciliationStatus: '待確認',
    },
  });
  expect(forced.ok()).toBeFalsy();

  const forcedJson = await forced.json();
  expect(['stale-outstanding-total', 'stale-reconciliation-status', 'outstanding-not-zero', 'reconciliation-not-complete']).toContain(forcedJson.error);

  const after = await queryOne<{ status: string }>('select status from projects where id = $1', [PROJECT_ID]);
  expect(after?.status).toBe(before?.status);
});
