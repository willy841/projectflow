import { getCloseoutArchiveProjectById } from '@/lib/db/closeout-archive-source';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';

export type CloseoutArchiveCollectionRecord = {
  id: string;
  collectedOn: string;
  amount: number;
  note: string;
};

export type CloseoutArchiveVendorPaymentRecord = {
  vendorName: string;
  payableAmount: number;
  paidAmount: number;
};

export type CloseoutArchiveDetailReadModel = {
  archiveProject: QuoteCostProjectWithGroups;
  archiveCollections: CloseoutArchiveCollectionRecord[];
  archiveVendorPayments: CloseoutArchiveVendorPaymentRecord[];
};

function buildArchiveVendorPaymentRows(project: QuoteCostProjectWithGroups, paidRows: Array<{ vendorName: string; paidAmount: number }>): CloseoutArchiveVendorPaymentRecord[] {
  const paidMap = new Map(paidRows.map((row) => [row.vendorName, row.paidAmount]));
  const payableMap = new Map<string, number>();

  for (const group of project.reconciliationGroups.filter((item) => item.reconciliationStatus === '已對帳')) {
    payableMap.set(group.vendorName, (payableMap.get(group.vendorName) ?? 0) + group.amountTotal);
  }

  return Array.from(payableMap.entries()).map(([vendorName, payableAmount]) => ({
    vendorName,
    payableAmount,
    paidAmount: paidMap.get(vendorName) ?? 0,
  }));
}

export async function getCloseoutArchiveDetailReadModel(projectId: string): Promise<CloseoutArchiveDetailReadModel | null> {
  const archiveProject = await getCloseoutArchiveProjectById(projectId);
  if (!archiveProject) return null;

  const db = createPhase1DbClient();
  const [collectionRows, paymentRows] = await Promise.all([
    db.query<CloseoutArchiveCollectionRecord>(`
      select id, to_char(collected_on, 'YYYY-MM-DD') as "collectedOn", amount::float8 as amount, coalesce(note, '') as note
      from project_collection_records
      where project_id = $1
      order by collected_on desc, created_at desc
    `, [projectId]),
    db.query<{ vendorName: string; paidAmount: number }>(`
      select vendor_name as "vendorName", sum(amount)::float8 as "paidAmount"
      from project_vendor_payment_records
      where project_id = $1
      group by vendor_name
      order by vendor_name asc
    `, [projectId]),
  ]);

  return {
    archiveProject,
    archiveCollections: collectionRows.rows,
    archiveVendorPayments: buildArchiveVendorPaymentRows(archiveProject, paymentRows.rows),
  };
}
