import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  closeoutProject,
  createCollection,
  ensureFormalAcceptanceBaseline,
  queryDb,
  reopenProject,
  syncAllReconciliationGroups,
  syncManualCosts,
} from './helpers';

test.describe.serial('formal acceptance v2 · boundary batch8 · manual cost reopen readback', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('reopen does not mutate retained manual-cost snapshot or leak retained-only totals back into active cost truth', async ({ request }) => {
    const retainedManualName = `batch8 retained ${Date.now()}`;
    await syncManualCosts(request, [
      {
        itemName: retainedManualName,
        description: 'batch8 retained manual cost',
        amount: 3456,
        includedInCost: true,
      },
    ]);
    await createCollection(request, `batch8 closeout ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    let statusRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(statusRows[0]?.status).toBe('已結案');

    const retainedRows = await queryDb<{ cost_items: unknown; reconciliation_groups: unknown }>(
      `select cost_items, reconciliation_groups
       from financial_closeout_snapshots
       where project_id = $1`,
      [PROJECT_ID],
    );
    expect(retainedRows).toHaveLength(1);
    const retainedJson = JSON.stringify({
      costItems: retainedRows[0]?.cost_items ?? [],
      reconciliationGroups: retainedRows[0]?.reconciliation_groups ?? [],
    });
    expect(retainedJson).toContain(retainedManualName);
    expect(retainedJson).toContain('3456');

    await reopenProject(request);

    statusRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(statusRows[0]?.status).toBe('執行中');

    const retainedRowsAfterReopen = await queryDb<{ cost_items: unknown; reconciliation_groups: unknown }>(
      `select cost_items, reconciliation_groups
       from financial_closeout_snapshots
       where project_id = $1`,
      [PROJECT_ID],
    );
    expect(retainedRowsAfterReopen).toHaveLength(1);
    const retainedJsonAfterReopen = JSON.stringify({
      costItems: retainedRowsAfterReopen[0]?.cost_items ?? [],
      reconciliationGroups: retainedRowsAfterReopen[0]?.reconciliation_groups ?? [],
    });
    expect(retainedJsonAfterReopen).toContain(retainedManualName);
    expect(retainedJsonAfterReopen).toContain('3456');

    const activeManualRows = await queryDb<{ item_name: string; amount: number; included_in_cost: boolean }>(
      `select item_name, amount::float8 as amount, included_in_cost
       from financial_manual_costs
       where project_id = $1`,
      [PROJECT_ID],
    );
    expect(activeManualRows.some((row) => row.item_name === retainedManualName && Number(row.amount) === 3456 && row.included_in_cost === true)).toBeTruthy();

    const closeoutListRows = await queryDb<{ status: string }>(
      `select status from projects where id = $1`,
      [PROJECT_ID],
    );
    expect(closeoutListRows[0]?.status).toBe('執行中');
  });
});
