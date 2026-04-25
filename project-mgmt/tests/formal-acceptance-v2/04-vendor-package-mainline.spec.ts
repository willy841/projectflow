import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  VENDOR_GROUP_ID,
  VENDOR_NAME,
  VENDOR_PACKAGE_ID,
  VENDOR_TASK_ID,
  countConfirmations,
  confirmVendorPlans,
  ensureFormalAcceptanceBaseline,
  getLatestSnapshotRow,
  queryDb,
  syncSingleVendorPlan,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 3 · vendor package mainline', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('vendor group confirm overwrites latest package truth and keeps package/document mainline on retained confirmed payload', async ({
    page,
    request,
  }) => {
    const runId = Date.now();
    const latestTitle = `v2 廠商正式發包 ${runId}`;
    const latestRequirement = `v2 vendor package payload ${runId}：含主體製作、現場安裝、拆除回收。`;

    const beforeCount = await countConfirmations('vendor', VENDOR_TASK_ID);

    await page.goto(`/vendor-assignments/${VENDOR_GROUP_ID}`);
    await page.getByRole('button', { name: '儲存' }).click();
    await expect(page.getByRole('button', { name: '全部確認' })).toBeVisible();

    const afterSaveCount = await countConfirmations('vendor', VENDOR_TASK_ID);
    expect(afterSaveCount).toBe(beforeCount);

    await syncSingleVendorPlan(request, latestTitle, latestRequirement);
    await confirmVendorPlans(request);

    const latestSnapshot = await getLatestSnapshotRow('vendor', VENDOR_TASK_ID);
    expect(latestSnapshot?.title).toBe(latestTitle);
    expect(Number(latestSnapshot?.amount ?? 0)).toBe(20210);
    expect(Number(latestSnapshot?.confirmation_no ?? 0)).toBeGreaterThan(1);

    const quoteCostSourceRows = await queryDb<{ item_name: string; amount: number }>(
      `with latest as (
         select distinct on (tc.task_id)
           tc.task_id,
           tc.id as confirmation_id
         from task_confirmations tc
         where tc.flow_type = 'vendor'
           and tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
       )
       select ts.payload_json->>'title' as item_name,
              coalesce(nullif(ts.payload_json->>'amount', ''), '0')::numeric::int as amount
       from latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.confirmation_id
       order by item_name asc`,
      [PROJECT_ID],
    );
    expect(quoteCostSourceRows.some((row) => row.item_name === latestTitle && row.amount === 20210)).toBeTruthy();

    await page.goto(`/vendor-packages/${VENDOR_PACKAGE_ID}`);
    await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
    await expect(page.locator(`input[value="${latestTitle}"]`)).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: '發包項目整理' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '需求內容' }).first()).toHaveValue(latestRequirement);
    await expect(page.locator('pre')).toContainText(latestRequirement);
    await expect(page.getByRole('button', { name: '複製內容' })).toBeVisible();
    await expect(page.getByRole('button', { name: '匯出 TXT' })).toBeVisible();
  });
});
