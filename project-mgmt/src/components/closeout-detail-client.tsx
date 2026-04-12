"use client";

import { QuoteCostDetailClient } from '@/components/quote-cost-detail-client';
import { getCloseoutRetainedPresenter } from '@/components/quote-cost-detail-presenter';
import type { CloseoutArchiveDetailReadModel } from '@/lib/db/closeout-detail-read-model';

export function CloseoutDetailClient({ readModel }: { readModel: CloseoutArchiveDetailReadModel }) {
  const { archiveProject, archiveCollections, archiveVendorPayments } = readModel;
  const presenter = getCloseoutRetainedPresenter();

  return (
    <QuoteCostDetailClient
      project={archiveProject}
      initialProject={{
        ...archiveProject,
        collectionRecords: archiveCollections,
        vendorPaymentRecords: archiveVendorPayments,
      }}
      mode={presenter.mode}
      presenter={presenter}
    />
  );
}
