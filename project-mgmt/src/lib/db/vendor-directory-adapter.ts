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
import { listDbVendorTasksByProject } from '@/lib/db/vendor-flow-adapter';
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
  const db = createPhase1DbClient();
  const hasCatalogResult = await db.query<{ exists: string | null }>(`select to_regclass('public.vendor_trade_catalog')::text as exists`);
  const hasCatalog = Boolean(hasCatalogResult.rows[0]?.exists);

  const catalogRows = hasCatalog
    ? await db.query<{ name: string }>(`
        select name
        from vendor_trade_catalog
        order by name asc
      `)
    : { rows: [] as { name: string }[] };

  const vendorRows = await db.query<{ trade_label: string | null }>(`
    select distinct trade_label
    from vendors
    where trade_label is not null and btrim(trade_label) <> ''
    order by trade_label asc
  `);

  return Array.from(
    new Set(
      [
        ...catalogRows.rows.map((row) => row.name),
        ...vendorRows.rows.flatMap((row) => splitTradeLabels(row.trade_label)),
      ]
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
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

  const outstandingRows = await db.query<{ vendorId: string | null; vendorName: string; outstandingTotal: number }>(`
    with latest_confirmations as (
      select distinct on (tc.project_id, tc.flow_type, tc.task_id)
        tc.project_id,
        tc.flow_type,
        tc.task_id,
        tc.id
      from task_confirmations tc
      where tc.status = 'confirmed'
      order by tc.project_id, tc.flow_type, tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.id desc
    ),
    latest_vendor_snapshots as (
      select
        lc.project_id,
        coalesce(v.id, null) as vendor_id,
        coalesce(v.name, trim(ts.payload_json ->> 'vendorName')) as vendor_name,
        coalesce(sum((nullif(ts.payload_json ->> 'amount', '')::numeric)), 0)::float8 as adjusted_cost
      from latest_confirmations lc
      inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = lc.id
      left join vendors v on lower(regexp_replace(coalesce(v.name, ''), '\s+', ' ', 'g')) = lower(regexp_replace(coalesce(trim(ts.payload_json ->> 'vendorName'), ''), '\s+', ' ', 'g'))
      where lc.flow_type = 'vendor'
        and coalesce(trim(ts.payload_json ->> 'vendorName'), '') <> ''
      group by lc.project_id, v.id, coalesce(v.name, trim(ts.payload_json ->> 'vendorName'))
    ),
    paid_rows as (
      select
        project_id,
        vendor_id,
        vendor_name,
        coalesce(sum(amount), 0)::float8 as paid_amount
      from project_vendor_payment_records
      group by project_id, vendor_id, vendor_name
    )
    select
      lvs.vendor_id as "vendorId",
      lvs.vendor_name as "vendorName",
      coalesce(sum(greatest(lvs.adjusted_cost - coalesce(pr.paid_amount, 0), 0)), 0)::float8 as "outstandingTotal"
    from latest_vendor_snapshots lvs
    left join paid_rows pr
      on pr.project_id = lvs.project_id
     and (
       (pr.vendor_id is not null and pr.vendor_id = lvs.vendor_id)
       or (pr.vendor_id is null and pr.vendor_name = lvs.vendor_name)
     )
    group by lvs.vendor_id, lvs.vendor_name
  `);

  const outstandingByVendorId = new Map<string, number>();
  const outstandingByVendorName = new Map<string, number>();
  for (const row of outstandingRows.rows) {
    if (row.vendorId) outstandingByVendorId.set(row.vendorId, row.outstandingTotal ?? 0);
    outstandingByVendorName.set(row.vendorName, row.outstandingTotal ?? 0);
  }

  return vendors.map((vendor) => ({
    ...mapVendorRowToProfile(vendor),
    outstandingTotal: outstandingByVendorId.get(vendor.id) ?? outstandingByVendorName.get(vendor.name) ?? 0,
  })) as VendorBasicProfile[];
}

export async function getDbVendorById(id: string): Promise<VendorBasicProfile | null> {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const vendor = await repositories.vendors.findById(id);
  if (!vendor) return null;

  return mapVendorRowToProfile(vendor);
}

export async function listDbVendorPaymentRecordsByVendorId(vendorId: string): Promise<VendorPaymentRecord[]> {
  const vendor = await getDbVendorById(vendorId);
  if (!vendor) return [];
  const db = createPhase1DbClient();
  const result = await db.query<VendorPaymentRecord>(`
    select id, project_id as "projectId", vendor_id as "vendorId", vendor_name as "vendorName", to_char(paid_on, 'YYYY-MM-DD') as "paidOn", amount::float8 as amount, coalesce(note, '') as note
    from project_vendor_payment_records
    where vendor_id = $1 or (vendor_id is null and vendor_name = $2)
    order by paid_on desc, created_at desc
  `, [vendorId, vendor.name]);
  return result.rows;
}

export async function listDbVendorProjectRecordsByVendorId(vendorId: string): Promise<VendorProjectRecord[]> {
  const vendor = await getDbVendorById(vendorId);
  if (!vendor) return [];

  const [packages, financial, paymentRecords] = await Promise.all([
    listDbVendorPackages(),
    getVendorFinancialSummary({ vendorId, vendorName: vendor.name }),
    listDbVendorPaymentRecordsByVendorId(vendorId),
  ]);

  const packageByProjectId = new Map(
    packages.filter((pkg) => pkg.vendorId === vendorId).map((pkg) => [pkg.projectId, pkg]),
  );

  const records = await Promise.all(
    financial.records.map(async (financialRecord) => {
      const pkg = packageByProjectId.get(financialRecord.projectId);
      const tasks = await listDbVendorTasksByProject(financialRecord.projectId);
      const vendorTasks = tasks.filter((task) => task.vendorId === vendorId);
      const sourceItemDetails = [
        ...financialRecord.costItems.map((item) => item.sourceRef || item.itemName).filter(Boolean),
        ...vendorTasks.map((task) => task.requirementText || task.title).filter(Boolean),
      ];

      const paidAmount = paymentRecords
        .filter((record) => record.projectId === financialRecord.projectId)
        .reduce((sum, record) => sum + record.amount, 0);
      const unpaidAmount = Math.max(financialRecord.adjustedCost - paidAmount, 0);
      const paymentStatus = paidAmount <= 0 ? '未付款' : paidAmount < financialRecord.adjustedCost ? '部分付款' : '已付款';

      return {
        id: pkg?.id ?? `vendor-record-${financialRecord.projectId}-${vendorId}`,
        vendorId,
        vendorName: vendor.name,
        projectId: financialRecord.projectId,
        projectName: financialRecord.projectName,
        projectStatus: financialRecord.projectStatus,
        adjustedCost: financialRecord.adjustedCost,
        adjustedCostLabel: financialRecord.adjustedCostLabel,
        reconciliationSummary:
          (() => {
            const sourceCounts = new Map<string, number>();
            for (const group of financialRecord.reconciledGroups) {
              sourceCounts.set(group.sourceType, (sourceCounts.get(group.sourceType) ?? 0) + 1);
            }
            const summary = Array.from(sourceCounts.entries())
              .map(([sourceType, count]) => `${sourceType} ${count} 筆`)
              .join('、');
            return summary ? `已對帳內容：${summary}` : '目前尚無已對帳內容';
          })(),
        reconciliationStatus: financialRecord.hasUnreconciledGroups ? '尚未全部對帳' : '已全部對帳',
        sourceItemDetails: sourceItemDetails.length ? sourceItemDetails : ['待補充'],
        costBreakdown: financialRecord.costItems.length
          ? financialRecord.costItems.map((item) => ({
              label: `${item.sourceType}｜${item.itemName}`,
              amount: `NT$ ${item.adjustedAmount.toLocaleString('zh-TW')}`,
            }))
          : [{ label: '尚無已對帳成本', amount: 'NT$ 0' }],
        paymentStatus,
        hasUnreconciledGroups: financialRecord.hasUnreconciledGroups,
        reconciliationWarning: financialRecord.hasUnreconciledGroups ? '此專案內該廠商尚未全部對帳' : null,
        packageId: pkg?.id,
        paidAmount,
        unpaidAmount,
      } satisfies VendorProjectRecord;
    }),
  );

  return records;
}
