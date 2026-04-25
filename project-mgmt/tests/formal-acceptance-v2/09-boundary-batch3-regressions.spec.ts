import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import {
  DESIGN_TASK_ID,
  PROJECT_ID,
  PROJECT_NAME,
  VENDOR_ID,
  VENDOR_NAME,
  closeoutProject,
  confirmDesignPlans,
  createCollection,
  ensureFormalAcceptanceBaseline,
  queryDb,
  reopenProject,
  syncAllReconciliationGroups,
  syncManualCosts,
  syncSingleDesignPlan,
} from './helpers';

function buildHeaderAndTotalOnlyWorkbookBuffer() {
  const rows = [
    ['報價單'],
    ['商品名稱', '單價', '數量', '單位', '金額', '備註'],
    ['總金額', 43210],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '報價單');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

test.describe.serial('formal acceptance v2 · boundary batch3 regressions', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('rejects quotation workbook with headers/total but no real detail rows', async ({ request }) => {
    const response = await request.post(`/api/financial-projects/${PROJECT_ID}/quotation-import`, {
      multipart: {
        file: {
          name: 'header-total-only.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: buildHeaderAndTotalOnlyWorkbookBuffer(),
        },
      },
    });

    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.ok).toBeFalsy();
    expect(String(result.error)).toContain('沒有可成立的正式明細列');
  });

  test('dispatch delete removes downstream ghost confirmations from quote-cost readback', async ({ request, page }) => {
    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByRole('cell', { name: 'POP / 價卡正式輸出方案' }).first()).toBeVisible();

    const deleted = await request.delete(`/api/projects/${PROJECT_ID}/dispatch/design/22222222-2222-4222-8222-222222222221`);
    expect(deleted.ok()).toBeTruthy();

    const rows = await queryDb<{ count: number }>(
      `select count(*)::int as count from task_confirmations where flow_type = 'design' and task_id = $1`,
      [DESIGN_TASK_ID],
    );
    expect(rows[0]?.count ?? 0).toBe(0);

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByRole('cell', { name: 'POP / 價卡正式輸出方案' })).toHaveCount(0);
  });

  test('closeout retained truth stays frozen across manual cost mutation and re-confirm until reopen, then active views restore', async ({ request, page }) => {
    const frozenManualName = `batch3 manual before closeout ${Date.now()}`;
    const mutatedManualName = `batch3 manual after closeout ${Date.now()}`;
    const collectionNote = `batch3 closeout ${Date.now()}`;

    await syncManualCosts(request, [
      { itemName: frozenManualName, description: 'before closeout', amount: 3456, includedInCost: true },
    ]);
    await createCollection(request, collectionNote, 43210);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    await page.goto('/closeouts');
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.getByText('$46,666').first()).toBeVisible();
    await expect(page.getByText('-$3,456').first()).toBeVisible();

    await syncManualCosts(request, [
      { itemName: mutatedManualName, description: 'after closeout', amount: 9999, includedInCost: true },
    ]);
    await syncSingleDesignPlan(request, 'POP / 價卡正式輸出方案（結案後改寫）', VENDOR_NAME, '54321');
    await confirmDesignPlans(request);

    await page.goto('/closeouts');
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.getByText('$46,666').first()).toBeVisible();
    await expect(page.getByText('-$3,456').first()).toBeVisible();

    await page.goto(`/closeouts/${PROJECT_ID}`);
    await expect(page.getByText('已結案留存版本')).toBeVisible();
    await page.getByRole('button', { name: /人工/ }).click();
    await expect(page.locator(`input[value="${frozenManualName}"]`)).toBeVisible();
    await expect(page.locator(`input[value="${mutatedManualName}"]`)).toHaveCount(0);
    await page.getByRole('button', { name: /設計/ }).first().click();
    await expect(page.getByRole('cell', { name: 'POP / 價卡正式輸出方案（結案後改寫）' })).toHaveCount(0);
    await expect(page.getByRole('cell', { name: 'POP / 價卡正式輸出方案' }).first()).toBeVisible();

    await reopenProject(request);

    const reopenedRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(reopenedRows[0]?.status).toBe('執行中');

    await page.goto('/projects');
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();

    const homeAggregateRows = await queryDb<{ activeCount: number; closedCount: number }>(`
      select
        count(*) filter (where coalesce(status, '') not in ('已結案', '結案'))::int as "activeCount",
        count(*) filter (where coalesce(status, '') in ('已結案', '結案'))::int as "closedCount"
      from projects
      where id = $1
    `, [PROJECT_ID]);
    expect(homeAggregateRows[0]?.activeCount).toBe(1);
    expect(homeAggregateRows[0]?.closedCount).toBe(0);

    await page.goto('/closeouts');
    await expect(page.getByText(PROJECT_NAME)).toHaveCount(0);
    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByRole('cell', { name: 'POP / 價卡正式輸出方案（結案後改寫）' }).first()).toBeVisible();
  });
});
