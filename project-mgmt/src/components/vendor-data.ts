export type VendorAssignmentStatus = "draft" | "done";
export type VendorDocumentStatus = "未生成" | "已生成" | "需更新";
export type VendorPaymentStatus = "未付款" | "已付款";

export type VendorReply = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

export type VendorAssignment = {
  id: string;
  projectId: string;
  executionItemId: string;
  executionItemTitle: string;
  title: string;
  summary: string;
  budget: string;
  tradeLabel?: string;
  selectedVendorName?: string;
  status: VendorAssignmentStatus;
  packageId: string | null;
  replies: VendorReply[];
  createdAt: string;
  updatedAt: string;
};

export type VendorPackageItem = {
  id: string;
  assignmentId: string;
  itemName: string;
  requirementText: string;
};

export type VendorPackage = {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  vendorName: string;
  eventDate: string;
  location: string;
  loadInTime: string;
  items: VendorPackageItem[];
  note: string;
  documentStatus: VendorDocumentStatus;
};

export type VendorBasicProfile = {
  id: string;
  name: string;
  category: string;
  tradeLabel?: string;
  tradeLabels?: string[];
  contactName: string;
  phone: string;
  email: string;
  lineId: string;
  address: string;
  note: string;
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
};

export type VendorProjectRecord = {
  id: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  projectStatus: "執行中" | "已結案";
  adjustedCost: number;
  adjustedCostLabel: string;
  procurementSummary: string;
  procurementDetails: string[];
  costBreakdown: Array<{
    label: string;
    amount: string;
  }>;
  paymentStatus: VendorPaymentStatus;
  packageId?: string;
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getVendorDocumentStatusClass(status: VendorDocumentStatus) {
  if (status === "已生成") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "需更新") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export function getVendorPaymentStatusClass(status: VendorPaymentStatus) {
  return status === "已付款"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-amber-50 text-amber-700 ring-amber-200";
}

export const vendorAssignments: VendorAssignment[] = [
  {
    id: "va-spring-main-backdrop",
    projectId: "spring-popup-2026",
    executionItemId: "spring-display-output",
    executionItemTitle: "入口主背板與導視輸出",
    title: "入口主背板輸出製作",
    summary: "主背板輸出、裱板、現場安裝與收邊。",
    budget: "NT$ 68,000",
    tradeLabel: "輸出",
    selectedVendorName: "星澄輸出",
    status: "done",
    packageId: "vp-spring-xingcheng-001",
    replies: [
      {
        id: "var-001",
        author: "星澄輸出 / Amber",
        message: "背板若改用霧膜，單項需增加 NT$ 4,500。",
        createdAt: "2026-03-29 14:20",
      },
    ],
    createdAt: "2026-03-27 10:00",
    updatedAt: "2026-03-30 16:00",
  },
  {
    id: "va-spring-wayfinding",
    projectId: "spring-popup-2026",
    executionItemId: "spring-display-output",
    executionItemTitle: "入口主背板與導視輸出",
    title: "現場導視系統輸出",
    summary: "入口指示、動線牌與收銀區桌牌。",
    budget: "NT$ 24,000",
    tradeLabel: "輸出",
    selectedVendorName: "星澄輸出",
    status: "done",
    packageId: "vp-spring-xingcheng-001",
    replies: [
      {
        id: "var-002",
        author: "Willy",
        message: "桌牌文案預計 4/5 中午前定稿，再一起補附件。",
        createdAt: "2026-03-30 11:30",
      },
    ],
    createdAt: "2026-03-27 10:30",
    updatedAt: "2026-03-30 11:30",
  },
  {
    id: "va-obsidian-reception-wall",
    projectId: "obsidian-launch-2026",
    executionItemId: "obsidian-stage-build",
    executionItemTitle: "接待區背牆木作與輸出",
    title: "接待區背牆木作重估",
    summary: "木作背牆製作、結構補強、面材處理。",
    budget: "NT$ 146,000",
    tradeLabel: "木作",
    selectedVendorName: "木與光工坊",
    status: "done",
    packageId: "vp-obsidian-woodlight-001",
    replies: [
      {
        id: "var-003",
        author: "木與光工坊 / Leo",
        message: "目前估價含結構補強，若尺寸再放大會再追加。",
        createdAt: "2026-03-31 15:10",
      },
    ],
    createdAt: "2026-03-30 09:00",
    updatedAt: "2026-03-31 15:10",
  },
];

export const vendorPackages: VendorPackage[] = [
  {
    id: "vp-spring-xingcheng-001",
    code: "VP-2026-031-001",
    projectId: "spring-popup-2026",
    projectName: "春季品牌快閃活動",
    vendorName: "星澄輸出",
    eventDate: "2026-04-12",
    location: "松山文創園區 2F 主展區",
    loadInTime: "09:00",
    items: [
      {
        id: "line-001",
        assignmentId: "va-spring-main-backdrop",
        itemName: "入口主背板輸出與安裝",
        requirementText: "主背板輸出、裱板、現場安裝與收邊。",
      },
      {
        id: "line-002",
        assignmentId: "va-spring-wayfinding",
        itemName: "導視系統與桌牌輸出",
        requirementText: "入口指示、動線牌與桌牌輸出。",
      },
    ],
    note: "如現場尺寸有變動請提前告知。",
    documentStatus: "已生成",
  },
  {
    id: "vp-obsidian-woodlight-001",
    code: "VP-2026-028-001",
    projectId: "obsidian-launch-2026",
    projectName: "新品發表會主視覺與會場製作",
    vendorName: "木與光工坊",
    eventDate: "2026-04-20",
    location: "南港展覽館 4F 展示區",
    loadInTime: "08:00",
    items: [
      {
        id: "line-101",
        assignmentId: "va-obsidian-reception-wall",
        itemName: "接待區背牆木作",
        requirementText: "木作背牆製作、結構補強、面材處理。",
      },
    ],
    note: "最終尺寸請依客戶確認版為準。",
    documentStatus: "未生成",
  },
];

export const vendorProfiles: VendorBasicProfile[] = [
  {
    id: "vendor-xingcheng",
    name: "星澄輸出",
    category: "輸出製作",
    contactName: "Amber Lin",
    phone: "02-2777-1288",
    email: "amber@xingcheng-output.tw",
    lineId: "@xingcheng-output",
    address: "台北市南港區忠孝東路七段 22 號 3 樓",
    note: "擅長大圖輸出、活動導視、快閃店現場安裝。",
    bankName: "國泰世華銀行",
    bankCode: "013",
    accountName: "星澄輸出有限公司",
    accountNumber: "0920-350-188-001",
  },
  {
    id: "vendor-woodlight",
    name: "木與光工坊",
    category: "木作施工",
    contactName: "Leo Chen",
    phone: "03-451-7766",
    email: "leo@woodlight.com.tw",
    lineId: "woodlight-leo",
    address: "桃園市中壢區榮民路 88 巷 15 號",
    note: "承接展場木作、背牆結構與現場補強，配合度高。",
    bankName: "台新銀行",
    bankCode: "812",
    accountName: "木與光工坊有限公司",
    accountNumber: "2010-889-552-778",
  },
  {
    id: "vendor-yingcai",
    name: "映彩視覺",
    category: "平面輸出",
    contactName: "Tina Hsu",
    phone: "04-2256-9922",
    email: "tina@colorvision.tw",
    lineId: "@colorvision",
    address: "台中市西屯區朝富路 116 號 8 樓",
    note: "中部檔期支援，常接 POP、吊卡與櫥窗貼輸出。",
    bankName: "中國信託銀行",
    bankCode: "822",
    accountName: "映彩視覺設計有限公司",
    accountNumber: "9013-220-776-521",
  },
];

export const vendorProjectRecords: VendorProjectRecord[] = [
  {
    id: "record-spring-backdrop",
    vendorId: "vendor-xingcheng",
    vendorName: "星澄輸出",
    projectId: "spring-popup-2026",
    projectName: "春季品牌快閃活動",
    projectStatus: "執行中",
    adjustedCost: 68000,
    adjustedCostLabel: formatCurrency(68000),
    procurementSummary: "入口主背板輸出、裱板、現場安裝與收邊。",
    procurementDetails: ["主背板輸出 1 式", "裱板與護膜", "現場安裝與收邊"],
    costBreakdown: [
      { label: "輸出製作", amount: formatCurrency(42000) },
      { label: "裱板與護膜", amount: formatCurrency(12000) },
      { label: "安裝與收邊", amount: formatCurrency(14000) },
    ],
    paymentStatus: "未付款",
    packageId: "vp-spring-xingcheng-001",
  },
  {
    id: "record-spring-wayfinding",
    vendorId: "vendor-xingcheng",
    vendorName: "星澄輸出",
    projectId: "spring-popup-2026",
    projectName: "春季品牌快閃活動",
    projectStatus: "執行中",
    adjustedCost: 24000,
    adjustedCostLabel: formatCurrency(24000),
    procurementSummary: "入口指示、動線牌與收銀區桌牌輸出。",
    procurementDetails: ["入口導視牌 3 面", "動線牌 5 面", "桌牌與收銀區標示"],
    costBreakdown: [
      { label: "導視輸出", amount: formatCurrency(15000) },
      { label: "桌牌與標示", amount: formatCurrency(9000) },
    ],
    paymentStatus: "未付款",
    packageId: "vp-spring-xingcheng-001",
  },
  {
    id: "record-dept-pop",
    vendorId: "vendor-yingcai",
    vendorName: "映彩視覺",
    projectId: "department-store-display-2026",
    projectName: "百貨檔期陳列與贈品備品整合",
    projectStatus: "執行中",
    adjustedCost: 38500,
    adjustedCostLabel: formatCurrency(38500),
    procurementSummary: "POP、價卡與檔期吊牌輸出。",
    procurementDetails: ["POP 海報輸出 12 張", "價卡與吊牌 1 式", "櫥窗貼與現場補貼"],
    costBreakdown: [
      { label: "POP 輸出", amount: formatCurrency(18000) },
      { label: "價卡與吊牌", amount: formatCurrency(12500) },
      { label: "櫥窗貼", amount: formatCurrency(8000) },
    ],
    paymentStatus: "未付款",
  },
  {
    id: "record-obsidian-wall",
    vendorId: "vendor-woodlight",
    vendorName: "木與光工坊",
    projectId: "obsidian-launch-2026",
    projectName: "新品發表會主視覺與會場製作",
    projectStatus: "執行中",
    adjustedCost: 146000,
    adjustedCostLabel: formatCurrency(146000),
    procurementSummary: "接待區背牆木作、結構補強與面材處理。",
    procurementDetails: ["木作背牆製作", "結構補強", "面材包覆與現場安裝"],
    costBreakdown: [
      { label: "木作結構", amount: formatCurrency(98000) },
      { label: "面材與油漆", amount: formatCurrency(26000) },
      { label: "進場安裝", amount: formatCurrency(22000) },
    ],
    paymentStatus: "未付款",
    packageId: "vp-obsidian-woodlight-001",
  },
  {
    id: "record-obsidian-stage",
    vendorId: "vendor-woodlight",
    vendorName: "木與光工坊",
    projectId: "obsidian-launch-2025",
    projectName: "年度新品發表會主舞台製作",
    projectStatus: "已結案",
    adjustedCost: 92000,
    adjustedCostLabel: formatCurrency(92000),
    procurementSummary: "主舞台側翼木作、收邊與現場補強。",
    procurementDetails: ["舞台側翼木作", "結構補強", "現場拆裝收邊"],
    costBreakdown: [
      { label: "木作製作", amount: formatCurrency(62000) },
      { label: "現場安裝", amount: formatCurrency(18000) },
      { label: "拆場收邊", amount: formatCurrency(12000) },
    ],
    paymentStatus: "已付款",
  },
  {
    id: "record-summer-fixture",
    vendorId: "vendor-xingcheng",
    vendorName: "星澄輸出",
    projectId: "summer-campaign-2025",
    projectName: "夏季櫥窗檔期與店頭導視",
    projectStatus: "已結案",
    adjustedCost: 56000,
    adjustedCostLabel: formatCurrency(56000),
    procurementSummary: "櫥窗貼、立體字與店頭導視整包輸出。",
    procurementDetails: ["櫥窗貼 1 式", "立體字輸出", "店頭導視與桌牌"],
    costBreakdown: [
      { label: "櫥窗貼", amount: formatCurrency(22000) },
      { label: "立體字", amount: formatCurrency(18000) },
      { label: "導視輸出", amount: formatCurrency(16000) },
    ],
    paymentStatus: "已付款",
  },
];

export function getVendorAssignmentById(id: string) {
  return vendorAssignments.find((assignment) => assignment.id === id);
}

export function getVendorPackageById(id: string) {
  return vendorPackages.find((pkg) => pkg.id === id);
}

export function getAssignmentsByProjectId(projectId: string) {
  return vendorAssignments.filter((assignment) => assignment.projectId === projectId);
}

export function getPackagesByProjectId(projectId: string) {
  return vendorPackages.filter((pkg) => pkg.projectId === projectId);
}

export function getVendorById(id: string) {
  return vendorProfiles.find((vendor) => vendor.id === id);
}

export function getVendorByName(name: string) {
  return vendorProfiles.find((vendor) => vendor.name === name);
}

export function getVendorRecordsByVendorId(vendorId: string) {
  return vendorProjectRecords.filter((record) => record.vendorId === vendorId);
}

export function getVendorOutstandingTotal(vendorId: string) {
  return getVendorRecordsByVendorId(vendorId)
    .filter((record) => record.paymentStatus === "未付款")
    .reduce((total, record) => total + record.adjustedCost, 0);
}
