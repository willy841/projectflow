import { test, expect } from '@playwright/test';

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('密碼').fill(password);
  await page.getByRole('button', { name: '登入' }).click();
}

test('owner can see system settings and accounting center entry after login', async ({ page }) => {
  await login(page, 'willy@kuya.tw', 'ChangeMeNow!2026');
  await page.waitForURL(/\/reset-password|\/$/);

  if (page.url().includes('/reset-password')) {
    await page.getByLabel('新密碼').fill('OwnerPass!2026');
    await page.getByLabel('再次輸入新密碼').fill('OwnerPass!2026');
    await page.getByRole('button', { name: '更新密碼並進入系統' }).click();
    await page.waitForURL(/\/$/);
  }

  await expect(page.getByText('willy@kuya.tw')).toBeVisible();
  await expect(page.getByRole('link', { name: '系統設定' })).toBeVisible();
  await expect(page.getByRole('link', { name: '帳務中心' })).toBeVisible();
});

test('member cannot see admin entries and is blocked from system settings', async ({ page }) => {
  await login(page, 'member-test@kuya.tw', 'MemberPass!2026');
  await page.waitForURL(/\/$/);

  await expect(page.getByText('member-test@kuya.tw')).toBeVisible();
  await expect(page.getByRole('link', { name: '系統設定' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: '帳務中心' })).toHaveCount(0);

  await page.goto('/system-settings');
  await page.waitForURL(/\/forbidden/);
  await expect(page.getByRole('heading', { name: '你目前沒有權限進入這個區域' })).toBeVisible();
});
