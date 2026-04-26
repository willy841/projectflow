import { expect, test } from '@playwright/test';
import {
  PROJECT_ID,
  PROJECT_NAME,
  closeoutProject,
  createCollection,
  ensureFormalAcceptanceBaseline,
  reopenProject,
  syncAllReconciliationGroups,
  syncManualCosts,
} from './helpers';

test.describe.serial('formal acceptance v2 · boundary batch12 · closeout list second closeout', () => {
  test.beforeEach(async () => {
    await ensureFormalAcceptanceBaseline();
  });

  test('closeout list reflects the overwritten retained totals after reopen and second closeout', async ({ page, request }) => {
    await syncManualCosts(request, [
      {
        itemName: `batch12 first ${Date.now()}`,
        description: 'first retained manual cost',
        amount: 3456,
        includedInCost: true,
      },
    ]);
    await createCollection(request, `batch12 first closeout ${Date.now()}`, 43210);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    await page.goto('/closeouts');
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.getByText('$46,666').first()).toBeVisible();
    await expect(page.getByText('-$3,456').first()).toBeVisible();

    await reopenProject(request);

    await syncManualCosts(request, [
      {
        itemName: `batch12 second ${Date.now()}`,
        description: 'second retained manual cost',
        amount: 7777,
        includedInCost: true,
      },
    ]);
    await syncAllReconciliationGroups(request);
    await closeoutProject(request);

    await page.goto('/closeouts');
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible();
    await expect(page.getByText('$50,987').first()).toBeVisible();
    await expect(page.getByText('-$7,777').first()).toBeVisible();
    await expect(page.getByText('$46,666')).toHaveCount(0);
    await expect(page.getByText('-$3,456')).toHaveCount(0);
  });
});
