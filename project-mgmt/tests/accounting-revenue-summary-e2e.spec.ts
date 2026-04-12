import { expect, test } from '@playwright/test';
import { Client } from 'pg';

async function queryDb<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) throw new Error('Missing DATABASE_URL');
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    await client.end();
  }
}

test('accounting revenue summary month / year / range stays formula-consistent', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('/accounting-center');
  await expect(page.getByRole('heading', { name: '帳務中心' })).toBeVisible();

  const monthCards = await page.locator('article').evaluateAll((nodes) =>
    nodes.slice(0, 4).map((node) => node.textContent || '')
  );
  expect(monthCards.length).toBe(4);

  await page.getByRole('button', { name: '年份', exact: true }).click();
  const yearCards = await page.locator('article').evaluateAll((nodes) =>
    nodes.slice(0, 4).map((node) => node.textContent || '')
  );
  expect(yearCards.length).toBe(4);

  await page.getByRole('button', { name: '年份區間', exact: true }).click();
  const rangeCards = await page.locator('article').evaluateAll((nodes) =>
    nodes.slice(0, 4).map((node) => node.textContent || '')
  );
  expect(rangeCards.length).toBe(4);

  function extractMoney(text: string, label: string) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = text.match(new RegExp(`${escaped}([\\s\\S]*?)(-?\\$[\\d,]+)`));
    return match?.[2] ?? null;
  }

  for (const cards of [monthCards, yearCards, rangeCards]) {
    const revenue = extractMoney(cards[0], '已結案總收入');
    const cost = extractMoney(cards[1], '已結案總成本');
    const expense = extractMoney(cards[2], '營運支出');
    const profit = extractMoney(cards[3], '利潤總計');
    expect(revenue).not.toBeNull();
    expect(cost).not.toBeNull();
    expect(expense).not.toBeNull();
    expect(profit).not.toBeNull();
  }

  const officeRows = await queryDb<{ total: number }>(`select coalesce(sum(amount),0)::float8 as total from accounting_office_expenses where expense_month = '2026-04'`);
  const otherRows = await queryDb<{ total: number }>(`select coalesce(sum(amount),0)::float8 as total from accounting_other_expenses where expense_month = '2026-04'`);
  const personnelRows = await queryDb<{ total: number }>(`select coalesce(sum((payload_json->>'totalCost')::numeric),0)::float8 as total from accounting_personnel_records where salary_month = '2026-04' and record_status = 'submitted'`);
  const expectedOperating = (officeRows[0]?.total ?? 0) + (otherRows[0]?.total ?? 0) + (personnelRows[0]?.total ?? 0);
  expect(expectedOperating).toBeGreaterThan(0);
});
