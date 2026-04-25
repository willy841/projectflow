import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
  closeoutProject,
  createCollection,
  ensureFormalAcceptanceBaseline,
  expectProjectVisibleInActiveViews,
  queryDb,
  reopenProject,
  syncAllReconciliationGroups,
  syncManualCosts,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 4 · closeout list, manual retained costs, and reopen back-switch', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('closeout list reflects retained manual cost totals and reopen sends the project back out of the closeout list', async ({ page, request }) => {
    const manualItemName = `v2 retained manual ${Date.now()}`;
    const manualAmount = 3456;
    const collectionNote = `v2 closeout freeze ${Date.now()}`;

    await syncManualCosts(request, [
      {
        itemName: manualItemName,
        description: '正式驗收人工追加成本',
        amount: manualAmount,
        includedInCost: true,
      },
      {
        itemName: 'v2 excluded manual',
        description: '不應列入成本的人工項',
        amount: 999,
        includedInCost: false,
      },
    ]);
    await createCollection(request, collectionNote, 43210);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    const closedRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(closedRows[0]?.status).toBe('已結案');

    const summaryRows = await queryDb<{
      quotation_total: number;
      project_cost_total: number;
      gross_profit: number;
      manual_cost_total: number;
    }>(
      `with latest_confirmations as (
         select distinct on (tc.project_id, tc.flow_type, tc.task_id)
           tc.project_id,
           tc.flow_type,
           tc.id
         from task_confirmations tc
         where tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.project_id, tc.flow_type, tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc
       ),
       confirmation_costs as (
         select coalesce(sum(coalesce(nullif(ts.payload_json->>'amount', ''), '0')::numeric), 0)::int as total
         from latest_confirmations lc
         inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = lc.id
       ),
       manual_costs as (
         select coalesce(sum(amount) filter (where included_in_cost = true), 0)::int as total
         from financial_manual_costs
         where project_id = $1
       ),
       quotation_totals as (
         select coalesce(total_amount, 0)::int as total
         from financial_quotation_imports
         where project_id = $1 and is_active = true
         limit 1
       )
       select
         coalesce((select total from quotation_totals), 0)::int as quotation_total,
         (coalesce((select total from confirmation_costs), 0) + coalesce((select total from manual_costs), 0))::int as project_cost_total,
         (coalesce((select total from quotation_totals), 0) - (coalesce((select total from confirmation_costs), 0) + coalesce((select total from manual_costs), 0)))::int as gross_profit,
         coalesce((select total from manual_costs), 0)::int as manual_cost_total`,
      [PROJECT_ID],
    );
    expect(summaryRows[0]?.quotation_total).toBe(43210);
    expect(summaryRows[0]?.manual_cost_total).toBe(manualAmount);
    expect(summaryRows[0]?.project_cost_total).toBe(46666);
    expect(summaryRows[0]?.gross_profit).toBe(-3456);

    await page.goto('/closeouts');
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.getByText('$43,210').first()).toBeVisible();
    await expect(page.getByText('$46,666').first()).toBeVisible();
    await expect(page.getByText('-$3,456').first()).toBeVisible();

    await page.goto(`/closeouts/${PROJECT_ID}`);
    await expect(page.getByText('已結案留存版本')).toBeVisible();
    await expect(page.getByText(collectionNote)).toBeVisible();
    await page.getByRole('button', { name: /人工/ }).click();
    await expect(page.getByText('人工最終留存內容')).toBeVisible();
    await expect(page.locator(`input[value="${manualItemName}"]`)).toBeVisible();
    await expect(page.locator('input[type="number"]').first()).toHaveValue('3456');
    await expect(page.locator('input[value="v2 excluded manual"]')).toBeVisible();
    await expect(page.locator('input[type="number"]').nth(1)).toHaveValue('999');

    await reopenProject(request);

    const reopenedRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(reopenedRows[0]?.status).toBe('執行中');

    await page.goto('/closeouts');
    await expect(page.getByText(PROJECT_NAME)).toHaveCount(0);
    await expectProjectVisibleInActiveViews(page);
  });
});
