import { test, expect } from '@playwright/test';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test('vendor profile writes to DB and reads back in vendor detail', async ({ request, page }) => {
  const payload = {
    tradeLabel: '輸出',
    contactName: 'Batch1 驗收聯絡人',
    phone: '0912-000-123',
    email: 'batch1-vendor@example.com',
    lineId: '@batch1vendor',
    address: '台北市信義區驗收路 1 號',
    bankName: '國泰世華銀行',
    accountName: '驗收廠商C',
    accountNumber: '123-456-789',
    laborName: '王小驗',
    nationalId: 'A123456789',
    birthDateRoc: '80/01/02',
    unionMembership: '台北市工會',
  };

  const patchResponse = await request.patch(`${BASE_URL}/api/vendors/${VENDOR_ID}`, {
    data: payload,
  });
  expect(patchResponse.ok()).toBeTruthy();
  const patchJson = await patchResponse.json();
  expect(patchJson.ok).toBeTruthy();

  await page.goto(`${BASE_URL}/vendors/${VENDOR_ID}`);
  await expect(page.locator(`input[value="${payload.tradeLabel}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.contactName}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.phone}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.email}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.lineId}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.address}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.bankName}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.accountName}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.accountNumber}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.laborName}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.nationalId}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.birthDateRoc}"]`)).toBeVisible();
  await expect(page.locator(`input[value="${payload.unionMembership}"]`)).toBeVisible();
});
