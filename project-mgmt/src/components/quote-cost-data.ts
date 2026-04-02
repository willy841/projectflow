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

export type CostSourceType = "設計" | "備品" | "廠商";

export type CostLineItem = {
  id: string;
  itemName: string;
  sourceType: CostSourceType;
  sourceRef: string;
  vendorId: string | null;
  vendorName: string | null;
  originalAmount: number;
  adjustedAmount: number;
};

export type QuoteCostProject = {
  id: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  eventDate: string;
  projectStatus: QuoteCostProjectStatus;
  quotationImported: boolean;
  reconciliationStatus: ReconciliationStatus;
  closeStatus: "未結案" | "已結案";
  quotationItems: QuoteLineItem[];
  costItems: CostLineItem[];
  note: string;
};

export const UNSPECIFIED_VENDOR_ID = "unassigned";
export const UNSPECIFIED_VENDOR_NAME = "未指定廠商";

export const vendorDirectory = [
  { id: "vendor-led-studio", name: "曜石影像製作" },
  { id: "vendor-wood-lab", name: "木作實驗室" },
  { id: "vendor-print-house", name: "春分印刷" },
  { id: "vendor-props-team", name: "青田展示製作" },
  { id: "vendor-gift-supply", name: "禮品補給站" },
];

export const quoteCostProjects: QuoteCostProject[] = [
  {
    id: "spring-popup-2026",
    projectCode: "QC-2026-031",
    projectName: "春季品牌快閃活動",
    clientName: "森野生活",
    eventDate: "2026-04-12",
    projectStatus: "執行中",
    quotationImported: true,
    reconciliationStatus: "待確認",
    closeStatus: "未結案",
    note: "第一輪先以 Excel 匯入 mock 結構呈現，成本調整僅存在本頁 local state。",
    quotationItems: [
      { id: "q1", category: "場佈", itemName: "入口主背板製作", description: "主背板木作、輸出與現場安裝", quantity: 1, unit: "式", unitPrice: 168000 },
      { id: "q2", category: "視覺", itemName: "導視系統與立牌", description: "導視立牌、價卡與掛旗整合", quantity: 1, unit: "式", unitPrice: 92000 },
      { id: "q3", category: "備品", itemName: "陳列桌與展示道具", description: "三組陳列桌與展示層架", quantity: 1, unit: "式", unitPrice: 126000 },
      { id: "q4", category: "印刷", itemName: "贈品吊卡與貼紙", description: "吊卡、貼紙、包裝貼標", quantity: 1, unit: "式", unitPrice: 48000 },
    ],
    costItems: [
      { id: "c1", itemName: "主背板木作與安裝", sourceType: "廠商", sourceRef: "廠商發包清單 / 春季包 #01", vendorId: "vendor-wood-lab", vendorName: "木作實驗室", originalAmount: 118000, adjustedAmount: 118000 },
      { id: "c2", itemName: "導視系統輸出", sourceType: "設計", sourceRef: "設計文件整理 / 導視系統版型", vendorId: "vendor-print-house", vendorName: "春分印刷", originalAmount: 32000, adjustedAmount: 35500 },
      { id: "c3", itemName: "陳列桌租借", sourceType: "備品", sourceRef: "備品整理 / 陳列桌三組", vendorId: "vendor-props-team", vendorName: "青田展示製作", originalAmount: 54000, adjustedAmount: 54000 },
      { id: "c4", itemName: "品牌立牌輸出", sourceType: "設計", sourceRef: "設計文件整理 / 品牌立牌版型", vendorId: null, vendorName: null, originalAmount: 16800, adjustedAmount: 16800 },
      { id: "c5", itemName: "贈品吊卡印刷", sourceType: "備品", sourceRef: "備品整理 / 吊卡印刷", vendorId: "vendor-gift-supply", vendorName: "禮品補給站", originalAmount: 22600, adjustedAmount: 22600 },
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
    reconciliationStatus: "未開始",
    closeStatus: "未結案",
    note: "木作與 LED 牆還在調整，先保留未指定廠商成本以便後續補綁。",
    quotationItems: [
      { id: "q1", category: "舞台", itemName: "主舞台 LED 動畫", description: "LED 動畫設計與播放素材整理", quantity: 1, unit: "式", unitPrice: 285000 },
      { id: "q2", category: "會場", itemName: "接待區背牆木作", description: "背牆木作、烤漆與施工", quantity: 1, unit: "式", unitPrice: 360000 },
      { id: "q3", category: "輸出", itemName: "現場指示與識別物", description: "名牌、指示牌與報到背板輸出", quantity: 1, unit: "式", unitPrice: 118000 },
    ],
    costItems: [
      { id: "c1", itemName: "LED 動畫外包", sourceType: "設計", sourceRef: "設計文件整理 / 主 KV 延伸版位", vendorId: "vendor-led-studio", vendorName: "曜石影像製作", originalAmount: 132000, adjustedAmount: 145000 },
      { id: "c2", itemName: "接待區背牆木作", sourceType: "廠商", sourceRef: "廠商發包清單 / 背牆木作", vendorId: "vendor-wood-lab", vendorName: "木作實驗室", originalAmount: 188000, adjustedAmount: 188000 },
      { id: "c3", itemName: "舞台輸出圖檔整理", sourceType: "設計", sourceRef: "設計文件整理 / 舞台輸出檔", vendorId: null, vendorName: null, originalAmount: 28000, adjustedAmount: 28000 },
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
    reconciliationStatus: "已完成",
    closeStatus: "已結案",
    note: "此案作為已結案 mock 範例，方便驗收列表分區與結案狀態。",
    quotationItems: [
      { id: "q1", category: "視覺", itemName: "POP 與價卡完稿", description: "檔期 POP、價卡與吊牌完稿", quantity: 1, unit: "式", unitPrice: 92000 },
      { id: "q2", category: "展示", itemName: "展示架與五金配件", description: "展示架結構、五金與現場調整", quantity: 1, unit: "式", unitPrice: 146000 },
      { id: "q3", category: "贈品", itemName: "贈品包材追加", description: "贈品包材與標示物追加", quantity: 1, unit: "式", unitPrice: 58000 },
    ],
    costItems: [
      { id: "c1", itemName: "POP 與價卡輸出", sourceType: "設計", sourceRef: "設計文件整理 / POP 完稿", vendorId: "vendor-print-house", vendorName: "春分印刷", originalAmount: 41800, adjustedAmount: 41800 },
      { id: "c2", itemName: "展示架五金與配件", sourceType: "備品", sourceRef: "備品整理 / 五金配件採購", vendorId: "vendor-props-team", vendorName: "青田展示製作", originalAmount: 86000, adjustedAmount: 89500 },
      { id: "c3", itemName: "贈品包材追加", sourceType: "備品", sourceRef: "備品整理 / 包材追加", vendorId: "vendor-gift-supply", vendorName: "禮品補給站", originalAmount: 23500, adjustedAmount: 23500 },
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
  return items.reduce((sum, item) => sum + item.adjustedAmount, 0);
}

export function getOriginalCostTotal(items: CostLineItem[]) {
  return items.reduce((sum, item) => sum + item.originalAmount, 0);
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
