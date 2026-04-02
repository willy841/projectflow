export type VendorAssignmentStatus = "draft" | "done";
export type VendorDocumentStatus = "未生成" | "已生成" | "需更新";

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

export function getVendorDocumentStatusClass(status: VendorDocumentStatus) {
  if (status === "已生成") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "需更新") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
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
