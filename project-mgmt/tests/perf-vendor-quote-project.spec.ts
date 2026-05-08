import { test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const VENDOR_ID = '77777777-7777-4777-8777-777777777777';
const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

async function measure(page: import('@playwright/test').Page, path: string) {
  const started = Date.now();
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  const totalMs = Date.now() - started;
  return {
    path,
    ok: response?.ok() ?? false,
    status: response?.status() ?? null,
    totalMs,
  };
}

test('perf baseline for vendor / quote / project detail', async ({ page }) => {
  const vendor = await measure(page, `/vendors/${VENDOR_ID}`);
  const quote = await measure(page, `/quote-costs/${PROJECT_ID}`);
  const project = await measure(page, `/projects/${PROJECT_ID}`);
  console.log('[perf-baseline]', JSON.stringify({ vendor, quote, project }));

  const reportDir = test.info().outputDir;
  const perfLogPath = path.join(reportDir, 'perf-baseline.json');
  fs.writeFileSync(perfLogPath, JSON.stringify({ vendor, quote, project }, null, 2));
});
