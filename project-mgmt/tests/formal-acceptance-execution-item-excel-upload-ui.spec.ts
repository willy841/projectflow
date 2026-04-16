import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  ensureFormalAcceptanceBaseline,
  queryDb,
} from './formal-acceptance-helpers';

function buildExecutionImportWorkbookBuffer() {
  const rows = [
    ['報價明細'],
    ['項次', '商品名', '單價', '數量', '單位', '金額'],
    ['1.', '入口主視覺與導視', '', '', '', ''],
    ['1-1', '入口背板輸出', '12000', '1', '式', '12000'],
    ['1-2', '導視立牌製作', '3000', '2', '座', '6000'],
    ['2.', '贈品區陳列', '', '', '', ''],
    ['2-1', '陳列桌卡', '500', '10', '張', '5000'],
    ['總計', '', '', '', '', '23000'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '報價單');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

test.describe.serial('formal acceptance · Execution Item Excel Upload UI', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('project detail supports real front-end xlsx upload preview and import confirmation', async ({ page, request }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收 UI Excel 上傳 ${Date.now()}`,
      note: 'formal acceptance execution item excel upload ui',
    });

    try {
      await page.goto(`/projects/${created.project.id}`);
      await expect(page.getByRole('button', { name: '匯入 .xlsx' })).toBeVisible();

      await page.locator('input[type="file"][accept*="spreadsheetml.sheet"]').setInputFiles({
        name: 'formal-upload.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: buildExecutionImportWorkbookBuffer(),
      });

      await expect(page.getByRole('heading', { name: '預覽' })).toBeVisible();
      await expect(page.getByText('mainItems：2')).toBeVisible();
      await expect(page.getByText('入口主視覺與導視', { exact: true })).toBeVisible();
      await expect(page.getByText('入口背板輸出', { exact: true })).toBeVisible();
      await expect(page.getByText('贈品區陳列', { exact: true })).toBeVisible();

      await page.getByRole('button', { name: '確認匯入' }).click();
      await expect(page.getByRole('heading', { name: '預覽' })).not.toBeVisible();

      await expect(page.getByText('入口主視覺與導視').first()).toBeVisible();
      await expect(page.getByText('贈品區陳列').first()).toBeVisible();

      const mainRows = await queryDb<{ title: string; parent_id: string | null; sort_order: number }>(
        `select title, parent_id, sort_order
         from project_execution_items
         where project_id = $1 and parent_id is null
         order by sort_order asc`,
        [created.project.id],
      );
      expect(mainRows.map((row) => row.title)).toEqual(['入口主視覺與導視', '贈品區陳列']);

      const childRows = await queryDb<{ title: string }>(
        `select child.title
         from project_execution_items child
         inner join project_execution_items parent on parent.id = child.parent_id
         where child.project_id = $1
         order by parent.sort_order asc, child.sort_order asc`,
        [created.project.id],
      );
      expect(childRows.map((row) => row.title)).toEqual(['入口背板輸出', '導視立牌製作', '陳列桌卡']);
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
