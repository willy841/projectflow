"use client";

import { QuoteCostDetailClient } from '@/components/quote-cost-detail-client';
import type { CloseoutArchiveDetailReadModel } from '@/lib/db/closeout-detail-read-model';

export function CloseoutDetailClient({ readModel }: { readModel: CloseoutArchiveDetailReadModel }) {
  const { archiveProject, archiveCollections, archiveVendorPayments } = readModel;

  return (
    <QuoteCostDetailClient
      project={archiveProject}
      initialProject={{
        ...archiveProject,
        collectionRecords: archiveCollections,
        vendorPaymentRecords: archiveVendorPayments,
      }}
      mode="closed"
    />
  );
}
