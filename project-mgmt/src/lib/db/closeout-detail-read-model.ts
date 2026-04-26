import { getCloseoutArchiveProjectById } from '@/lib/db/closeout-archive-source';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import type { CostLineItem } from '@/components/quote-cost-data';
import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';
import { getCloseoutRetainedSnapshot } from '@/lib/db/closeout-retained-snapshot';

export type CloseoutArchiveCollectionRecord = {
  id: string;
  collectedOn: string;
  amount: number;
  note: string;
};

export type CloseoutArchiveVendorPaymentRecord = {
  vendorName: string;
  reconciledCount: number;
  unreconciledCount: number;
  payableAmount: number;
};

type RetainedReconciliationGroup = QuoteCostProjectWithGroups['reconciliationGroups'][number];


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


function buildArchiveVendorPaymentRows(reconciliationGroups: RetainedReconciliationGroup[]): CloseoutArchiveVendorPaymentRecord[] {
  const vendorGroupMap = new Map<string, { reconciledCount: number; unreconciledCount: number; payableAmount: number }>();

  for (const group of reconciliationGroups) {
    const current = vendorGroupMap.get(group.vendorName) ?? { reconciledCount: 0, unreconciledCount: 0, payableAmount: 0 };
    if (group.reconciliationStatus === '已對帳') {
      current.reconciledCount += 1;
      current.payableAmount += group.amountTotal;
    } else {
      current.unreconciledCount += 1;
    }
    vendorGroupMap.set(group.vendorName, current);
  }

  return Array.from(vendorGroupMap.entries()).map(([vendorName, summary]) => ({
    vendorName,
    reconciledCount: summary.reconciledCount,
    unreconciledCount: summary.unreconciledCount,
    payableAmount: summary.payableAmount,
  }));
}

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
    archiveVendorPayments: buildArchiveVendorPaymentRows(retainedReconciliationGroups),
    summaryTotals,
  };
}
