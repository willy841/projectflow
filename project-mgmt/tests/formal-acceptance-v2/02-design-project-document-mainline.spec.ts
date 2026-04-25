import { expect, test } from '@playwright/test';
import {
  DESIGN_TASK_ID,
  PROJECT_ID,
  countConfirmations,
  confirmDesignPlans,
  ensureFormalAcceptanceBaseline,
  expectProjectDocumentRows,
  getLatestSnapshotRow,
  queryDb,
  syncSingleDesignPlan,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 2 · design project document mainline', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('save alone does not create a new confirmation; full confirm overwrites latest project-level document truth', async ({
    page,
    request,
  }) => {
    const runId = Date.now();
    const latestTitle = `v2 設計正式方案 ${runId}`;

    const beforeCount = await countConfirmations('design', DESIGN_TASK_ID);

    await page.goto(`/design-tasks/${DESIGN_TASK_ID}`);
    await page.getByRole('button', { name: '儲存' }).click();
    await expect(page.getByRole('button', { name: '全部確認' })).toBeVisible();

    const afterSaveCount = await countConfirmations('design', DESIGN_TASK_ID);
    expect(afterSaveCount).toBe(beforeCount);

    await syncSingleDesignPlan(request, latestTitle);
    await confirmDesignPlans(request);

    const latestSnapshot = await getLatestSnapshotRow('design', DESIGN_TASK_ID);
    expect(latestSnapshot?.title).toBe(latestTitle);
    expect(latestSnapshot?.vendor_name_text).toBe('驗收廠商C');
    expect(Number(latestSnapshot?.confirmation_no ?? 0)).toBeGreaterThan(1);

    const documentRows = await expectProjectDocumentRows('design', latestTitle);
    expect(documentRows.some((row) => row.task_title === 'POP 與價卡完稿')).toBeTruthy();

    const quoteCostSourceRows = await queryDb<{ amount: string | null }>(
      `with latest as (
         select id
         from task_confirmations
         where flow_type = 'design' and task_id = $1
         order by confirmation_no desc
         limit 1
       )
       select ts.payload_json->>'amount' as amount
       from latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.id
       order by ts.sort_order asc
       limit 1`,
      [DESIGN_TASK_ID],
    );
    expect(Number(quoteCostSourceRows[0]?.amount ?? 0)).toBe(12000);

    await page.goto(`/projects/${PROJECT_ID}/design-document`);
    await expect(page.getByText('專案設計文件')).toBeVisible();
    await expect(page.getByRole('cell', { name: latestTitle })).toBeVisible();
    await expect(page.getByRole('link', { name: '返回專案詳情' })).toHaveAttribute(
      'href',
      `/projects/${PROJECT_ID}`,
    );
  });
});
