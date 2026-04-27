import { expect, test } from '@playwright/test';
import {
  DESIGN_TASK_ID,
  PROJECT_ID,
  countConfirmations,
  ensureFormalAcceptanceBaseline,
  expectProjectDocumentRows,
  getLatestSnapshotRow,
  queryDb,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 2 · design project document mainline', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('save branch via replace-plans keeps save != confirm, resolves vendor identity, and only confirmed truth reaches downstream document + quote-cost UI', async ({
    page,
  }) => {
    const runId = Date.now();
    const latestTitle = `v2 設計正式方案 ${runId}`;

    const beforeCount = await countConfirmations('design', DESIGN_TASK_ID);

    const replaceResponse = await page.request.post(`/api/design-tasks/${DESIGN_TASK_ID}/replace-plans`, {
      data: {
        plans: [
          {
            title: latestTitle,
            size: 'W120 x H180 cm / A6',
            material: 'PVC 輸出 / 紙卡',
            structure: '桌上立牌 + 吊卡',
            quantity: '1 式',
            amount: '12000',
            previewUrl: 'https://example.com/formal-acceptance/design/preview',
            vendor: '驗收廠商C',
          },
        ],
      },
    });
    expect(replaceResponse.ok()).toBeTruthy();

    await page.goto(`/design-tasks/${DESIGN_TASK_ID}`);
    await expect(page.getByRole('button', { name: '全部確認' })).toBeVisible();

    const persistedPlanRows = await queryDb<{ title: string; vendor_id: string | null; vendor_name_text: string | null }>(
      `select title, vendor_id, vendor_name_text
       from design_task_plans
       where design_task_id = $1
       order by sort_order asc`,
      [DESIGN_TASK_ID],
    );
    expect(persistedPlanRows[0]?.title).toBe(latestTitle);
    expect(persistedPlanRows[0]?.vendor_name_text).toBe('驗收廠商C');
    expect(persistedPlanRows[0]?.vendor_id).toBeTruthy();

    const afterSaveCount = await countConfirmations('design', DESIGN_TASK_ID);
    expect(afterSaveCount).toBe(beforeCount);

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByRole('cell', { name: latestTitle })).toHaveCount(0);

    await page.goto(`/design-tasks/${DESIGN_TASK_ID}`);
    await page.getByRole('button', { name: '全部確認' }).click();
    await expect(page).toHaveURL(`/projects/${PROJECT_ID}/design-document`);

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

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByRole('cell', { name: latestTitle }).first()).toBeVisible();
  });
});
