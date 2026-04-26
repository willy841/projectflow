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

test.describe.serial('formal acceptance v2 · boundary batch10 · manual cost toggle second closeout', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('second closeout reflects included/excluded manual-cost toggle instead of retaining the old included total', async ({ request }) => {
    const manualName = `batch10 toggle ${Date.now()}`;

    await syncManualCosts(request, [
      {
        itemName: manualName,
        description: 'batch10 included first',
        amount: 3456,
        includedInCost: true,
      },
    ]);
    await createCollection(request, `batch10 first closeout ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    let snapshotRows = await queryDb<{ project_cost_total: number; gross_profit: number; cost_items: unknown }>(
      `select project_cost_total::float8 as project_cost_total,
              gross_profit::float8 as gross_profit,
              cost_items
       from financial_closeout_snapshots
       where project_id = $1`,
      [PROJECT_ID],
    );
    expect(snapshotRows).toHaveLength(1);
    expect(Number(snapshotRows[0]?.project_cost_total ?? 0)).toBe(46666);
    expect(Number(snapshotRows[0]?.gross_profit ?? 0)).toBe(-3456);
    expect(JSON.stringify(snapshotRows[0]?.cost_items ?? [])).toContain(manualName);

    await reopenProject(request);

    await syncManualCosts(request, [
      {
        itemName: manualName,
        description: 'batch10 excluded second',
        amount: 3456,
        includedInCost: false,
      },
    ]);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    snapshotRows = await queryDb<{ project_cost_total: number; gross_profit: number; cost_items: unknown }>(
      `select project_cost_total::float8 as project_cost_total,
              gross_profit::float8 as gross_profit,
              cost_items
       from financial_closeout_snapshots
       where project_id = $1`,
      [PROJECT_ID],
    );
    expect(snapshotRows).toHaveLength(1);
    expect(Number(snapshotRows[0]?.project_cost_total ?? 0)).toBe(43210);
    expect(Number(snapshotRows[0]?.gross_profit ?? 0)).toBe(0);

    const costItemsJson = JSON.stringify(snapshotRows[0]?.cost_items ?? []);
    expect(costItemsJson).toContain(manualName);
    expect(costItemsJson).toContain('false');
  });
});
