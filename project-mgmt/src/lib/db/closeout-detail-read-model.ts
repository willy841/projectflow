import { getCloseoutArchiveProjectById } from '@/lib/db/closeout-archive-source';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import type { CostLineItem } from '@/components/quote-cost-data';
import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';
import { getCloseoutRetainedSnapshot } from '@/lib/db/closeout-retained-snapshot';
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
  summaryTotals: {
    quotationTotal: number;
    projectCostTotal: number;
    grossProfit: number;
  };
};


export async function getCloseoutArchiveDetailReadModel(projectId: string): Promise<CloseoutArchiveDetailReadModel | null> {
  const archiveProject = await getCloseoutArchiveProjectById(projectId);
  if (!archiveProject) return null;

  const retainedSnapshot = await getCloseoutRetainedSnapshot(projectId);
  const db = createPhase1DbClient();
  const collectionRows = await db.query<CloseoutArchiveCollectionRecord>(`
      select id, to_char(collected_on, 'YYYY-MM-DD') as "collectedOn", amount::float8 as amount, coalesce(note, '') as note
      from project_collection_records
      where project_id = $1
      order by collected_on desc, created_at desc
    `, [projectId]);

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
      archiveCollections: collectionRows.rows,
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
    archiveCollections: collectionRows.rows,
    archiveVendorPayments: buildVendorPaymentSummaryRows(retainedReconciliationGroups),
    summaryTotals,
  };
}
