import { quoteCostProjectFixtures } from '@/components/quote-cost-fixtures';

export type QuoteCostProjectStatus = '執行中' | '已結案';
export type ReconciliationStatus = '未開始' | '待確認' | '已完成';

export type QuoteLineItem = {
  id: string;
  category: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type CostSourceType = '設計' | '備品' | '廠商' | '人工';

export type CostLineItem = {
  id: string;
  itemName: string;
  sourceType: CostSourceType;
  sourceRef: string;
  vendorId: string | null;
  vendorName: string | null;
  originalAmount: number;
  adjustedAmount: number;
  includedInCost: boolean;
  isManual: boolean;
  note?: string;
};

export type QuoteImportRecord = {
  importedAt: string;
  fileName: string;
  note: string;
};

export type QuoteCostProject = {
  id: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  eventDate: string;
  projectStatus: QuoteCostProjectStatus;
  quotationImported: boolean;
  quotationImport: QuoteImportRecord | null;
  reconciliationStatus: ReconciliationStatus;
  closeStatus: '未結案' | '已結案';
  quotationItems: QuoteLineItem[];
  costItems: CostLineItem[];
  note: string;
};

export const UNSPECIFIED_VENDOR_ID = 'unassigned';
export const UNSPECIFIED_VENDOR_NAME = '未指定廠商';
export const MANUAL_COST_GROUP_KEY = 'manual-costs';

export const vendorDirectory = [
  { id: 'vendor-led-studio', name: '曜石影像製作' },
  { id: 'vendor-wood-lab', name: '木作實驗室' },
  { id: 'vendor-print-house', name: '春分印刷' },
  { id: 'vendor-props-team', name: '青田展示製作' },
  { id: 'vendor-gift-supply', name: '禮品補給站' },
];

export const quoteCostProjects: QuoteCostProject[] = quoteCostProjectFixtures;

export function getQuoteCostProjectById(id: string) {
  return quoteCostProjects.find((project) => project.id === id);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getQuotationTotal(items: QuoteLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function getAdjustedCostTotal(items: CostLineItem[]) {
  return items.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.adjustedAmount, 0);
}

export function getOriginalCostTotal(items: CostLineItem[]) {
  return items.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.originalAmount, 0);
}

export function getAdditionalManualCostTotal(items: CostLineItem[]) {
  return items.filter((item) => item.isManual && item.includedInCost).reduce((sum, item) => sum + item.adjustedAmount, 0);
}

export function getFormalOriginalCostTotal(items: CostLineItem[]) {
  return items.filter((item) => !item.isManual && item.includedInCost).reduce((sum, item) => sum + item.originalAmount, 0);
}

export function getProjectCostTotal(items: CostLineItem[]) {
  return getFormalOriginalCostTotal(items) + getAdditionalManualCostTotal(items);
}

export function getGrossProfit(quotationTotal: number, costTotal: number) {
  return quotationTotal - costTotal;
}

export function getReconciliationStatusClass(status: ReconciliationStatus) {
  if (status === '已完成') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === '待確認') return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

export function getCloseStatusClass(status: '未結案' | '已結案') {
  if (status === '已結案') return 'bg-slate-100 text-slate-700 ring-slate-200';
  return 'bg-sky-50 text-sky-700 ring-sky-200';
}
