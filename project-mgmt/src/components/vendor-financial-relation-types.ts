import type { QuoteCostProject } from '@/components/quote-cost-data';
import type { VendorPaymentStatus } from '@/components/vendor-data';

export type ProjectVendorFinancialRelation = {
  relationKey: string;
  projectId: string;
  vendorId: string;
  projectName: string;
  vendorName: string;
  projectStatus: QuoteCostProject['projectStatus'];
  adjustedCostTotal: number;
  rawCostTotal: number;
  paymentStatus: VendorPaymentStatus;
  unpaidAmount: number;
  costItemCount: number;
  costItemsSummary: string[];
  packageCount: number;
  packageSummary: string[];
};
