export type QuoteCostProjectStatus = "執行中" | "已結案";
export type ReconciliationStatus = "未開始" | "待確認" | "已完成";

export type QuoteLineItem = {
  id: string;
  category: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type CostSourceType = "設計" | "備品" | "廠商" | "人工";

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
  closeStatus: "未結案" | "已結案";
  quotationItems: QuoteLineItem[];
  costItems: CostLineItem[];
  note: string;
};

export const UNSPECIFIED_VENDOR_ID = "unassigned";
export const UNSPECIFIED_VENDOR_NAME = "未指定廠商";
export const MANUAL_COST_GROUP_KEY = "manual-costs";

export const vendorDirectory = [
  { id: "vendor-led-studio", name: "曜石影像製作" },
  { id: "vendor-wood-lab", name: "木作實驗室" },
  { id: "vendor-print-house", name: "春分印刷" },
  { id: "vendor-props-team", name: "青田展示製作" },
  { id: "vendor-gift-supply", name: "禮品補給站" },
];

export const sampleQuoteImports: Record<string, QuoteImportRecord[]> = {
  "spring-popup-2026": [
    {
      importedAt: "2026-03-29 14:20",
      fileName: "spring-popup-v2.xlsx",
      note: "目前有效版本。新匯入會直接覆蓋舊報價單。",
    },
    {
      importedAt: "2026-03-27 11:05",
      fileName: "spring-popup-v1.xlsx",
      note: "示意用：重新匯入後只保留新版本為有效報價單。",
    },
  ],
  "obsidian-launch-2026": [
    {
      importedAt: "2026-03-30 09:40",
      fileName: "obsidian-launch-v2.xlsx",
      note: "第二版更新舞台與木作金額。",
    },
    {
      importedAt: "2026-03-26 18:15",
      fileName: "obsidian-launch-v1.xlsx",
      note: "第一版示意。",
    },
  ],
  "qingshan-store-display-2026": [
    {
      importedAt: "2026-03-18 16:30",
      fileName: "qingshan-store-display-final.xlsx",
      note: "已結案專案，保留當時有效報價單。",
    },
  ],
};

export const sampleQuoteLineItemsByProject: Record<string, QuoteLineItem[][]> = {
  "spring-popup-2026": [
    [
      { id: "q1-new", category: "場佈", itemName: "入口主背板製作", description: "主背板木作、輸出與現場安裝", quantity: 1, unit: "式", unitPrice: 176000 },
      { id: "q2-new", category: "視覺", itemName: "導視系統與立牌", description: "導視立牌、價卡與掛旗整合", quantity: 1, unit: "式", unitPrice: 98000 },
      { id: "q3-new", category: "備品", itemName: "陳列桌與展示道具", description: "三組陳列桌與展示層架", quantity: 1, unit: "式", unitPrice: 128000 },
      { id: "q4-new", category: "印刷", itemName: "贈品吊卡與貼紙", description: "吊卡、貼紙、包裝貼標", quantity: 1, unit: "式", unitPrice: 52000 },
    ],
    [
      { id: "q1-old", category: "場佈", itemName: "入口主背板製作", description: "主背板木作與基本輸出", quantity: 1, unit: "式", unitPrice: 168000 },
      { id: "q2-old", category: "視覺", itemName: "導視系統與立牌", description: "導視立牌與掛旗整合", quantity: 1, unit: "式", unitPrice: 92000 },
      { id: "q3-old", category: "備品", itemName: "陳列桌與展示道具", description: "陳列桌與展示道具", quantity: 1, unit: "式", unitPrice: 126000 },
      { id: "q4-old", category: "印刷", itemName: "贈品吊卡與貼紙", description: "吊卡與貼紙", quantity: 1, unit: "式", unitPrice: 48000 },
    ],
  ],
  "obsidian-launch-2026": [
    [
      { id: "o1-new", category: "舞台", itemName: "主舞台 LED 動畫", description: "LED 動畫設計與播放素材整理", quantity: 1, unit: "式", unitPrice: 295000 },
      { id: "o2-new", category: "會場", itemName: "接待區背牆木作", description: "背牆木作、烤漆與施工", quantity: 1, unit: "式", unitPrice: 372000 },
      { id: "o3-new", category: "輸出", itemName: "現場指示與識別物", description: "名牌、指示牌與報到背板輸出", quantity: 1, unit: "式", unitPrice: 128000 },
    ],
    [
      { id: "o1-old", category: "舞台", itemName: "主舞台 LED 動畫", description: "LED 動畫設計與素材整理", quantity: 1, unit: "式", unitPrice: 285000 },
      { id: "o2-old", category: "會場", itemName: "接待區背牆木作", description: "背牆木作、烤漆與施工", quantity: 1, unit: "式", unitPrice: 360000 },
      { id: "o3-old", category: "輸出", itemName: "現場指示與識別物", description: "指示牌與報到背板輸出", quantity: 1, unit: "式", unitPrice: 118000 },
    ],
  ],
};

export const quoteCostProjects: QuoteCostProject[] = [
  {
    id: "spring-popup-2026",
    projectCode: "QC-2026-031",
    projectName: "春季品牌快閃活動",
    clientName: "森野生活",
    eventDate: "2026-04-12",
    projectStatus: "執行中",
    quotationImported: true,
    quotationImport: sampleQuoteImports["spring-popup-2026"][0],
    reconciliationStatus: "待確認",
    closeStatus: "未結案",
    note: "第二輪 MVP：新匯入只保留一份有效報價單，成本管理改為保留原始與調整後成本並支援人工成本。",
    quotationItems: sampleQuoteLineItemsByProject["spring-popup-2026"][0],
    costItems: [
      { id: "c1", itemName: "主背板木作與安裝", sourceType: "廠商", sourceRef: "廠商發包清單 / 春季包 #01", vendorId: "vendor-wood-lab", vendorName: "木作實驗室", originalAmount: 118000, adjustedAmount: 118000, includedInCost: true, isManual: false },
      { id: "c2", itemName: "導視系統輸出", sourceType: "設計", sourceRef: "設計文件整理 / 導視系統版型", vendorId: "vendor-print-house", vendorName: "春分印刷", originalAmount: 32000, adjustedAmount: 35500, includedInCost: true, isManual: false },
      { id: "c3", itemName: "陳列桌租借", sourceType: "備品", sourceRef: "備品整理 / 陳列桌三組", vendorId: "vendor-props-team", vendorName: "青田展示製作", originalAmount: 54000, adjustedAmount: 54000, includedInCost: true, isManual: false },
      { id: "c4", itemName: "品牌立牌輸出", sourceType: "設計", sourceRef: "設計文件整理 / 品牌立牌版型", vendorId: null, vendorName: null, originalAmount: 16800, adjustedAmount: 16800, includedInCost: true, isManual: false },
      { id: "c5", itemName: "贈品吊卡印刷", sourceType: "備品", sourceRef: "備品整理 / 吊卡印刷", vendorId: "vendor-gift-supply", vendorName: "禮品補給站", originalAmount: 22600, adjustedAmount: 22600, includedInCost: false, isManual: false },
      { id: "m1", itemName: "活動現場車資", sourceType: "人工", sourceRef: "人工成本 / 現場支援", vendorId: null, vendorName: null, originalAmount: 2500, adjustedAmount: 2500, includedInCost: true, isManual: true },
    ],
  },
  {
    id: "obsidian-launch-2026",
    projectCode: "QC-2026-028",
    projectName: "新品發表會主視覺與會場製作",
    clientName: "曜石科技",
    eventDate: "2026-04-20",
    projectStatus: "執行中",
    quotationImported: true,
    quotationImport: sampleQuoteImports["obsidian-launch-2026"][0],
    reconciliationStatus: "未開始",
    closeStatus: "未結案",
    note: "木作與 LED 牆還在調整，保留未指定廠商成本，並可額外新增人工雜支。",
    quotationItems: sampleQuoteLineItemsByProject["obsidian-launch-2026"][0],
    costItems: [
      { id: "c1", itemName: "LED 動畫外包", sourceType: "設計", sourceRef: "設計文件整理 / 主 KV 延伸版位", vendorId: "vendor-led-studio", vendorName: "曜石影像製作", originalAmount: 132000, adjustedAmount: 145000, includedInCost: true, isManual: false },
      { id: "c2", itemName: "接待區背牆木作", sourceType: "廠商", sourceRef: "廠商發包清單 / 背牆木作", vendorId: "vendor-wood-lab", vendorName: "木作實驗室", originalAmount: 188000, adjustedAmount: 188000, includedInCost: true, isManual: false },
      { id: "c3", itemName: "舞台輸出圖檔整理", sourceType: "設計", sourceRef: "設計文件整理 / 舞台輸出檔", vendorId: null, vendorName: null, originalAmount: 28000, adjustedAmount: 28000, includedInCost: true, isManual: false },
      { id: "m1", itemName: "夜間加班車資", sourceType: "人工", sourceRef: "人工成本 / 加班支援", vendorId: null, vendorName: null, originalAmount: 3600, adjustedAmount: 3600, includedInCost: true, isManual: true },
    ],
  },
  {
    id: "qingshan-store-display-2026",
    projectCode: "QC-2026-024",
    projectName: "百貨檔期陳列與贈品備品整合",
    clientName: "青禾百貨",
    eventDate: "2026-04-25",
    projectStatus: "已結案",
    quotationImported: true,
    quotationImport: sampleQuoteImports["qingshan-store-display-2026"][0],
    reconciliationStatus: "已完成",
    closeStatus: "已結案",
    note: "已結案範例：列表仍只分執行中 / 已結案，不增加次狀態。",
    quotationItems: [
      { id: "q1", category: "視覺", itemName: "POP 與價卡完稿", description: "檔期 POP、價卡與吊牌完稿", quantity: 1, unit: "式", unitPrice: 92000 },
      { id: "q2", category: "展示", itemName: "展示架與五金配件", description: "展示架結構、五金與現場調整", quantity: 1, unit: "式", unitPrice: 146000 },
      { id: "q3", category: "贈品", itemName: "贈品包材追加", description: "贈品包材與標示物追加", quantity: 1, unit: "式", unitPrice: 58000 },
    ],
    costItems: [
      { id: "c1", itemName: "POP 與價卡輸出", sourceType: "設計", sourceRef: "設計文件整理 / POP 完稿", vendorId: "vendor-print-house", vendorName: "春分印刷", originalAmount: 41800, adjustedAmount: 41800, includedInCost: true, isManual: false },
      { id: "c2", itemName: "展示架五金與配件", sourceType: "備品", sourceRef: "備品整理 / 五金配件採購", vendorId: "vendor-props-team", vendorName: "青田展示製作", originalAmount: 86000, adjustedAmount: 89500, includedInCost: true, isManual: false },
      { id: "c3", itemName: "贈品包材追加", sourceType: "備品", sourceRef: "備品整理 / 包材追加", vendorId: "vendor-gift-supply", vendorName: "禮品補給站", originalAmount: 23500, adjustedAmount: 23500, includedInCost: true, isManual: false },
      { id: "m1", itemName: "臨時搬運支援", sourceType: "人工", sourceRef: "人工成本 / 結案追加", vendorId: null, vendorName: null, originalAmount: 1800, adjustedAmount: 1800, includedInCost: false, isManual: true },
    ],
  },
];

export function getQuoteCostProjectById(id: string) {
  return quoteCostProjects.find((project) => project.id === id);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
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

export function getGrossProfit(quotationTotal: number, adjustedCostTotal: number) {
  return quotationTotal - adjustedCostTotal;
}

export function getReconciliationStatusClass(status: ReconciliationStatus) {
  if (status === "已完成") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "待確認") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export function getCloseStatusClass(status: "未結案" | "已結案") {
  if (status === "已結案") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-sky-50 text-sky-700 ring-sky-200";
}

const QUOTE_COST_STORAGE_KEY = "projectflow-quote-cost-projects";

function cloneQuoteCostProject(project: QuoteCostProject): QuoteCostProject {
  return {
    ...project,
    quotationImport: project.quotationImport ? { ...project.quotationImport } : null,
    quotationItems: project.quotationItems.map((item) => ({ ...item })),
    costItems: project.costItems.map((item) => ({ ...item })),
  };
}

export function readStoredQuoteCostProjects(): QuoteCostProject[] {
  const fallback = quoteCostProjects.map(cloneQuoteCostProject);
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(QUOTE_COST_STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as QuoteCostProject[];
    if (!Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function writeStoredQuoteCostProjects(projects: QuoteCostProject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUOTE_COST_STORAGE_KEY, JSON.stringify(projects));
}

export function upsertStoredQuoteCostProject(project: QuoteCostProject) {
  const current = readStoredQuoteCostProjects();
  const next = current.some((item) => item.id === project.id)
    ? current.map((item) => (item.id === project.id ? cloneQuoteCostProject(project) : item))
    : [...current, cloneQuoteCostProject(project)];

  writeStoredQuoteCostProjects(next);
  return next;
}
