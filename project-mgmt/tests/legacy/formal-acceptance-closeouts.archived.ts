import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
  createCollection,
  ensureFormalAcceptanceBaseline,
  expectProjectVisibleInActiveViews,
  queryDb,
} from './formal-acceptance-helpers';

test.describe.serial('formal acceptance · Closeouts', () => {
  test.beforeAll(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('closeout and reopen return the project between retained and active views', async ({ page, request }) => {
    const note = `formal acceptance closeout ${Date.now()}`;
    await createCollection(request, note, 43210);

    const closeout = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
      data: { expectedOutstandingTotal: 0, expectedReconciliationStatus: '已完成' },
    });
    expect(closeout.ok()).toBeTruthy();

    const closedRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(closedRows[0]?.status).toBe('已結案');

    await page.goto(`/closeout/${PROJECT_ID}`);
    await expect(page.getByText(PROJECT_NAME)).toBeVisible();
    await expect(page.getByText(note)).toBeVisible();

    const reopen = await request.post(`/api/financial-projects/${PROJECT_ID}/reopen`);
    expect(reopen.ok()).toBeTruthy();

    const reopenedRows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(reopenedRows[0]?.status).toBe('執行中');

    await expectProjectVisibleInActiveViews(page);
  });
});
