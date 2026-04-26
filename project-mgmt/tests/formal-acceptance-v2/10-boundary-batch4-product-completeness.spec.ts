import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
  createCollection,
  ensureFormalAcceptanceBaseline,
  queryDb,
  syncAllReconciliationGroups,
} from './helpers';

test.describe.serial('formal acceptance v2 · boundary batch4 · product completeness', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('closeout remains blocked when no collections exist even if all reconciliation groups are already reconciled', async ({ page, request }) => {
    await syncAllReconciliationGroups(request);

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    const closeoutButton = page.getByRole('button', { name: '確認結案' });
    await expect(closeoutButton).toBeDisabled();
    await expect(page.getByText('未收款')).toBeVisible();

    const closeoutResponse = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
      data: {
        expectedOutstandingTotal: 0,
        expectedReconciliationStatus: '已完成',
      },
    });

    expect(closeoutResponse.ok()).toBeFalsy();
    expect(closeoutResponse.status()).toBe(409);
    const payload = await closeoutResponse.json() as { error?: string };
    expect(String(payload.error ?? '')).toContain('outstanding');

    const rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('執行中');
  });

  test('closeout remains blocked when collections are complete but reconciliation is not fully done', async ({ page, request }) => {
    await createCollection(request, `batch4 collection ${Date.now()}`, 43210);

    const revertResponse = await request.post(`/api/financial-projects/${PROJECT_ID}/reconciliation-groups/sync`, {
      data: {
        groups: [
          { sourceType: '設計', vendorId: '77777777-7777-4777-8777-777777777777', vendorName: '驗收廠商C', reconciliationStatus: '已對帳' },
          { sourceType: '備品', vendorId: '77777777-7777-4777-8777-777777777777', vendorName: '驗收廠商C', reconciliationStatus: '待確認' },
          { sourceType: '廠商', vendorId: '77777777-7777-4777-8777-777777777777', vendorName: '驗收廠商C', reconciliationStatus: '已對帳' },
        ],
      },
    });
    if (!revertResponse.ok()) {
      throw new Error(`reconciliation revert failed: ${revertResponse.status()} ${await revertResponse.text()}`);
    }

    const closeoutResponse = await request.post(`/api/financial-projects/${PROJECT_ID}/closeout`, {
      data: {
        expectedOutstandingTotal: 0,
        expectedReconciliationStatus: '已完成',
      },
    });

    expect(closeoutResponse.ok()).toBeFalsy();
    expect(closeoutResponse.status()).toBe(409);
    const payload = await closeoutResponse.json() as { error?: string; reconciliationStatus?: string };
    expect(String(payload.error ?? '')).toContain('reconciliation');
    expect(String(payload.reconciliationStatus ?? '')).toContain('待確認');

    const rows = await queryDb<{ status: string }>(`select status from projects where id = $1`, [PROJECT_ID]);
    expect(rows[0]?.status).toBe('執行中');

    await page.goto(`/quote-costs/${PROJECT_ID}`);
    await expect(page.getByText('已收款')).toBeVisible();
    await expect(page.getByText('未收款')).toBeVisible();
  });

  test('reconciled vendor project drops out of unpaid area when one group is reverted back to unreconciled', async ({ page, request }) => {
    await createCollection(request, `batch4 vendor state ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);

    await page.goto(`/vendors/77777777-7777-4777-8777-777777777777`);
    const unpaidRowBefore = page.getByRole('row', { name: new RegExp(PROJECT_NAME) });
    await expect(unpaidRowBefore).toBeVisible();
    await expect(unpaidRowBefore).toContainText('已對帳 3 筆 / 未對帳 0 筆');

    const res = await request.post(`/api/financial-projects/${PROJECT_ID}/reconciliation-groups/sync`, {
      data: {
        groups: [
          { sourceType: '設計', vendorId: '77777777-7777-4777-8777-777777777777', vendorName: '驗收廠商C', reconciliationStatus: '已對帳' },
          { sourceType: '備品', vendorId: '77777777-7777-4777-8777-777777777777', vendorName: '驗收廠商C', reconciliationStatus: '待確認' },
          { sourceType: '廠商', vendorId: '77777777-7777-4777-8777-777777777777', vendorName: '驗收廠商C', reconciliationStatus: '已對帳' },
        ],
      },
    });
    expect(res.ok()).toBeTruthy();

    await page.goto(`/vendors/77777777-7777-4777-8777-777777777777`);
    await expect(page.getByRole('row', { name: new RegExp(PROJECT_NAME) })).toHaveCount(0);

    const historyResponse = await request.get(`/api/vendors/77777777-7777-4777-8777-777777777777/records?scope=history&includeDetails=false`);
    expect(historyResponse.ok()).toBeTruthy();
    const historyPayload = await historyResponse.json() as { ok?: boolean; records?: Array<{ projectName?: string }> };
    expect(historyPayload.ok).toBeTruthy();
    expect(historyPayload.records?.some((record) => record.projectName === PROJECT_NAME)).toBeFalsy();
  });
});
