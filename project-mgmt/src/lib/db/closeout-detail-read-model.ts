import { getCloseoutArchiveProjectById } from '@/lib/db/closeout-archive-source';
import type { CostLineItem } from '@/components/quote-cost-data';
import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';
import { getCloseoutRetainedSnapshot } from '@/lib/db/closeout-retained-snapshot';
import { listProjectCollectionRecords } from '@/lib/db/collection-read-model';
import type { ProjectFinancialSummaryTotals } from '@/lib/db/financial-summary-types';
import { buildVendorPaymentSummaryRows, type VendorPaymentSummaryRow } from '@/lib/db/vendor-payment-summary-read-model';

export type CloseoutArchiveCollectionRecord = {
  id: string;
  collectedOn: string;
  amount: number;
  note: string;
};

export type CloseoutArchiveVendorPaymentRecord = VendorPaymentSummaryRow;


export type CloseoutArchiveDetailReadModel = {
  archiveProject: QuoteCostProjectWithGroups;
  archiveCollections: CloseoutArchiveCollectionRecord[];
  archiveVendorPayments: CloseoutArchiveVendorPaymentRecord[];
  summaryTotals: ProjectFinancialSummaryTotals;
};


export async function getCloseoutArchiveDetailReadModel(projectId: string): Promise<CloseoutArchiveDetailReadModel | null> {
  const archiveProject = await getCloseoutArchiveProjectById(projectId);
  if (!archiveProject) return null;

  const retainedSnapshot = await getCloseoutRetainedSnapshot(projectId);
  const collectionRows = await listProjectCollectionRecords(projectId);

  if (!retainedSnapshot) {
    return {
      archiveProject: {
        ...archiveProject,
        quotationImported: archiveProject.quotationImported,
        quotationImport: archiveProject.quotationImport,
        costItems: [],
        reconciliationGroups: [],
        reconciliationStatus: '未開始',
      },
      archiveCollections: collectionRows,
      archiveVendorPayments: [],
      summaryTotals: {
        quotationTotal: 0,
        projectCostTotal: 0,
        grossProfit: 0,
      },
    };
  }

  const retainedCostItems = Array.isArray(retainedSnapshot.costItems) ? retainedSnapshot.costItems : [];
  const retainedReconciliationGroups = Array.isArray(retainedSnapshot.reconciliationGroups)
    ? retainedSnapshot.reconciliationGroups
    : [];
  const summaryTotals = {
    quotationTotal: retainedSnapshot.quotationTotal,
    projectCostTotal: retainedSnapshot.projectCostTotal,
    grossProfit: retainedSnapshot.grossProfit,
  };

  return {
    archiveProject: {
      ...archiveProject,
      quotationImported: retainedSnapshot?.quotationImported ?? archiveProject.quotationImported,
      quotationImport: retainedSnapshot?.quotationImport ?? archiveProject.quotationImport,
      costItems: retainedCostItems,
      reconciliationGroups: retainedReconciliationGroups,
      reconciliationStatus: retainedReconciliationGroups.length > 0 ? '已完成' : '未開始',
    },
    archiveCollections: collectionRows,
    archiveVendorPayments: buildVendorPaymentSummaryRows(retainedReconciliationGroups),
    summaryTotals,
  };
}
