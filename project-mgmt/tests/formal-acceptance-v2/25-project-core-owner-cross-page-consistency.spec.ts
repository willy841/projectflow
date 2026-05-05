import { expect, test } from '@playwright/test';
import { cleanupProjectById, createFormalAcceptanceTempProject } from '../formal-acceptance-helpers';

test.describe.serial('formal acceptance v2 · pack A · project core owner cross-page consistency', () => {
  test('editing project owner stays consistent across detail, reopen edit, projects list, and home overview', async ({ request, page }) => {
    const created = await createFormalAcceptanceTempProject(request, {
      name: `正式驗收專案負責人一致性 ${Date.now()}`,
      owner: 'Owner Before Edit',
      note: 'project owner cross-page consistency',
    });

    try {
      const patch = await request.patch(`/api/projects/${created.project.id}`, {
        data: {
          name: created.payload.name,
          client: created.payload.client,
          eventDate: created.payload.eventDate,
          location: created.payload.location,
          loadInTime: created.payload.loadInTime,
          eventType: created.payload.eventType,
          contactName: created.payload.contactName,
          contactPhone: created.payload.contactPhone,
          contactEmail: created.payload.contactEmail,
          contactLine: created.payload.contactLine,
          owner: 'Owner After Edit',
          status: '執行中',
        },
      });
      expect(patch.ok()).toBeTruthy();

      await page.goto(`/projects/${created.routeId}`);
      await page.reload();
      await page.getByRole('button', { name: '編輯專案' }).click();
      await expect(page.getByLabel('專案負責人')).toHaveValue('Owner After Edit');

      await page.goto('/projects');
      const row = page.locator('tr').filter({ has: page.getByRole('link', { name: created.project.name }) }).first();
      await expect(row).toContainText('Owner After Edit');
      await expect(row).not.toContainText('Owner Before Edit');

      await page.goto('/');
      const homeRow = page.locator('tr').filter({ has: page.getByRole('link', { name: created.project.name }) }).first();
      await expect(homeRow).toBeVisible();
      await expect(homeRow).toContainText('Owner After Edit');

      await page.goto(`/projects/${created.routeId}`);
      await page.reload();
      await page.getByRole('button', { name: '編輯專案' }).click();
      await expect(page.getByLabel('專案負責人')).toHaveValue('Owner After Edit');
    } finally {
      await cleanupProjectById(created.project.id);
    }
  });
});
