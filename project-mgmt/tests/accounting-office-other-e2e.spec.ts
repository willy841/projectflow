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

test.describe('Accounting office / other db-first closure', () => {
  test('office category + office expense + other expense CRUD readback', async ({ page }) => {
    test.setTimeout(120_000);

    const categoryName = `E2E Office Cat ${Date.now()}`;
    const officeItem = `E2E Office Item ${Date.now()}`;
    const otherItem = `E2E Other Item ${Date.now()}`;

    await page.goto('/accounting-center?workspaceTab=operating-expenses&expenseTab=editor');
    await expect(page.getByRole('heading', { name: '帳務中心' })).toBeVisible();

    await page.getByRole('button', { name: '庶務編輯' }).click();
    await page.getByRole('button', { name: '管理分類' }).click();
    await page.getByPlaceholder('新增分類名稱').fill(categoryName);
    await page.getByRole('button', { name: '新增分類' }).click();

    await expect.poll(async () => {
      const rows = await queryDb<{ name: string }>(`select name from accounting_office_categories where name = $1 and is_active = true`, [categoryName]);
      return rows.length;
    }, { timeout: 15000 }).toBe(1);

    await page.goto('/accounting-center?workspaceTab=operating-expenses&expenseTab=editor');
    await page.getByRole('button', { name: '庶務編輯' }).click();
    await page.getByRole('button', { name: '新增支出' }).click();
    const officeModal = page.locator('div').filter({ has: page.getByRole('heading', { name: '新增庶務支出' }) }).last();
    const officeTextboxes = officeModal.getByRole('textbox');
    await officeTextboxes.nth(0).fill(officeItem);
    await officeModal.getByRole('combobox').fill(categoryName);
    await officeTextboxes.nth(1).fill('1234');
    await officeTextboxes.nth(2).fill('office note');
    const officeRequestPromise = page.waitForResponse((response) => response.url().includes('/api/accounting/office-expenses') && response.request().method() === 'POST');
    await officeModal.getByRole('button', { name: '建立支出' }).click();
    const officeResponse = await officeRequestPromise;
    expect(officeResponse.ok()).toBeTruthy();

    await expect.poll(async () => {
      const rows = await queryDb<{ item_name: string; amount: number; note: string }>(
        `select item_name, amount::float8 as amount, coalesce(note, '') as note from accounting_office_expenses where expense_month = '2026-04' and item_name = $1 order by created_at desc limit 1`,
        [officeItem],
      );
      return rows[0] ?? null;
    }, { timeout: 15000 }).toMatchObject({ item_name: officeItem, amount: 1234, note: 'office note' });

    await page.getByRole('button', { name: '其他編輯' }).click();
    await page.getByRole('button', { name: '新增支出' }).click();
    const otherModal = page.locator('div').filter({ has: page.getByRole('heading', { name: '新增其他支出' }) }).last();
    const otherInputs = otherModal.getByRole('textbox');
    await otherInputs.nth(0).fill(otherItem);
    await otherInputs.nth(1).fill('5678');
    await otherInputs.nth(2).fill('other note');
    await otherModal.getByRole('button', { name: '建立支出' }).click();

    await expect.poll(async () => {
      const rows = await queryDb<{ item_name: string; amount: number; note: string }>(
        `select item_name, amount::float8 as amount, coalesce(note, '') as note from accounting_other_expenses where expense_month = '2026-04' and item_name = $1 order by created_at desc limit 1`,
        [otherItem],
      );
      return rows[0] ?? null;
    }, { timeout: 15000 }).toMatchObject({ item_name: otherItem, amount: 5678, note: 'other note' });

    await page.goto('/accounting-center?workspaceTab=operating-expenses&expenseTab=office');
    const officeRow = page.getByRole('row', { name: new RegExp(`${officeItem}.*${categoryName}.*\\$1,234`) });
    await expect(officeRow).toBeVisible();

    await page.goto('/accounting-center?workspaceTab=operating-expenses&expenseTab=other');
    const otherRow = page.getByRole('row', { name: new RegExp(`${otherItem}.*\\$5,678.*other note`) });
    await expect(otherRow).toBeVisible();
  });
});
