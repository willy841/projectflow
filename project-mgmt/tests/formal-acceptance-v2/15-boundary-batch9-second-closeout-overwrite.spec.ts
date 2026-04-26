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

test.describe.serial('formal acceptance v2 · boundary batch9 · second closeout overwrite', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('second closeout overwrites the single retained snapshot after reopen and manual cost change', async ({ request }) => {
    const firstManualName = `batch9 first ${Date.now()}`;
    const secondManualName = `batch9 second ${Date.now()}`;

    await syncManualCosts(request, [
      {
        itemName: firstManualName,
        description: 'first retained manual cost',
        amount: 3456,
        includedInCost: true,
      },
    ]);
    await createCollection(request, `batch9 first closeout ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    let snapshotRows = await queryDb<{ captured_at: string; cost_items: unknown }>(
      `select captured_at::text as captured_at, cost_items
       from financial_closeout_snapshots
       where project_id = $1`,
      [PROJECT_ID],
    );
    expect(snapshotRows).toHaveLength(1);
    const firstCapturedAt = snapshotRows[0]?.captured_at ?? '';
    const firstJson = JSON.stringify(snapshotRows[0]?.cost_items ?? []);
    expect(firstJson).toContain(firstManualName);
    expect(firstJson).toContain('3456');

    await reopenProject(request);

    await syncManualCosts(request, [
      {
        itemName: secondManualName,
        description: 'second retained manual cost',
        amount: 7777,
        includedInCost: true,
      },
    ]);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    snapshotRows = await queryDb<{ captured_at: string; cost_items: unknown }>(
      `select captured_at::text as captured_at, cost_items
       from financial_closeout_snapshots
       where project_id = $1`,
      [PROJECT_ID],
    );
    expect(snapshotRows).toHaveLength(1);
    const secondCapturedAt = snapshotRows[0]?.captured_at ?? '';
    const secondJson = JSON.stringify(snapshotRows[0]?.cost_items ?? []);

    expect(secondCapturedAt).not.toBe(firstCapturedAt);
    expect(secondJson).toContain(secondManualName);
    expect(secondJson).toContain('7777');
    expect(secondJson).not.toContain(firstManualName);
    expect(secondJson).not.toContain('3456');
  });
});
