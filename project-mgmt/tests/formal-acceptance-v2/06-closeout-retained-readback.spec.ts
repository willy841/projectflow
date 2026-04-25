import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
  VENDOR_NAME,
  closeoutProject,
  createCollection,
  ensureFormalAcceptanceBaseline,
  expectProjectVisibleInActiveViews,
  queryDb,
  reopenProject,
  syncAllReconciliationGroups,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 3 · closeout retained readback correctness', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('closeout detail reads retained snapshots and stays frozen to formal closeout truth until reopen', async ({ page, request }) => {
    const collectionNote = `v2 closeout collection ${Date.now()}`;
    await createCollection(request, collectionNote, 43210);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    const closedRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(closedRows[0]?.status).toBe('已結案');

    await page.goto(`/closeouts/${PROJECT_ID}`);
    await expect(page.getByText(PROJECT_NAME)).toBeVisible();
    await expect(page.getByText(collectionNote)).toBeVisible();
    await expect(page.getByText('已結案留存版本')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'POP / 價卡正式輸出方案' }).first()).toBeVisible();
    await page.getByRole('button', { name: /備品/ }).first().click();
    await expect(page.getByRole('cell', { name: '展示架五金正式採購方案' }).first()).toBeVisible();
    await page.getByRole('button', { name: /廠商/ }).first().click();
    await expect(page.getByRole('cell', { name: '展示架主體製作與進場' }).first()).toBeVisible();
    await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '取消結案' })).toBeVisible();

    const retainedRows = await queryDb<{
      item_name: string;
      source_type: '設計' | '備品' | '廠商';
      adjusted_amount: number;
    }>(
      `with latest_confirmations as (
         select distinct on (tc.project_id, tc.flow_type, tc.task_id)
           tc.project_id,
           tc.flow_type,
           tc.task_id,
           tc.id,
           tc.confirmed_at
         from task_confirmations tc
         where tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.project_id, tc.flow_type, tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc
       )
       select coalesce(ts.payload_json->>'title', '') as item_name,
              case
                when lc.flow_type = 'design' then '設計'
                when lc.flow_type = 'procurement' then '備品'
                else '廠商'
              end as source_type,
              coalesce(nullif(ts.payload_json->>'amount', ''), '0')::int as adjusted_amount
       from latest_confirmations lc
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = lc.id
       order by source_type asc, item_name asc`,
      [PROJECT_ID],
    );

    expect(retainedRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ item_name: 'POP / 價卡正式輸出方案', source_type: '設計', adjusted_amount: 12000 }),
        expect.objectContaining({ item_name: '展示架五金正式採購方案', source_type: '備品', adjusted_amount: 11000 }),
        expect.objectContaining({ item_name: '展示架主體製作與進場', source_type: '廠商', adjusted_amount: 20210 }),
      ]),
    );

    await reopenProject(request);

    const reopenedRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(reopenedRows[0]?.status).toBe('執行中');

    await expectProjectVisibleInActiveViews(page);
  });
});
