import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';
import type { ProjectCollectionRecordRow } from '@/lib/db/collection-read-model';
import type { ActiveProjectFinancialSummaryTotals } from '@/lib/db/financial-summary-types';
import type { VendorPaymentSummaryRow } from '@/lib/db/vendor-payment-summary-read-model';

export type QuoteCostDetailInitialPayload = QuoteCostProjectWithGroups & {
  collectionRecords: ProjectCollectionRecordRow[];
  vendorPaymentRecords: VendorPaymentSummaryRow[];
  summaryTotals: ActiveProjectFinancialSummaryTotals;
};
