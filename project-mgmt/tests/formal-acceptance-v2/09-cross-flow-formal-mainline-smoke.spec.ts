import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
  VENDOR_ID,
  VENDOR_NAME,
  VENDOR_PACKAGE_ID,
  closeoutProject,
  confirmDesignPlans,
  confirmProcurementPlans,
  confirmVendorPlans,
  createCollection,
  ensureFormalAcceptanceBaseline,
  queryDb,
  syncAllReconciliationGroups,
  syncSingleDesignPlan,
  syncSingleProcurementPlan,
  syncSingleVendorPlan,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 5 · cross-flow formal mainline smoke', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('latest confirmed cross-flow truth stays aligned from project documents to vendor unpaid, quote-cost, and closeout list', async ({
    page,
    request,
  }) => {
    const runId = Date.now();
    const designTitle = `v2 cross 設計 ${runId}`;
    const procurementTitle = `v2 cross 備品 ${runId}`;
    const vendorTitle = `v2 cross 廠商 ${runId}`;
    const vendorRequirement = `v2 cross vendor payload ${runId}：含主體製作、進場安裝、拆除回收。`;
    const collectionNote = `v2 cross collection ${runId}`;

    await syncSingleDesignPlan(request, designTitle, VENDOR_NAME, '12000');
    await confirmDesignPlans(request);

    await syncSingleProcurementPlan(request, procurementTitle, VENDOR_NAME, '11000');
    await confirmProcurementPlans(request);

    await syncSingleVendorPlan(request, vendorTitle, vendorRequirement, '20210');
    await confirmVendorPlans(request);

    await syncAllReconciliationGroups(request);
    await createCollection(request, collectionNote, 43210);

    const latestRows = await queryDb<{
      flow_type: 'design' | 'procurement' | 'vendor';
      title: string;
      amount: number;
    }>(
      `with latest as (
         select distinct on (tc.flow_type, tc.task_id)
           tc.flow_type,
           tc.task_id,
           tc.id as confirmation_id
         from task_confirmations tc
         where tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.flow_type, tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
       )
       select latest.flow_type,
              coalesce(ts.payload_json->>'title', '') as title,
              coalesce(nullif(ts.payload_json->>'amount', ''), '0')::numeric::int as amount
       from latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.confirmation_id
       order by latest.flow_type asc, ts.sort_order asc`,
      [PROJECT_ID],
    );

    expect(latestRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flow_type: 'design', title: designTitle, amount: 12000 }),
        expect.objectContaining({ flow_type: 'procurement', title: procurementTitle, amount: 11000 }),
        expect.objectContaining({ flow_type: 'vendor', title: vendorTitle, amount: 20210 }),
      ]),
    );

    await page.goto(`/projects/${PROJECT_ID}/design-document`);
    await expect(page.getByRole('cell', { name: designTitle })).toBeVisible();

    await page.goto(`/projects/${PROJECT_ID}/procurement-document`);
    await expect(page.getByRole('cell', { name: procurementTitle })).toBeVisible();

    await page.goto(`/vendor-packages/${VENDOR_PACKAGE_ID}`);
    await expect(page.locator(`input[value="${vendorTitle}"]`)).toBeVisible();
    await expect(page.getByRole('textbox', { name: '需求內容' }).first()).toHaveValue(vendorRequirement);

    await page.goto(`/vendors/${VENDOR_ID}`);
    const unpaidRow = page.getByRole('row', { name: new RegExp(PROJECT_NAME) });
    await expect(unpaidRow).toContainText('已對帳 3 筆 / 未對帳 0 筆');
    await expect(unpaidRow).toContainText('已全部對帳');
    await unpaidRow.getByRole('button', { name: '查看明細' }).click();
    const projectDetailsRow = unpaidRow.locator('xpath=following-sibling::tr[1]');
    await expect(projectDetailsRow.getByText('成本明細')).toBeVisible();
    await expect(projectDetailsRow.getByText('發包內容明細')).toBeVisible();

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText(collectionNote)).toBeVisible();
    await expect(page.getByRole('cell', { name: designTitle }).first()).toBeVisible();
    await page.getByRole('button', { name: /備品/ }).first().click();
    await expect(page.getByRole('cell', { name: procurementTitle }).first()).toBeVisible();
    await page.getByRole('button', { name: /廠商/ }).first().click();
    await expect(page.getByRole('cell', { name: vendorTitle }).first()).toBeVisible();
    await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '確認結案' })).toBeEnabled();

    await closeoutProject(request);

    const closeoutRows = await queryDb<{ status: string }>(
      `select status from projects where id = $1`,
      [PROJECT_ID],
    );
    expect(closeoutRows[0]?.status).toBe('已結案');

    await page.goto('/closeouts');
    const closeoutRow = page.getByRole('row', { name: new RegExp(PROJECT_NAME) });
    await expect(closeoutRow).toBeVisible();
    await expect(closeoutRow).toContainText('$43,210');

    await page.goto(`/closeouts/${PROJECT_ID}`);
    await expect(page.getByText('已結案留存版本')).toBeVisible();
    await expect(page.getByText(collectionNote)).toBeVisible();
    await expect(page.getByRole('cell', { name: designTitle }).first()).toBeVisible();
    await page.getByRole('button', { name: /備品/ }).first().click();
    await expect(page.getByRole('cell', { name: procurementTitle }).first()).toBeVisible();
    await page.getByRole('button', { name: /廠商/ }).first().click();
    await expect(page.getByRole('cell', { name: vendorTitle }).first()).toBeVisible();
  });
});
