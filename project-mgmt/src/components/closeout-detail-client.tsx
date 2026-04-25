"use client";

import { QuoteCostDetailClient } from '@/components/quote-cost-detail-client';
import { getCloseoutRetainedPresenter } from '@/components/quote-cost-detail-presenter';
import type { CloseoutArchiveDetailReadModel } from '@/lib/db/closeout-detail-read-model';

export function CloseoutDetailClient({ readModel }: { readModel: CloseoutArchiveDetailReadModel }) {
  const { archiveProject, archiveCollections, archiveVendorPayments, summaryTotals } = readModel;
  const presenter = getCloseoutRetainedPresenter();

  const retainedProject = {
    ...archiveProject,
    quotationImport: archiveProject.quotationImport
      ? {
          ...archiveProject.quotationImport,
          totalAmount: summaryTotals.quotationTotal,
        }
      : {
          importedAt: '',
          fileName: '',
          note: 'closeout summary normalized from retained confirmation snapshots + manual costs',
          totalAmount: summaryTotals.quotationTotal,
        },
    quotationImported: summaryTotals.quotationTotal > 0 || archiveProject.quotationImported,
  };

  return (
    <QuoteCostDetailClient
      project={retainedProject}
      initialProject={{
        ...retainedProject,
        collectionRecords: archiveCollections,
        vendorPaymentRecords: archiveVendorPayments,
      }}
      mode={presenter.mode}
      presenter={presenter}
    />
  );
}
