import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · pack D · reconciliation group integrity', () => {
  test('confirming reconciliation writes status, amountTotal, and itemCount into DB', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收對帳群組完整性 ${Date.now()}`,
      note: 'reconciliation group integrity',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [{ title: '設計主線', children: [{ title: '對帳驗收設計項目' }] }],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '對帳驗收設計項目');
      expect(designItem?.id).toBeTruthy();

      const dispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: '對帳驗收設計項目',
          size: 'W120 x H180 cm',
          material: 'PVC',
          quantity: '1 式',
          structure: '立牌',
          note: '對帳群組完整性驗收',
        },
      });
      expect(dispatch.ok()).toBeTruthy();
      const taskId = (await dispatch.json()).taskId as string;

      const sync = await request.post(`/api/design-tasks/${taskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `design-plan-${created.project.id}`,
              title: '對帳驗收設計項目',
              size: 'W120 x H180 cm',
              material: 'PVC',
              structure: '立牌',
              quantity: '1 式',
              amount: '12000',
              previewUrl: 'https://example.com/reconciliation-design',
              vendor: VENDOR_NAME,
              vendorId: VENDOR_ID,
            },
          ],
        },
      });
      expect(sync.ok()).toBeTruthy();
      expect((await request.post(`/api/design-tasks/${taskId}/confirm`)).ok()).toBeTruthy();

      await page.goto(`/quote-costs/${created.project.id}`);
      await page.getByRole('button', { name: '確認對帳' }).first().click();
      await expect(page.getByRole('button', { name: '已對帳' }).first()).toBeVisible({ timeout: 10000 });

      const rows = await queryDb<{ reconciliation_status: string; amount_total: number; item_count: number }>(
        `select reconciliation_status, amount_total::int as amount_total, item_count::int as item_count
         from financial_reconciliation_groups
         where project_id = $1 and source_type = '設計' and vendor_id = $2
         order by updated_at desc nulls last
         limit 1`,
        [created.project.id, VENDOR_ID],
      );
      expect(rows[0]?.reconciliation_status).toBe('已對帳');
      expect(rows[0]?.amount_total).toBe(12000);
      expect(rows[0]?.item_count).toBe(1);
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
