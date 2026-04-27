import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';
const VENDOR_ID = '77777777-7777-4777-8777-777777777777';

test.describe.serial('formal acceptance v2 · phase 6 · new project branch-complete readback and click-path coverage', () => {
  test('fresh project acceptance verifies non-happy-path branches, downstream UI readback, and sub-item click-path usability', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收分支完整新案 ${Date.now()}`,
      note: 'fresh project branch-complete validation',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [
            {
              title: '新案主項目',
              children: [
                { title: '新案子項目設計' },
                { title: '新案子項目廠商' },
              ],
            },
          ],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id
         from project_execution_items
         where project_id = $1
         order by created_at asc`,
        [created.project.id],
      );
      const designItem = executionRows.find((row) => row.parent_id !== null && row.title === '新案子項目設計');
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === '新案子項目廠商');
      expect(designItem?.id).toBeTruthy();
      expect(vendorItem?.id).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      const firstExecutionItem = page.locator('[data-execution-item-id]').first();
      await firstExecutionItem.getByRole('button', { name: /展開主項目|收合主項目/ }).click();
      const childTitleText = firstExecutionItem.getByText('新案子項目設計');
      await expect(childTitleText).toBeVisible();
      const childCard = childTitleText.locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
      await childCard.getByRole('button', { name: '交辦' }).click();
      const designMenuItem = page.locator('button').filter({ hasText: /^設計$/ }).last();
      await expect(designMenuItem).toBeVisible();
      await designMenuItem.click();
      await expect(page.getByLabel('關閉交辦抽屜')).toBeVisible();
      await expect(page.getByText('設計交辦', { exact: true })).toBeVisible();

      const designDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'design',
          executionItemId: designItem!.id,
          title: '新案子項目設計',
          size: 'W120 x H180 cm',
          material: 'PVC',
          quantity: '1 式',
          structure: '立牌',
          referenceUrl: 'https://example.com/design',
          note: 'branch complete design dispatch',
        },
      });
      expect(designDispatch.ok()).toBeTruthy();
      const designTaskId = (await designDispatch.json()).taskId as string;

      const vendorDispatch = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'vendor',
          executionItemId: vendorItem!.id,
          title: '新案子項目廠商',
          requirement: '場撤與安裝',
          amount: '18888',
          vendorName: VENDOR_NAME,
          note: 'branch complete vendor dispatch',
        },
      });
      expect(vendorDispatch.ok()).toBeTruthy();
      const vendorTaskId = (await vendorDispatch.json()).taskId as string;

      const replacePlans = await request.post(`/api/design-tasks/${designTaskId}/replace-plans`, {
        data: {
          plans: [
            {
              title: '新案設計 replace-plans 分支正式版',
              size: 'W120 x H180 cm',
              material: 'PVC',
              structure: '立牌',
              quantity: '1 式',
              amount: '16666',
              previewUrl: 'https://example.com/design/replace',
              vendor: VENDOR_NAME,
            },
          ],
        },
      });
      expect(replacePlans.ok()).toBeTruthy();

      const replacePlanRows = await queryDb<{ vendor_id: string | null; vendor_name_text: string | null }>(
        `select vendor_id, vendor_name_text
         from design_task_plans
         where design_task_id = $1
         order by sort_order asc`,
        [designTaskId],
      );
      expect(replacePlanRows[0]?.vendor_name_text).toBe(VENDOR_NAME);
      expect(replacePlanRows[0]?.vendor_id).toBe(VENDOR_ID);

      const designBeforeConfirm = await queryDb<{ count: number }>(
        `select count(*)::int as count
         from task_confirmations
         where flow_type = 'design' and task_id = $1`,
        [designTaskId],
      );
      expect(designBeforeConfirm[0]?.count ?? 0).toBe(0);

      await page.goto(`/quote-costs/${created.project.id}`);
      await expect(page.getByRole('cell', { name: '新案設計 replace-plans 分支正式版' })).toHaveCount(0);

      const designConfirm = await request.post(`/api/design-tasks/${designTaskId}/confirm`);
      expect(designConfirm.ok()).toBeTruthy();

      await request.post(`/api/vendor-tasks/${vendorTaskId}/sync-plans`, {
        data: {
          plans: [
            {
              id: `plan-vendor-branch-${created.project.id}`,
              title: '新案廠商 downstream readback 正式版',
              requirement: '場撤與安裝 downstream readback',
              amount: '18888',
              vendorName: VENDOR_NAME,
            },
          ],
        },
      });
      const vendorConfirm = await request.post(`/api/vendor-groups/${created.project.id}/${VENDOR_ID}/confirm`);
      expect(vendorConfirm.ok()).toBeTruthy();

      await page.goto(`/projects/${created.routeId}/design-document`);
      await expect(page.getByRole('cell', { name: '新案設計 replace-plans 分支正式版' }).first()).toBeVisible();

      await page.goto(`/quote-costs/${created.project.id}`);
      await expect(page.getByRole('cell', { name: '新案設計 replace-plans 分支正式版' }).first()).toBeVisible();
      await page.getByRole('button', { name: /廠商/ }).first().click();
      await expect(page.getByRole('cell', { name: '新案廠商 downstream readback 正式版' }).first()).toBeVisible();
      await expect(page.getByText(VENDOR_NAME).first()).toBeVisible();
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
