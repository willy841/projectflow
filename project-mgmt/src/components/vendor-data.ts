export type VendorAssignmentStatus =
  | "draft"
  | "ready_for_packaging"
  | "packaged"
  | "in_vendor_discussion"
  | "confirmed_under_package"
  | "done"
  | "cancelled";

export type VendorPackageStatus =
  | "draft"
  | "ready_to_send"
  | "sent"
  | "in_discussion"
  | "formally_confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type VendorReply = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  type?: string;
};

export type VendorAssignment = {
  id: string;
  projectId: string;
  executionItemId: string;
  executionItemTitle: string;
  vendorName: string;
  title: string;
  summary: string;
  spec: string;
  budget: string;
  note: string;
  status: VendorAssignmentStatus;
  packageId: string | null;
  replies: VendorReply[];
  createdAt: string;
  updatedAt: string;
};

export type VendorPackage = {
  id: string;
  projectId: string;
  projectName: string;
  vendorName: string;
  title: string;
  status: VendorPackageStatus;
  assignmentIds: string[];
  summary: string;
  notes: string;
  replies: VendorReply[];
  formallyConfirmedAt: string | null;
  formallyConfirmedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export const vendorAssignments: VendorAssignment[] = [
  {
    id: "va-spring-main-backdrop",
    projectId: "spring-popup-2026",
    executionItemId: "spring-display-output",
    executionItemTitle: "入口主背板與導視輸出",
    vendorName: "星澄輸出",
    title: "入口主背板輸出製作",
    summary: "負責入口主背板輸出與現場安裝，需對齊春季主題色與燈箱尺寸。",
    spec: "W600 x H300cm，含輸出、裱板、現場安裝與收邊。",
    budget: "NT$ 68,000",
    note: "需於活動前 2 日完成進場。",
    status: "confirmed_under_package",
    packageId: "vp-spring-xingcheng-001",
    replies: [
      {
        id: "var-001",
        author: "星澄輸出 / Amber",
        message: "背板若改用霧膜，單項需增加 NT$ 4,500。",
        createdAt: "2026-03-29 14:20",
        type: "加價",
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
    vendorName: "星澄輸出",
    title: "現場導視系統輸出",
    summary: "包含入口指示、動線牌與收銀區桌牌。",
    spec: "A1 指示牌 4 面、桌牌 6 組、吊牌 12 張。",
    budget: "NT$ 24,000",
    note: "桌牌內容需待客戶最後校稿。",
    status: "confirmed_under_package",
    packageId: "vp-spring-xingcheng-001",
    replies: [
      {
        id: "var-002",
        author: "Willy",
        message: "桌牌文案預計 4/5 中午前定稿，再一起補附件。",
        createdAt: "2026-03-30 11:30",
        type: "補件提醒",
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
    vendorName: "木與光工坊",
    title: "接待區背牆木作重估",
    summary: "因客戶調整視覺尺寸，需重新估算木作背牆與輸出面材。",
    spec: "木作背牆 W800 x H320cm，需預留螢幕開孔與走線。",
    budget: "NT$ 146,000",
    note: "等客戶 final 尺寸確認後才能正式發包。",
    status: "in_vendor_discussion",
    packageId: "vp-obsidian-woodlight-001",
    replies: [
      {
        id: "var-003",
        author: "木與光工坊 / Leo",
        message: "目前估價含結構補強，若尺寸再放大會再追加。",
        createdAt: "2026-03-31 15:10",
        type: "估價說明",
      },
    ],
    createdAt: "2026-03-30 09:00",
    updatedAt: "2026-03-31 15:10",
  },
];

export const vendorPackages: VendorPackage[] = [
  {
    id: "vp-spring-xingcheng-001",
    projectId: "spring-popup-2026",
    projectName: "春季品牌快閃活動",
    vendorName: "星澄輸出",
    title: "春季品牌快閃活動｜星澄輸出整包發包",
    status: "formally_confirmed",
    assignmentIds: ["va-spring-main-backdrop", "va-spring-wayfinding"],
    summary: "整包包含入口主背板、導視系統與桌牌輸出，已確認可執行並排入產線。",
    notes: "正式發包後需於 4/10 前完成所有輸出與安裝前備料。",
    replies: [
      {
        id: "vpr-001",
        author: "星澄輸出 / Amber",
        message: "整包可接，含安裝時程共 4 個工作天。",
        createdAt: "2026-03-29 13:10",
        type: "接案回覆",
      },
      {
        id: "vpr-002",
        author: "Willy",
        message: "確認並正式發包，請依 4/10 進場節奏安排。",
        createdAt: "2026-03-30 18:20",
        type: "正式發包",
      },
    ],
    formallyConfirmedAt: "2026-03-30 18:20",
    formallyConfirmedBy: "Willy",
    createdAt: "2026-03-29 09:00",
    updatedAt: "2026-03-30 18:20",
  },
  {
    id: "vp-obsidian-woodlight-001",
    projectId: "obsidian-launch-2026",
    projectName: "新品發表會主視覺與會場製作",
    vendorName: "木與光工坊",
    title: "新品發表會｜木與光工坊接待背牆發包包",
    status: "in_discussion",
    assignmentIds: ["va-obsidian-reception-wall"],
    summary: "目前針對接待區背牆木作與輸出重估中，待 final 尺寸確認後正式發包。",
    notes: "需同步確認螢幕牆開孔尺寸與走線。",
    replies: [
      {
        id: "vpr-003",
        author: "木與光工坊 / Leo",
        message: "若 4/2 前定尺寸，可保留 4/18 前交場。",
        createdAt: "2026-03-31 16:00",
        type: "時程回覆",
      },
    ],
    formallyConfirmedAt: null,
    formallyConfirmedBy: null,
    createdAt: "2026-03-31 10:00",
    updatedAt: "2026-03-31 16:00",
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

export function getAssignmentsForPackage(packageId: string) {
  return vendorAssignments.filter((assignment) => assignment.packageId === packageId);
}

export function getAssignmentStatusLabel(status: VendorAssignmentStatus) {
  const labels: Record<VendorAssignmentStatus, string> = {
    draft: "草稿",
    ready_for_packaging: "可納入發包",
    packaged: "已納入包單",
    in_vendor_discussion: "廠商往返中",
    confirmed_under_package: "已隨包正式發包",
    done: "已完成",
    cancelled: "已取消",
  };

  return labels[status];
}

export function getPackageStatusLabel(status: VendorPackageStatus) {
  const labels: Record<VendorPackageStatus, string> = {
    draft: "草稿",
    ready_to_send: "可送出",
    sent: "已送出",
    in_discussion: "往返討論中",
    formally_confirmed: "已正式發包",
    in_progress: "執行中",
    completed: "已完成",
    cancelled: "已取消",
  };

  return labels[status];
}

export function getVendorStatusClass(status: VendorAssignmentStatus | VendorPackageStatus) {
  if (["formally_confirmed", "confirmed_under_package", "in_progress", "done", "completed"].includes(status)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["ready_for_packaging", "ready_to_send", "sent", "in_discussion", "in_vendor_discussion", "packaged"].includes(status)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (["cancelled"].includes(status)) {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  return "bg-sky-50 text-sky-700 ring-sky-200";
}
