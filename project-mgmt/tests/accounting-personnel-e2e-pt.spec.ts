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

test.describe('Accounting personnel E2E PT flow', () => {
  test('E2E PT submit -> DB row -> delete inactive', async ({ page }) => {
    test.setTimeout(120_000);

    const employeeRows = await queryDb<{ id: string; name: string }>(
      `select id, name from accounting_personnel_employees where name = 'E2E PT' and is_active = true order by created_at desc limit 1`
    );
    if (!employeeRows.length) throw new Error('E2E PT active employee not found in DB');
    const employeeId = employeeRows[0].id;

    await page.goto('/accounting-center');
    await expect(page.getByRole('heading', { name: '帳務中心' })).toBeVisible();

    await page.getByRole('button', { name: '帳務管理' }).isVisible().catch(() => {});
    await page.getByRole('button', { name: '管銷成本' }).click();
    await page.getByRole('button', { name: '管銷編輯' }).click();
    await page.getByRole('button', { name: '兼職員工' }).click();

    const card = page.getByTestId(`personnel-card-${employeeId}`);
    await expect(card).toBeVisible();
    await card.getByTestId(`personnel-edit-toggle-${employeeId}`).click();

    await expect(page.getByTestId(`personnel-hours-${employeeId}`)).toBeVisible();
    await page.getByTestId(`personnel-hours-${employeeId}`).fill('12');
    await page.getByTestId(`personnel-hourly-${employeeId}`).fill('280');
    const submitButton = page.getByTestId(`personnel-${employeeId}-submit`);
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/accounting-center/);

    await expect.poll(async () => {
      const submittedRows = await queryDb<{ payload_json: { hours: number; hourlyRate: number; totalCost: number } }>(
        `select payload_json from accounting_personnel_records where employee_id = $1 and salary_month = '2026-04' and record_status = 'submitted' order by updated_at desc limit 1`,
        [employeeId],
      );
      return submittedRows[0]?.payload_json ?? null;
    }, { timeout: 15000 }).toMatchObject({ hours: 12, hourlyRate: 280, totalCost: 3360 });

    await page.getByRole('button', { name: '人事' }).click();
    await expect(page.getByText('12 小時')).toBeVisible();
    await expect(page.getByText('$280')).toBeVisible();
    await expect(page.getByText('$3,360')).toBeVisible();

    await page.getByRole('button', { name: '管銷編輯' }).click();
    await page.getByRole('button', { name: '兼職員工' }).click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByTestId(`personnel-card-${employeeId}`).getByTestId(`personnel-delete-${employeeId}`).click();
    await page.waitForLoadState('networkidle');

    const inactiveRows = await queryDb<{ is_active: boolean }>(
      `select is_active from accounting_personnel_employees where id = $1`,
      [employeeId],
    );
    expect(inactiveRows[0]?.is_active).toBe(false);
    await expect(page.getByTestId(`personnel-card-${employeeId}`)).toHaveCount(0);
  });
});
