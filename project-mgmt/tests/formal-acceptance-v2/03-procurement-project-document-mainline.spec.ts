import { expect, test } from '@playwright/test';
import {
  PROCUREMENT_TASK_ID,
  PROJECT_ID,
  VENDOR_NAME,
  countConfirmations,
  confirmProcurementPlans,
  ensureFormalAcceptanceBaseline,
  expectProjectDocumentRows,
  queryDb,
  syncSingleProcurementPlan,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 2 · procurement project document mainline', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('save alone does not create a new confirmation; full confirm overwrites latest project-level procurement document truth', async ({
    page,
    request,
  }) => {
    const runId = Date.now();
    const latestTitle = `v2 備品正式方案 ${runId}`;

    const beforeCount = await countConfirmations('procurement', PROCUREMENT_TASK_ID);

    await page.goto(`/procurement-tasks/${PROCUREMENT_TASK_ID}`);
    await page.getByRole('button', { name: '儲存' }).click();
    await expect(page.getByRole('button', { name: '全部確認' })).toBeVisible();

    const afterSaveCount = await countConfirmations('procurement', PROCUREMENT_TASK_ID);
    expect(afterSaveCount).toBe(beforeCount);

    await syncSingleProcurementPlan(request, latestTitle);
    await confirmProcurementPlans(request);

    const latestSnapshotRows = await queryDb<{
      confirmation_no: number;
      title: string | null;
      vendor_name_text: string | null;
      amount: string | null;
    }>(
      `with latest as (
         select id, confirmation_no
         from task_confirmations
         where flow_type = 'procurement' and task_id = $1
         order by confirmation_no desc, confirmed_at desc, created_at desc, id desc
         limit 1
       )
       select latest.confirmation_no,
              ts.payload_json->>'title' as title,
              ts.payload_json->>'vendor_name_text' as vendor_name_text,
              ts.payload_json->>'amount' as amount
       from latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.id
       order by ts.sort_order asc`,
      [PROCUREMENT_TASK_ID],
    );
    expect(latestSnapshotRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: latestTitle,
          vendor_name_text: VENDOR_NAME,
        }),
      ]),
    );
    expect(Number(latestSnapshotRows[0]?.confirmation_no ?? 0)).toBeGreaterThan(1);
    expect(latestSnapshotRows.some((row) => Number(row.amount ?? 0) === 11000)).toBeTruthy();

    const documentRows = await expectProjectDocumentRows('procurement', latestTitle);
    expect(documentRows.some((row) => row.task_title === '展示架五金與配件採購')).toBeTruthy();

    const quoteCostSourceRows = await queryDb<{ amount: string | null }>(
      `with latest as (
         select id
         from task_confirmations
         where flow_type = 'procurement' and task_id = $1
         order by confirmation_no desc
         limit 1
       )
       select ts.payload_json->>'amount' as amount
       from latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.id
       order by ts.sort_order asc
       limit 1`,
      [PROCUREMENT_TASK_ID],
    );
    expect(Number(quoteCostSourceRows[0]?.amount ?? 0)).toBe(11000);

    await page.goto(`/projects/${PROJECT_ID}/procurement-document`);
    await expect(page.getByText('專案備品文件')).toBeVisible();
    await expect(page.getByRole('cell', { name: latestTitle })).toBeVisible();
    await expect(page.getByRole('link', { name: '返回專案詳情' })).toHaveAttribute(
      'href',
      `/projects/${PROJECT_ID}`,
    );
  });
});
