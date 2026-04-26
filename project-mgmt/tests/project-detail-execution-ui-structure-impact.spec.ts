import { test, expect } from '@playwright/test';
import { PROJECT_ROUTE, ensureFormalAcceptanceBaseline } from './formal-acceptance-helpers';

async function openExecutionSection(page: import('@playwright/test').Page) {
  await ensureFormalAcceptanceBaseline();
  await page.goto(PROJECT_ROUTE);
  await expect(page.locator('#project-execution-section')).toBeVisible();
  await expect(page.getByRole('heading', { name: '• 專案執行項目' })).toBeVisible();
}

test.describe('project detail execution UI structure impact', () => {
  test('header-level create/import controls still work after being moved above task area', async ({ page }) => {
    await openExecutionSection(page);

    const executionSection = page.locator('#project-execution-section');
    const taskViewHeading = page.getByRole('heading', { name: '• 專案任務檢視' });

    const createButton = executionSection.getByRole('button', { name: '+ 新增主項目' });
    const importButton = executionSection.getByRole('button', { name: '匯入 .xlsx' });

    await expect(createButton).toBeVisible();
    await expect(importButton).toBeVisible();
    await expect(taskViewHeading).toBeVisible();

    const uniqueTitle = `UI header create ${Date.now()}`;
    await createButton.click();
    await page.getByPlaceholder('輸入主項目名稱，例如：入口主背板').fill(uniqueTitle);
    await page.getByRole('button', { name: '建立' }).click();

    await expect(executionSection.locator('[data-execution-item-id]').filter({ hasText: uniqueTitle })).toBeVisible();

    const fileInput = executionSection.locator('input[type="file"]');
    await expect(fileInput).toHaveCount(1);
    await importButton.click();
    await expect(fileInput).toBeAttached();
  });

  test('adding child item in same row layout still works and keeps actions operable', async ({ page }) => {
    await openExecutionSection(page);

    const executionSection = page.locator('#project-execution-section');
    const firstMainCard = executionSection.locator('[data-execution-item-id]').first();
    await expect(firstMainCard).toBeVisible();

    const expandButton = firstMainCard.getByRole('button', { name: /展開主項目|收合主項目/ });
    await expandButton.click();

    const childDraft = `UI child ${Date.now()}`;
    const addChildBlock = firstMainCard.locator('div').filter({ has: page.getByText('+ 新增次項目', { exact: true }) }).last();
    await addChildBlock.getByPlaceholder('輸入次項目名稱，例如：主背板燈箱版型').fill(childDraft);
    await addChildBlock.getByRole('button', { name: '新增' }).click();

    const childTitle = firstMainCard.getByRole('heading', { name: childDraft, level: 5 });
    await expect(childTitle).toBeVisible();
    const newChildRow = childTitle.locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
    await expect(newChildRow.getByRole('button', { name: '編輯' })).toBeVisible();
    await expect(newChildRow.getByRole('button', { name: '刪除' })).toBeVisible();

    const editedTitle = `${childDraft} edited`;
    await newChildRow.getByRole('button', { name: '編輯' }).click();
    const childEditInput = firstMainCard.locator(`input[value="${childDraft}"]`).first();
    await childEditInput.fill(editedTitle);
    await firstMainCard.getByRole('button', { name: '儲存' }).click();
    await expect(firstMainCard.getByRole('heading', { name: editedTitle, level: 5 })).toBeVisible();

    const editedChildRow = firstMainCard.getByRole('heading', { name: editedTitle, level: 5 }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await editedChildRow.getByRole('button', { name: '刪除' }).click();
    await expect(firstMainCard.getByText(editedTitle, { exact: true })).toHaveCount(0);
  });
});
