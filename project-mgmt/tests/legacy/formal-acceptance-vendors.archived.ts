import { expect, test } from '@playwright/test';
import {
  PROJECT_NAME,
  VENDOR_ID,
  VENDOR_NAME,
  ensureFormalAcceptanceBaseline,
  queryDb,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Vendors', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor detail reads unpaid project summary from formal financial source', async ({ page }) => {
    const vendorRows = await queryDb<{
      project_name: string;
      total_items: number;
      design_count: number;
      procurement_count: number;
      vendor_count: number;
    }>(
      `select
         p.name as project_name,
         count(*)::int as total_items,
         count(*) filter (where source_type = '設計')::int as design_count,
         count(*) filter (where source_type = '備品')::int as procurement_count,
         count(*) filter (where source_type = '廠商')::int as vendor_count
       from financial_reconciliation_groups frg
       inner join projects p on p.id = frg.project_id
       where frg.project_id = $1 and frg.vendor_id = $2
       group by p.name`,
      ['11111111-1111-4111-8111-111111111111', VENDOR_ID],
    );

    expect(vendorRows[0]?.project_name).toBe(PROJECT_NAME);
    expect(vendorRows[0]?.design_count).toBe(1);
    expect(vendorRows[0]?.procurement_count).toBe(1);
    expect(vendorRows[0]?.vendor_count).toBe(1);
    expect(vendorRows[0]?.total_items).toBe(3);

    await page.goto(`/vendors/${VENDOR_ID}`);
    await expect(page.getByText('未付款專案')).toBeVisible();
    await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
  });
});
