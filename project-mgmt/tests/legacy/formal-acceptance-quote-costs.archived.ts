import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  VENDOR_NAME,
  createCollection,
  ensureFormalAcceptanceBaseline,
  queryDb,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Quote Costs', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('quote-cost detail accepts collection writeback and keeps financial group readback', async ({ page, request }) => {
    const collectionNote = `formal acceptance collection ${Date.now()}`;
    await createCollection(request, collectionNote, 43210);

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText(collectionNote)).toBeVisible();
    await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();

    const vendorRows = await queryDb<{
      total_items: number;
      design_count: number;
      procurement_count: number;
      vendor_count: number;
    }>(
      `select
         count(*)::int as total_items,
         count(*) filter (where source_type = '設計')::int as design_count,
         count(*) filter (where source_type = '備品')::int as procurement_count,
         count(*) filter (where source_type = '廠商')::int as vendor_count
       from financial_reconciliation_groups
       where project_id = $1 and vendor_id = $2`,
      [PROJECT_ID, '77777777-7777-4777-8777-777777777777'],
    );

    expect(vendorRows[0]?.design_count).toBe(1);
    expect(vendorRows[0]?.procurement_count).toBe(1);
    expect(vendorRows[0]?.vendor_count).toBe(1);
    expect(vendorRows[0]?.total_items).toBe(3);
  });
});
