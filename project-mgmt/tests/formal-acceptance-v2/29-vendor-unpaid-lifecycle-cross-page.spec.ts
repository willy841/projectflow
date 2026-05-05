import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · pack E · vendor unpaid increase/decrease lifecycle', () => {
  test('reconcile increases vendor unpaid and payment decreases it across vendor detail and vendor list', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收廠商未付款生命週期 ${Date.now()}`,
      note: 'vendor unpaid lifecycle cross-page',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [{ title: '設計主線', children: [{ title: '廠商未付款驗收設計項目' }] }],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '廠商未付款驗收設計項目');
      expect(designItem?.id).toBeTruthy();

      const dispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: '廠商未付款驗收設計項目',
          size: 'W120 x H180 cm',
          material: 'PVC',
          quantity: '1 式',
          structure: '立牌',
          note: '廠商未付款生命週期驗收',
        },
      });
      expect(dispatch.ok()).toBeTruthy();
      const taskId = (await dispatch.json()).taskId as string;

      const sync = await request.post(`/api/design-tasks/${taskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `design-plan-${created.project.id}`,
              title: '廠商未付款驗收設計項目',
              size: 'W120 x H180 cm',
              material: 'PVC',
              structure: '立牌',
              quantity: '1 式',
              amount: '12000',
              previewUrl: 'https://example.com/vendor-unpaid-design',
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

      await page.goto('/vendors');
      await expect(page.getByRole('link', { name: VENDOR_NAME })).toBeVisible();

      await page.goto(`/vendors/${VENDOR_ID}`);
      const detailRow = page.getByRole('row', { name: new RegExp(created.project.name) }).first();
      await expect(detailRow).toContainText('$12,000');

      const paymentResponse = await request.post(`/api/vendors/${VENDOR_ID}/payments`, {
        data: {
          projectId: created.project.id,
          paidOn: '2026-05-01',
          amount: 12000,
          note: `正式驗收付款 ${Date.now()}`,
        },
      });
      expect(paymentResponse.ok()).toBeTruthy();
      const payment = await paymentResponse.json() as { ok?: boolean; id?: string };
      expect(payment.ok).toBeTruthy();
      expect(payment.id).toBeTruthy();

      await page.goto('/vendors');
      await expect(page.getByRole('link', { name: VENDOR_NAME })).toBeVisible();

      await page.goto(`/vendors/${VENDOR_ID}`);
      await expect(page.getByRole('row', { name: new RegExp(created.project.name) })).toHaveCount(0);

      const paymentRows = await queryDb<{ amount: number }>(
        `select amount::int as amount from project_vendor_payment_records where project_id = $1 and vendor_id = $2 order by created_at desc limit 1`,
        [created.project.id, VENDOR_ID],
      );
      expect(paymentRows[0]?.amount).toBe(12000);
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
