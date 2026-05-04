import { performance } from 'node:perf_hooks';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import type { InsertVendorInput } from '@/lib/db/phase1-inputs';
import type { VendorBasicProfile, VendorProjectRecord } from '@/components/vendor-data';

export type VendorPaymentRecord = {
  id: string;
  projectId: string;
  vendorId: string | null;
  vendorName: string;
  paidOn: string;
  amount: number;
  note: string;
};
import { listDbVendorPackages } from '@/lib/db/vendor-package-adapter';
import { getVendorFinancialSummary } from '@/lib/db/vendor-financial-adapter';

function normalizeVendorName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function ensureVendorTradeCatalogTable() {
  const db = createPhase1DbClient();
  await db.query(`
    create extension if not exists pgcrypto;
    create table if not exists vendor_trade_catalog (
      id uuid primary key default gen_random_uuid(),
      name text not null unique,
      normalized_name text not null unique,
      created_at timestamptz not null default now()
    )
  `);
  await db.query(`create index if not exists idx_vendor_trade_catalog_normalized_name on vendor_trade_catalog (normalized_name)`);
}

function splitTradeLabels(tradeLabel: string | null | undefined) {
  return (tradeLabel ?? '')
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapVendorRowToProfile(vendor: Awaited<ReturnType<ReturnType<typeof createPhase1Repositories>['vendors']['findById']>> extends infer T ? NonNullable<T> : never): VendorBasicProfile {
  const tradeLabels = splitTradeLabels(vendor.trade_label);
  return {
    id: vendor.id,
    name: vendor.name,
    category: tradeLabels[0] || vendor.trade_label?.trim() || '待補充',
    tradeLabel: tradeLabels[0] || vendor.trade_label?.trim() || '待補充',
    tradeLabels,
    contactName: vendor.contact_name ?? '',
    phone: vendor.phone ?? '',
    email: vendor.email ?? '',
    lineId: vendor.line_id ?? '',
    address: vendor.address ?? '',
    note: '',
    bankName: vendor.bank_name ?? '',
    bankCode: '',
    accountName: vendor.account_name ?? '',
    accountNumber: vendor.account_number ?? '',
    laborName: vendor.labor_name ?? '',
    nationalId: vendor.labor_id_no ?? '',
    birthDateRoc: vendor.labor_birthday_roc ?? '',
    unionMembership: vendor.labor_union_membership ?? '',
  } as VendorBasicProfile;
}

export async function listDbVendorTrades(): Promise<string[]> {
  const startedAt = performance.now();
  const db = createPhase1DbClient();
  const hasCatalogStartedAt = performance.now();
  const hasCatalogResult = await db.query<{ exists: string | null }>(`select to_regclass('public.vendor_trade_catalog')::text as exists`);
  const hasCatalogMs = performance.now() - hasCatalogStartedAt;
  const hasCatalog = Boolean(hasCatalogResult.rows[0]?.exists);

  const catalogStartedAt = performance.now();
  const catalogRows = hasCatalog
    ? await db.query<{ name: string }>(`
        select name
        from vendor_trade_catalog
        order by name asc
      `)
    : { rows: [] as { name: string }[] };

  const catalogMs = performance.now() - catalogStartedAt;
  const vendorRowsStartedAt = performance.now();
  const vendorRows = await db.query<{ trade_label: string | null }>(`
    select distinct trade_label
    from vendors
    where trade_label is not null and btrim(trade_label) <> ''
    order by trade_label asc
  `);
  const vendorRowsMs = performance.now() - vendorRowsStartedAt;

  const trades = Array.from(
    new Set(
      [
        ...catalogRows.rows.map((row) => row.name),
        ...vendorRows.rows.flatMap((row) => splitTradeLabels(row.trade_label)),
      ]
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, 'zh-Hant'));

  console.log('[vendor-trades]', JSON.stringify({ hasCatalog, hasCatalogMs: Number(hasCatalogMs.toFixed(1)), catalogMs: Number(catalogMs.toFixed(1)), vendorRowsMs: Number(vendorRowsMs.toFixed(1)), catalogCount: catalogRows.rows.length, vendorTradeRowCount: vendorRows.rows.length, tradeCount: trades.length, totalMs: Number((performance.now() - startedAt).toFixed(1)) }));
  return trades;
}

export async function createDbVendorTrade(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('工種名稱不可空白');
  }

  await ensureVendorTradeCatalogTable();
  const db = createPhase1DbClient();
  const normalizedName = normalizeVendorName(trimmedName);
  const duplicated = await db.query<{ name: string }>(`
    select name
    from vendor_trade_catalog
    where normalized_name = $1
    limit 1
  `, [normalizedName]);
  if (duplicated.rows[0]) {
    throw new Error(`工種「${duplicated.rows[0].name}」已存在`);
  }

  await db.query(`
    insert into vendor_trade_catalog (name, normalized_name)
    values ($1, $2)
  `, [trimmedName, normalizedName]);

  return { name: trimmedName };
}

export async function deleteDbVendorTrade(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('工種名稱不可空白');
  }

  await ensureVendorTradeCatalogTable();
  const db = createPhase1DbClient();
  const usage = await db.query<{ count: string }>(`
    select count(*)::text as count
    from vendors
    where trade_label = $1
  `, [trimmedName]);
  const usageCount = Number(usage.rows[0]?.count ?? '0');
  if (usageCount > 0) {
    throw new Error(`工種「${trimmedName}」仍有 ${usageCount} 間廠商使用中，無法刪除`);
  }

  await db.query(`delete from vendor_trade_catalog where name = $1`, [trimmedName]);
  return { name: trimmedName };
}

export async function createDbVendor(input: { name: string; tradeLabel?: string | null }) {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error('廠商名稱不可空白');
  }

  const normalizedName = normalizeVendorName(trimmedName);
  const duplicated = await repositories.vendors.findByNormalizedName(normalizedName);
  if (duplicated) {
    throw new Error(`廠商「${duplicated.name}」已存在`);
  }

  const tradeLabel = input.tradeLabel?.trim() || null;
  if (tradeLabel) {
    await ensureVendorTradeCatalogTable();
    const db = createPhase1DbClient();
    await db.query(`
      insert into vendor_trade_catalog (name, normalized_name)
      values ($1, $2)
      on conflict (name) do nothing
    `, [tradeLabel, normalizeVendorName(tradeLabel)]);
  }

  const vendor = await repositories.vendors.insert({
    name: trimmedName,
    normalized_name: normalizedName,
    trade_label: tradeLabel,
    contact_name: null,
    phone: null,
    email: null,
    line_id: null,
    address: null,
    bank_name: null,
    account_name: null,
    account_number: null,
    labor_name: null,
    labor_id_no: null,
    labor_birthday_roc: null,
    labor_union_membership: null,
  } satisfies InsertVendorInput);

  return mapVendorRowToProfile(vendor);
}

export async function listDbVendors(): Promise<VendorBasicProfile[]> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);
  const vendors = await repositories.vendors.list();

  const vendorProfiles = await Promise.all(
    vendors.map(async (vendor) => {
      const [financial, paymentRecords] = await Promise.all([
        getVendorFinancialSummary({ vendorId: vendor.id, vendorName: vendor.name }),
        listDbVendorPaymentRecordsByVendorId(vendor.id),
      ]);

      const paidAmountByProjectId = new Map<string, number>();
      for (const record of paymentRecords) {
        paidAmountByProjectId.set(record.projectId, (paidAmountByProjectId.get(record.projectId) ?? 0) + record.amount);
      }

      const outstandingTotal = financial.records.reduce((sum, record) => {
        const paidAmount = paidAmountByProjectId.get(record.projectId) ?? 0;
        const unpaidAmount = Math.max(record.adjustedCost - paidAmount, 0);
        return sum + unpaidAmount;
      }, 0);

      return {
        ...mapVendorRowToProfile(vendor),
        outstandingTotal,
      };
    }),
  );

  return vendorProfiles as VendorBasicProfile[];
}

export async function getDbVendorById(id: string): Promise<VendorBasicProfile | null> {
  const startedAt = performance.now();
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const vendor = await repositories.vendors.findById(id);
  console.log('[vendor-base-query]', JSON.stringify({ vendorId: id, found: Boolean(vendor), totalMs: Number((performance.now() - startedAt).toFixed(1)) }));
  if (!vendor) return null;

  return mapVendorRowToProfile(vendor);
}

export async function listDbVendorPaymentRecordsByVendorId(vendorId: string): Promise<VendorPaymentRecord[]> {
  const startedAt = performance.now();
  const vendorLookupStartedAt = performance.now();
  const vendor = await getDbVendorById(vendorId);
  const vendorLookupMs = performance.now() - vendorLookupStartedAt;
  if (!vendor) return [];
  const db = createPhase1DbClient();
  const queryStartedAt = performance.now();
  const result = await db.query<VendorPaymentRecord>(`
    select id, project_id as "projectId", vendor_id as "vendorId", vendor_name as "vendorName", to_char(paid_on, 'YYYY-MM-DD') as "paidOn", amount::float8 as amount, coalesce(note, '') as note
    from project_vendor_payment_records
    where vendor_id = $1 or (vendor_id is null and vendor_name = $2)
    order by paid_on desc, created_at desc
  `, [vendorId, vendor.name]);
  const queryMs = performance.now() - queryStartedAt;
  console.log('[vendor-payment-records]', JSON.stringify({ vendorId, vendorName: vendor.name, vendorLookupMs: Number(vendorLookupMs.toFixed(1)), queryMs: Number(queryMs.toFixed(1)), rowCount: result.rows.length, totalMs: Number((performance.now() - startedAt).toFixed(1)) }));
  return result.rows;
}

export async function listDbVendorProjectRecordsByVendorId(
  vendorId: string,
  options?: {
    paymentRecords?: VendorPaymentRecord[];
    paymentScope?: 'all' | 'open' | 'history';
    includeDetails?: boolean;
    recordId?: string;
  },
): Promise<VendorProjectRecord[]> {
  const startedAt = performance.now();
  const vendorLookupStartedAt = performance.now();
  const vendor = await getDbVendorById(vendorId);
  const vendorLookupMs = performance.now() - vendorLookupStartedAt;
  if (!vendor) return [];

  const fanoutStartedAt = performance.now();
  const includeDetails = options?.includeDetails ?? false;
  const [financial, paymentRecords, vendorTasks] = await Promise.all([
    getVendorFinancialSummary({ vendorId, vendorName: vendor.name }),
    options?.paymentRecords ? Promise.resolve(options.paymentRecords) : listDbVendorPaymentRecordsByVendorId(vendorId),
    includeDetails
      ? (async () => {
          const db = createPhase1DbClient();
          const result = await db.query<{ projectId: string; title: string; requirementText: string }>(`
            select
              vt.project_id as "projectId",
              vt.title,
              coalesce(vt.requirement_text, '') as "requirementText"
            from vendor_tasks vt
            where vt.vendor_id = $1
            order by vt.project_id asc, vt.created_at asc
          `, [vendorId]);
          return result.rows;
        })()
      : Promise.resolve([] as Array<{ projectId: string; title: string; requirementText: string }>),
  ]);

  const fanoutMs = performance.now() - fanoutStartedAt;

  if (!financial.records.length) {
    console.log('[vendor-project-records]', JSON.stringify({
      vendorId,
      vendorName: vendor.name,
      vendorLookupMs: Number(vendorLookupMs.toFixed(1)),
      fanoutMs: Number(fanoutMs.toFixed(1)),
      packageMs: 0,
      mapMs: 0,
      financialProjectCount: 0,
      packageCount: 0,
      paymentCount: paymentRecords.length,
      taskCount: vendorTasks.length,
      includeDetails,
      paymentScope: options?.paymentScope ?? 'all',
      recordId: options?.recordId ?? null,
      returnedCount: 0,
      shortCircuitedOnEmptyFinancials: true,
      totalMs: Number((performance.now() - startedAt).toFixed(1)),
    }));
    return [];
  }

  const packagesStartedAt = performance.now();
  const packages = await listDbVendorPackages();
  const packageMs = performance.now() - packagesStartedAt;

  const packageByProjectId = new Map(
    packages.filter((pkg) => pkg.vendorId === vendorId).map((pkg) => [pkg.projectId, pkg]),
  );
  const tasksByProjectId = new Map<string, Array<{ title: string; requirementText: string }>>();
  for (const task of vendorTasks) {
    const current = tasksByProjectId.get(task.projectId) ?? [];
    current.push({ title: task.title, requirementText: task.requirementText });
    tasksByProjectId.set(task.projectId, current);
  }
  const paidAmountByProjectId = new Map<string, number>();
  for (const record of paymentRecords) {
    paidAmountByProjectId.set(record.projectId, (paidAmountByProjectId.get(record.projectId) ?? 0) + record.amount);
  }

  const mapStartedAt = performance.now();
  const mapped = financial.records.map((financialRecord) => {
    const pkg = packageByProjectId.get(financialRecord.projectId);
    const projectTasks = tasksByProjectId.get(financialRecord.projectId) ?? [];
    const sourceItemDetails = includeDetails
      ? [
          ...financialRecord.costItems.map((item) => item.sourceRef || item.itemName).filter(Boolean),
          ...projectTasks.map((task) => task.requirementText || task.title).filter(Boolean),
        ]
      : [];

    const paidAmount = paidAmountByProjectId.get(financialRecord.projectId) ?? 0;
    const unpaidAmount = Math.max(financialRecord.adjustedCost - paidAmount, 0);
    const totalReconciledCount = financialRecord.reconciledGroupCount;
    const totalUnreconciledCount = financialRecord.unreconciledGroupCount;
    const paymentStatus = !financialRecord.hasUnreconciledGroups && paidAmount >= financialRecord.adjustedCost
      ? '已付款'
      : '未付款';

    return {
      id: pkg?.id ?? `vendor-record-${financialRecord.projectId}-${vendorId}`,
      vendorId,
      vendorName: vendor.name,
      projectId: financialRecord.projectId,
      projectName: financialRecord.projectName,
      projectStatus: financialRecord.projectStatus,
      adjustedCost: financialRecord.adjustedCost,
      adjustedCostLabel: financialRecord.adjustedCostLabel,
      reconciliationSummary: `已對帳群組 ${totalReconciledCount} 筆 / 未對帳群組 ${totalUnreconciledCount} 筆`,
      reconciliationStatus: financialRecord.hasUnreconciledGroups ? '尚未全部對帳' : '已全部對帳',
      sourceItemDetails: includeDetails ? (sourceItemDetails.length ? sourceItemDetails : ['待補充']) : [],
      costBreakdown: includeDetails
        ? (financialRecord.costItems.length
          ? financialRecord.costItems.map((item) => ({
              label: `${item.sourceType}｜${item.itemName}`,
              amount: `NT$ ${item.adjustedAmount.toLocaleString('zh-TW')}`,
            }))
          : [{ label: '尚無已對帳成本', amount: 'NT$ 0' }])
        : [],
      paymentStatus,
      hasUnreconciledGroups: financialRecord.hasUnreconciledGroups,
      reconciliationWarning: financialRecord.hasUnreconciledGroups ? '此專案內該廠商尚未全部對帳' : null,
      packageId: pkg?.id,
      paidAmount,
      unpaidAmount,
    } satisfies VendorProjectRecord;
  });
  const filtered = mapped.filter((record) => {
    if (options?.recordId && record.id !== options.recordId) return false;

    const isFullyPaidSemanticState = !record.hasUnreconciledGroups && (record.paidAmount ?? 0) >= record.adjustedCost;

    switch (options?.paymentScope) {
      case 'open':
        return !isFullyPaidSemanticState;
      case 'history':
        return isFullyPaidSemanticState;
      default:
        return true;
    }
  });

  const mapMs = performance.now() - mapStartedAt;
  console.log('[vendor-project-records]', JSON.stringify({
    vendorId,
    vendorName: vendor.name,
    vendorLookupMs: Number(vendorLookupMs.toFixed(1)),
    fanoutMs: Number(fanoutMs.toFixed(1)),
    packageMs: Number(packageMs.toFixed(1)),
    mapMs: Number(mapMs.toFixed(1)),
    financialProjectCount: financial.records.length,
    packageCount: packages.length,
    paymentCount: paymentRecords.length,
    taskCount: vendorTasks.length,
    includeDetails,
    paymentScope: options?.paymentScope ?? 'all',
    recordId: options?.recordId ?? null,
    returnedCount: filtered.length,
    totalMs: Number((performance.now() - startedAt).toFixed(1)),
  }));
  return filtered;
}
