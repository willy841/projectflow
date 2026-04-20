"use client";

import { QuoteCostDetailClient } from '@/components/quote-cost-detail-client';
import { getCloseoutRetainedPresenter } from '@/components/quote-cost-detail-presenter';
import type { CloseoutArchiveDetailReadModel } from '@/lib/db/closeout-detail-read-model';

export function CloseoutDetailClient({ readModel }: { readModel: CloseoutArchiveDetailReadModel }) {
  const { archiveProject, archiveCollections, archiveVendorPayments, summaryTotals } = readModel;
  const presenter = getCloseoutRetainedPresenter();

  const normalizedProject = {
    ...archiveProject,
    quotationImport: archiveProject.quotationImport
      ? {
          ...archiveProject.quotationImport,
          totalAmount: summaryTotals.quotationTotal,
        }
      : {
          importedAt: '',
          fileName: '',
          note: 'closeout summary normalized from confirmed totals',
          totalAmount: summaryTotals.quotationTotal,
        },
    quotationImported: summaryTotals.quotationTotal > 0 || archiveProject.quotationImported,
    costItems: [
      {
        id: `closeout-confirmed-total-${archiveProject.id}`,
        itemName: '已確認結案成本',
        sourceType: '廠商' as const,
        sourceRef: 'closeout detail normalized from latest confirmed snapshots + manual costs',
        vendorId: null,
        vendorName: '結案成本統計',
        originalAmount: summaryTotals.projectCostTotal,
        adjustedAmount: summaryTotals.projectCostTotal,
        includedInCost: true,
        isManual: false,
      },
    ],
  };

  return (
    <QuoteCostDetailClient
      project={normalizedProject}
      initialProject={{
        ...normalizedProject,
        collectionRecords: archiveCollections,
        vendorPaymentRecords: archiveVendorPayments,
      }}
      mode={presenter.mode}
      presenter={presenter}
    />
  );
}
