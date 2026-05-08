import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';

export type VendorPaymentSummaryRow = {
  vendorName: string;
  reconciledCount: number;
  unreconciledCount: number;
  payableAmount: number;
};

type ReconciliationGroup = QuoteCostProjectWithGroups['reconciliationGroups'][number];

export function buildVendorPaymentSummaryRows(reconciliationGroups: ReconciliationGroup[]): VendorPaymentSummaryRow[] {
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
