import { expect, test } from '@playwright/test';
import * as XLSX from 'xlsx';
import {
  cleanupProjectById,
  createFormalAcceptanceTempProject,
  ensureFormalAcceptanceBaseline,
} from './formal-acceptance-helpers';

function buildMalformedQuotationWorkbookBuffer() {
  const rows = [
    ['報價單'],
    ['品名', '單價', '數量', '單位', '金額'],
    ['主背板輸出', '12000', '1', '式', '12000'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '報價單');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

test.describe.serial('formal acceptance · Quote quotation import validation', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('malformed quotation workbook returns validation-class 400 with clear message', async ({ request }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收 報價匯入格式錯誤 ${Date.now()}`,
      note: 'formal acceptance quotation import validation',
    });

    try {
      const response = await request.post(`/api/financial-projects/${created.project.id}/quotation-import`, {
        multipart: {
          file: {
            name: 'malformed-quotation.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: buildMalformedQuotationWorkbookBuffer(),
          },
        },
      });

      expect(response.status()).toBe(400);
      const result = await response.json();
      expect(result.ok).toBeFalsy();
      expect(result.error).toContain('找不到六欄標題');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
