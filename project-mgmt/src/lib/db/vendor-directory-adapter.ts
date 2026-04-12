import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
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

function mapVendorRowToProfile(vendor: Awaited<ReturnType<ReturnType<typeof createPhase1Repositories>['vendors']['findById']>> extends infer T ? NonNullable<T> : never): VendorBasicProfile {
  return {
    id: vendor.id,
    name: vendor.name,
    category: vendor.trade_label?.trim() || '待補充',
    tradeLabel: vendor.trade_label?.trim() || '待補充',
    tradeLabels: vendor.trade_label?.trim() ? [vendor.trade_label.trim()] : [],
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

export async function listDbVendors(): Promise<VendorBasicProfile[]> {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const vendors = await repositories.vendors.list();
  const financialSummaries = await Promise.all(
    vendors.map(async (vendor) => ({
      vendorId: vendor.id,
      summary: await getVendorFinancialSummary({ vendorId: vendor.id, vendorName: vendor.name }),
    })),
  );
  const outstandingByVendorId = new Map(
    financialSummaries.map((entry) => [entry.vendorId, entry.summary.records.reduce((sum, record) => sum + record.adjustedCost, 0)]),
  );

  return vendors.map((vendor) => ({
    ...mapVendorRowToProfile(vendor),
    outstandingTotal: outstandingByVendorId.get(vendor.id) ?? 0,
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
        payableSummary:
          (() => {
            const sourceCounts = new Map<string, number>();
            for (const group of financialRecord.reconciledGroups) {
              sourceCounts.set(group.sourceType, (sourceCounts.get(group.sourceType) ?? 0) + 1);
            }
            const summary = Array.from(sourceCounts.entries())
              .map(([sourceType, count]) => `${sourceType} ${count} 筆`)
              .join('、');
            return summary ? `目前累積已對帳項目：${summary}` : '目前尚無已對帳項目';
          })(),
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
