import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject, queryDb } from '../formal-acceptance-helpers';

const VENDOR_NAME = '驗收廠商C';

test.describe.serial('formal acceptance v2 · vendor package detail readback', () => {
  test('vendor package detail saves note/items/status and reads back after refresh', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `VENDOR-PACKAGE-READBACK-${Date.now()}`,
      note: 'vendor package detail readback',
    });

    try {
      const executionImport = await request.post(`/api/projects/${created.project.id}/execution-items/import`, {
        data: {
          items: [{ title: '廠商主線', children: [{ title: 'Readback 廠商項目' }] }],
        },
      });
      expect(executionImport.ok()).toBeTruthy();

      const executionRows = await queryDb<{ id: string; title: string; parent_id: string | null }>(
        `select id, title, parent_id from project_execution_items where project_id = $1 order by created_at asc`,
        [created.project.id],
      );
      const vendorItem = executionRows.find((row) => row.parent_id !== null && row.title === 'Readback 廠商項目');
      expect(vendorItem?.id).toBeTruthy();

      const dispatchResponse = await request.post(`/api/projects/${created.project.id}/dispatch`, {
        data: {
          flowType: 'vendor',
          executionItemId: vendorItem!.id,
          title: 'Readback 廠商項目',
          assignee: 'Dora',
          item: '施工',
          vendorName: VENDOR_NAME,
          requirement: '初始需求內容',
          size: '初始規格',
          referenceUrl: 'https://example.com/vendor-source',
          amount: '120000',
        },
      });
      expect(dispatchResponse.ok()).toBeTruthy();
      const dispatchResult = await dispatchResponse.json();

      const confirmResponse = await request.post(`/api/vendor-tasks/${dispatchResult.taskId}/confirm`, {
        data: {},
      });
      expect(confirmResponse.ok()).toBeTruthy();

      const packageId = `pkg-${created.project.id}-77777777-7777-4777-8777-777777777777`;

      await page.goto(`/vendor-packages/${packageId}`);
      await expect(page.getByText(VENDOR_NAME)).toBeVisible();

      await page.getByLabel('項目名稱').fill('正式包件項目');
      await page.getByLabel('需求內容').fill('正式包件需求');
      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      await page.getByLabel('文件整體備註').fill('正式包件備註');
      await page.getByRole('button', { name: '儲存包件內容' }).click();

      await page.getByRole('button', { name: '生成文件' }).click();
      await expect(page.getByText('文件 已生成')).toBeVisible();

      await page.reload();

      await expect(page.getByLabel('項目名稱')).toHaveValue('正式包件項目');
      await expect(page.getByLabel('需求內容')).toHaveValue('正式包件需求');
      await expect(page.getByLabel('文件整體備註')).toHaveValue('正式包件備註');
      await expect(page.getByText('文件 已生成')).toBeVisible();

      const documentRows = await queryDb<{ note: string | null; document_status: string | null }>(
        `select note, document_status from vendor_package_documents where id = $1`,
        [packageId],
      );
      expect(documentRows[0]?.note).toBe('正式包件備註');
      expect(documentRows[0]?.document_status).toBe('已生成');

      const itemRows = await queryDb<{ item_name: string | null; requirement_text: string | null }>(
        `select item_name, requirement_text from vendor_package_document_items where document_id = $1 order by sort_order asc, created_at asc`,
        [packageId],
      );
      expect(itemRows[0]?.item_name).toBe('正式包件項目');
      expect(itemRows[0]?.requirement_text).toBe('正式包件需求');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
