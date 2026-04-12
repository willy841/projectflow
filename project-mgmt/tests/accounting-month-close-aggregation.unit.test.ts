import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAccountingMonthCloseRows } from '../src/lib/accounting-month-close.ts';
import type { QuoteCostProject } from '../src/components/quote-cost-data.ts';

function makeProject(overrides: Partial<QuoteCostProject>): QuoteCostProject {
  return {
    id: overrides.id ?? 'project-1',
    projectCode: overrides.projectCode ?? 'PF-001',
    projectName: overrides.projectName ?? '測試專案',
    clientName: overrides.clientName ?? '測試客戶',
    eventDate: overrides.eventDate ?? '2026-04-15',
    projectStatus: overrides.projectStatus ?? '執行中',
    quotationImported: overrides.quotationImported ?? true,
    quotationImport: overrides.quotationImport ?? null,
    quotationItems: overrides.quotationItems ?? [],
    costItems: overrides.costItems ?? [],
    reconciliationStatus: overrides.reconciliationStatus ?? '未開始',
    closeStatus: overrides.closeStatus ?? '未結案',
    note: overrides.note ?? '',
  };
}

test('month close rows include same-month closed projects and exclude non-month projects', () => {
  const rows = buildAccountingMonthCloseRows(
    [
      makeProject({
        id: 'b-project',
        projectName: 'B 已結案專案',
        projectStatus: '已結案',
        eventDate: '2026-04-20',
        quotationItems: [{ id: 'q1', itemName: '報價', quantity: 2, unitPrice: 50000 }],
      }),
      makeProject({
        id: 'a-project',
        projectName: 'A 執行中專案',
        projectStatus: '執行中',
        eventDate: '2026-04-10',
        quotationItems: [{ id: 'q2', itemName: '報價', quantity: 1, unitPrice: 120000 }],
      }),
      makeProject({
        id: 'c-project',
        projectName: 'C 非該月專案',
        projectStatus: '執行中',
        eventDate: '2026-05-01',
        quotationItems: [{ id: 'q3', itemName: '報價', quantity: 1, unitPrice: 999999 }],
      }),
    ],
    new Map([
      ['a-project', 20000],
      ['b-project', 60000],
      ['c-project', 999999],
    ]),
    '2026-04',
  );

  assert.deepEqual(
    rows.map((row) => row.projectId),
    ['a-project', 'b-project'],
  );
  assert.equal(rows[0]?.projectName, 'A 執行中專案');
  assert.equal(rows[1]?.projectName, 'B 已結案專案');
});

test('month close rows read back total / collected / outstanding with zero fallback', () => {
  const rows = buildAccountingMonthCloseRows(
    [
      makeProject({
        id: 'full-project',
        projectName: '完整案例',
        eventDate: '2026-04-18',
        quotationItems: [{ id: 'q1', itemName: '報價', quantity: 3, unitPrice: 100000 }],
      }),
      makeProject({
        id: 'missing-project',
        projectName: '缺值案例',
        eventDate: '2026-04-22',
        quotationItems: [],
      }),
    ],
    new Map([
      ['full-project', 120000],
    ]),
    '2026-04',
  );

  const full = rows.find((row) => row.projectId === 'full-project');
  const missing = rows.find((row) => row.projectId === 'missing-project');

  assert.ok(full);
  assert.equal(full.totalAmount, 300000);
  assert.equal(full.collectedAmount, 120000);
  assert.equal(full.outstandingAmount, 180000);

  assert.ok(missing);
  assert.equal(missing.totalAmount, 0);
  assert.equal(missing.collectedAmount, 0);
  assert.equal(missing.outstandingAmount, 0);

  const summary = rows.reduce(
    (acc, row) => {
      acc.total += row.totalAmount;
      acc.collected += row.collectedAmount;
      acc.outstanding += row.outstandingAmount;
      return acc;
    },
    { total: 0, collected: 0, outstanding: 0 },
  );

  assert.deepEqual(summary, {
    total: 300000,
    collected: 120000,
    outstanding: 180000,
  });
});
