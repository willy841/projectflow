import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  VENDOR_ID,
  VENDOR_NAME,
  createCollection,
  ensureFormalAcceptanceBaseline,
  queryDb,
  syncAllReconciliationGroups,
} from './helpers';

test.describe.serial('formal acceptance v2 · phase 3 · quote-cost mainline', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('quote-cost detail keeps current collection writeback and formal three-family cost readback aligned', async ({ page, request }) => {
    const collectionNote = `v2 quote-cost collection ${Date.now()}`;
    await createCollection(request, collectionNote, 43210);
    await syncAllReconciliationGroups(request);

    const formalLineRows = await queryDb<{
      source_type: '設計' | '備品' | '廠商';
      item_name: string;
      amount: number;
      vendor_name: string | null;
    }>(
      `with latest_design as (
         select distinct on (tc.task_id)
           tc.task_id,
           tc.id as confirmation_id
         from task_confirmations tc
         where tc.flow_type = 'design'
           and tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
       ),
       latest_procurement as (
         select distinct on (tc.task_id)
           tc.task_id,
           tc.id as confirmation_id
         from task_confirmations tc
         where tc.flow_type = 'procurement'
           and tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
       ),
       latest_vendor as (
         select distinct on (tc.task_id)
           tc.task_id,
           tc.id as confirmation_id
         from task_confirmations tc
         where tc.flow_type = 'vendor'
           and tc.project_id = $1
           and tc.status = 'confirmed'
         order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
       )
       select '設計'::text as source_type,
              ts.payload_json->>'title' as item_name,
              coalesce(nullif(ts.payload_json->>'amount', ''), '0')::numeric::int as amount,
              coalesce(nullif(ts.payload_json->>'vendor_name_text', ''), v.name) as vendor_name
       from latest_design latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.confirmation_id
       left join vendors v on v.id = nullif(ts.payload_json->>'vendor_id', '')::uuid
       union all
       select '備品'::text as source_type,
              ts.payload_json->>'title' as item_name,
              coalesce(nullif(ts.payload_json->>'amount', ''), '0')::numeric::int as amount,
              coalesce(nullif(ts.payload_json->>'vendor_name_text', ''), v.name) as vendor_name
       from latest_procurement latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.confirmation_id
       left join vendors v on v.id = nullif(ts.payload_json->>'vendor_id', '')::uuid
       union all
       select '廠商'::text as source_type,
              ts.payload_json->>'title' as item_name,
              coalesce(nullif(ts.payload_json->>'amount', ''), '0')::numeric::int as amount,
              vt.vendor_name_text as vendor_name
       from latest_vendor latest
       inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = latest.confirmation_id
       inner join vendor_task_plans vt on vt.id = ts.source_plan_id
       order by source_type asc, item_name asc`,
      [PROJECT_ID],
    );

    expect(formalLineRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_type: '設計',
          item_name: 'POP / 價卡正式輸出方案',
          amount: 12000,
          vendor_name: VENDOR_NAME,
        }),
        expect.objectContaining({
          source_type: '備品',
          item_name: '展示架五金正式採購方案',
          amount: 11000,
          vendor_name: VENDOR_NAME,
        }),
        expect.objectContaining({
          source_type: '廠商',
          item_name: '展示架主體製作與進場',
          amount: 20210,
          vendor_name: VENDOR_NAME,
        }),
      ]),
    );

    const reconciliationRows = await queryDb<{
      source_type: '設計' | '備品' | '廠商';
      amount_total: number;
      item_count: number;
      reconciliation_status: string;
    }>(
      `select source_type,
              coalesce(amount_total, 0)::int as amount_total,
              coalesce(item_count, 0)::int as item_count,
              reconciliation_status
       from financial_reconciliation_groups
       where project_id = $1 and vendor_id = $2
       order by source_type asc`,
      [PROJECT_ID, VENDOR_ID],
    );

    expect(reconciliationRows).toHaveLength(3);
    expect(reconciliationRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source_type: '設計', reconciliation_status: '已對帳' }),
        expect.objectContaining({ source_type: '備品', reconciliation_status: '已對帳' }),
        expect.objectContaining({ source_type: '廠商', reconciliation_status: '已對帳' }),
      ]),
    );

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText(collectionNote)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'POP / 價卡正式輸出方案' }).first()).toBeVisible();
    await page.getByRole('button', { name: /備品/ }).first().click();
    await expect(page.getByRole('cell', { name: '展示架五金正式採購方案' }).first()).toBeVisible();
    await page.getByRole('button', { name: /廠商/ }).first().click();
    await expect(page.getByRole('cell', { name: '展示架主體製作與進場' }).first()).toBeVisible();
    await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
  });
});
