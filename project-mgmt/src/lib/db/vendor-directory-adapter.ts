import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import type { VendorBasicProfile, VendorProjectRecord } from '@/components/vendor-data';
import { listDbVendorPackages } from '@/lib/db/vendor-package-adapter';
import { listDbVendorTasksByProject } from '@/lib/db/vendor-flow-adapter';
import { getVendorFinancialSummary } from '@/lib/db/vendor-financial-adapter';

export async function listDbVendors(): Promise<VendorBasicProfile[]> {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const vendors = await repositories.vendors.list();

  return vendors.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    category: '待補充',
    tradeLabel: '待補充',
    tradeLabels: [],
    contactName: '',
    phone: '',
    email: '',
    lineId: '',
    address: '',
    note: '',
    bankName: '',
    bankCode: '',
    accountName: '',
    accountNumber: '',
  }));
}

export async function getDbVendorById(id: string): Promise<VendorBasicProfile | null> {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const vendor = await repositories.vendors.findById(id);
  if (!vendor) return null;

  return {
    id: vendor.id,
    name: vendor.name,
    category: '待補充',
    tradeLabel: '待補充',
    tradeLabels: [],
    contactName: '',
    phone: '',
    email: '',
    lineId: '',
    address: '',
    note: '',
    bankName: '',
    bankCode: '',
    accountName: '',
    accountNumber: '',
  };
}

export async function listDbVendorProjectRecordsByVendorId(vendorId: string): Promise<VendorProjectRecord[]> {
  const vendor = await getDbVendorById(vendorId);
  if (!vendor) return [];

  const [packages, financial] = await Promise.all([
    listDbVendorPackages(),
    getVendorFinancialSummary(vendor.name),
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
            for (const item of financialRecord.costItems) {
              sourceCounts.set(item.sourceType, (sourceCounts.get(item.sourceType) ?? 0) + 1);
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
        paymentStatus: financialRecord.adjustedCost > 0 ? '未付款' : '已付款',
        hasUnreconciledGroups: financialRecord.hasUnreconciledGroups,
        reconciliationWarning: financialRecord.hasUnreconciledGroups ? '此專案內該廠商尚未全部對帳' : null,
        packageId: pkg?.id,
      } satisfies VendorProjectRecord;
    }),
  );

  return records;
}
