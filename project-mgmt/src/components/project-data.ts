export type ProjectStatus = "執行中" | "待發包" | "採購中" | "已結案";

export type ProjectExecutionSubItem = {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  category: string;
  quantity?: string;
  unit?: string;
  amount?: string;
  note?: string;
};

export type ProjectExecutionItem = {
  id: string;
  title: string;
  status: string;
  category: string;
  detail: string;
  referenceExample?: string;
  designTaskCount?: number;
  procurementTaskCount?: number;
  quantity?: string;
  unit?: string;
  amount?: string;
  note?: string;
  children?: ProjectExecutionSubItem[];
};

export type Project = {
  id: string;
  code: string;
  name: string;
  client: string;
  eventDate: string;
  location: string;
  loadInTime: string;
  eventType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactLine: string;
  owner: string;
  status: ProjectStatus;
  progress: number;
  budget: string;
  cost: string;
  note: string;
  requirements: Array<{
    id?: string;
    title: string;
    status?: string;
    category?: string;
    date?: string;
  }>;
  executionItems: ProjectExecutionItem[];
  designTasks: Array<{
    id?: string;
    title: string;
    assignee: string;
    due: string;
    status: string;
    sourceExecutionItemId?: string;
  }>;
  procurementTasks: Array<{
    id?: string;
    title: string;
    buyer: string;
    budget: string;
    status: string;
    sourceExecutionItemId?: string;
  }>;
  vendorTasks?: Array<{
    id?: string;
    title: string;
    vendorName: string;
    status: string;
    sourceExecutionItemId?: string;
  }>;
};

export function slugifyProjectName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";
}

export function getProjectRouteId(project: Pick<Project, "id" | "name">) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(project.id)
    ? slugifyProjectName(project.name)
    : project.id;
}

export const projects: Project[] = [
  {
    id: "spring-popup-2026",
    code: "PRJ-2026-031",
    name: "春季品牌快閃活動",
    client: "森野生活",
    eventDate: "2026-04-12",
    location: "松山文創園區",
    loadInTime: "08:00",
    eventType: "品牌快閃",
    contactName: "林雅晴",
    contactPhone: "0912-345-678",
    contactEmail: "yachin@morino.tw",
    contactLine: "morino-lab",
    owner: "Willy",
    status: "執行中",
    progress: 78,
    budget: "NT$ 680,000",
    cost: "NT$ 472,000",
    note: "主視覺已確認，現場背板與導視系統需於下週前定稿。",
    requirements: [
      { title: "入口主背板需搭配春季主題色與產品燈箱", status: "已確認", category: "設計" },
      { title: "現場需要 3 組陳列桌與品牌立牌", status: "執行中", category: "備品" },
      { title: "贈品包裝與動線指示需同時整合", status: "待拆解", category: "專案" },
    ],
    executionItems: [
      {
        id: "spring-item-1",
        title: "入口主背板",
        status: "進行中",
        category: "設計",
        detail: "根據春季主題色延伸入口主背板，需與產品燈箱與導視動線一致。",
        referenceExample: "春季視覺範例 A",
        designTaskCount: 1,
        procurementTaskCount: 0,
        children: [
          { id: "spring-item-1-1", title: "主背板輸出完稿", status: "進行中", assignee: "Aster", category: "設計" },
          { id: "spring-item-1-2", title: "入口燈箱視覺延伸", status: "待確認", assignee: "Mika", category: "設計" },
        ],
      },
      {
        id: "spring-item-2",
        title: "陳列桌與品牌立牌",
        status: "待交辦",
        category: "備品",
        detail: "現場需 3 組陳列桌與品牌立牌，需同步考量施工與輸出規格。",
        referenceExample: "門市陳列範例 B",
        designTaskCount: 1,
        procurementTaskCount: 1,
        children: [
          { id: "spring-item-2-1", title: "品牌立牌版型整理", status: "待交辦", assignee: "未指派", category: "設計" },
        ],
      },
      {
        id: "spring-item-3",
        title: "贈品包裝與動線指示",
        status: "待拆解",
        category: "專案",
        detail: "需同時處理贈品包裝視覺、吊卡與現場動線指示延伸。",
        referenceExample: "活動贈品範例 C",
        designTaskCount: 0,
        procurementTaskCount: 1,
        children: [
          { id: "spring-item-3-1", title: "吊卡與包裝貼紙", status: "待交辦", assignee: "未指派", category: "設計" },
          { id: "spring-item-3-2", title: "動線立牌內容整理", status: "待拆解", assignee: "未指派", category: "專案" },
        ],
      },
    ],
    designTasks: [
      { title: "主背板輸出完稿", assignee: "Aster", due: "2026-03-27", status: "進行中" },
      { title: "導視系統版型整理", assignee: "Mika", due: "2026-03-29", status: "待確認" },
    ],
    procurementTasks: [
      { title: "壓克力桌牌製作", buyer: "Momo", budget: "NT$ 18,000", status: "比價中" },
      { title: "贈品吊卡印刷", buyer: "Una", budget: "NT$ 12,500", status: "待下單" },
    ],
  },
  {
    id: "obsidian-launch-2026",
    code: "PRJ-2026-028",
    name: "新品發表會主視覺與會場製作",
    client: "曜石科技",
    eventDate: "2026-04-20",
    location: "南港展覽館",
    loadInTime: "07:30",
    eventType: "新品發表會",
    contactName: "陳柏宇",
    contactPhone: "0987-654-321",
    contactEmail: "brand@obsidian.ai",
    contactLine: "obsidian-bu",
    owner: "Ivy",
    status: "待發包",
    progress: 56,
    budget: "NT$ 1,280,000",
    cost: "NT$ 654,000",
    note: "客戶要求螢幕牆與舞台主視覺同步調整，需重新估價。",
    requirements: [
      { title: "主舞台 LED 動畫需配合新品亮點切換", status: "已確認", category: "設計" },
      { title: "接待區背牆木作需重新估價", status: "待發包", category: "廠商" },
    ],
    executionItems: [
      {
        id: "obsidian-item-1",
        title: "主舞台 LED 動畫",
        status: "進行中",
        category: "設計",
        detail: "舞台螢幕主視覺與 LED 動畫需跟新品亮點同步切換。",
        referenceExample: "舞台動畫提案 01",
        designTaskCount: 1,
        procurementTaskCount: 0,
        children: [
          { id: "obsidian-item-1-1", title: "主 KV 延伸版位", status: "進行中", assignee: "Nora", category: "設計" },
        ],
      },
      {
        id: "obsidian-item-2",
        title: "接待區背牆木作",
        status: "待發包",
        category: "廠商",
        detail: "接待區背牆尺寸與木作結構需重新估價並確認施工方式。",
        referenceExample: "背牆木作範例",
        designTaskCount: 1,
        procurementTaskCount: 0,
        children: [
          { id: "obsidian-item-2-1", title: "木作結構圖整理", status: "待確認", assignee: "Jay", category: "設計" },
        ],
      },
    ],
    designTasks: [
      { title: "主 KV 延伸版位", assignee: "Nora", due: "2026-03-30", status: "進行中" },
      { title: "場地提案簡報更新", assignee: "Jay", due: "2026-03-28", status: "待確認" },
    ],
    procurementTasks: [
      { title: "接待桌花與名牌採購", buyer: "Momo", budget: "NT$ 32,000", status: "待處理" },
    ],
  },
  {
    id: "department-store-display-2026",
    code: "PRJ-2026-024",
    name: "百貨檔期陳列與贈品備品整合",
    client: "青禾百貨",
    eventDate: "2026-04-25",
    location: "台中新光三越",
    loadInTime: "09:00",
    eventType: "百貨檔期",
    contactName: "葉思妤",
    contactPhone: "0933-222-111",
    contactEmail: "merch@greenmall.tw",
    contactLine: "greenmall-vmd",
    owner: "Neo",
    status: "採購中",
    progress: 43,
    budget: "NT$ 420,000",
    cost: "NT$ 188,000",
    note: "贈品與展示架規格尚未完全定版，採購需要保留彈性。",
    requirements: [
      { title: "檔期主視覺需同步套用至吊牌與 POP", status: "執行中", category: "設計" },
      { title: "展示架需可重複使用並可拆裝", status: "比價中", category: "備品" },
    ],
    executionItems: [
      {
        id: "dept-item-1",
        title: "POP 與價卡完稿",
        status: "待確認",
        category: "設計",
        detail: "百貨檔期 POP、價卡與吊牌需套用統一檔期主視覺。",
        referenceExample: "百貨 POP 範例",
        designTaskCount: 1,
        procurementTaskCount: 0,
        children: [
          { id: "dept-item-1-1", title: "價卡尺寸整理", status: "待確認", assignee: "Dora", category: "設計" },
        ],
      },
      {
        id: "dept-item-2",
        title: "展示架五金與配件",
        status: "採購中",
        category: "備品",
        detail: "展示架須可重複使用並具拆裝結構，需搭配五金與運輸包材。",
        referenceExample: "展示架拆裝範例",
        designTaskCount: 0,
        procurementTaskCount: 1,
        children: [
          { id: "dept-item-2-1", title: "五金包裝清單", status: "採購中", assignee: "Momo", category: "備品" },
        ],
      },
    ],
    designTasks: [
      { title: "POP 與價卡完稿", assignee: "Dora", due: "2026-03-31", status: "待確認" },
    ],
    procurementTasks: [
      { title: "展示架五金與配件採購", buyer: "Momo", budget: "NT$ 56,000", status: "採購中" },
      { title: "贈品包材追加", buyer: "Una", budget: "NT$ 24,000", status: "待下單" },
    ],
  },
];

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id);
}

export function getStatusClass(status: string) {
  if (["執行中", "進行中", "合作中", "已確認", "比價中", "採購中"].includes(status)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["待發包", "待下單", "待處理", "待確認", "待拆解", "待交辦"].includes(status)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (["已結案"].includes(status)) {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  return "bg-sky-50 text-sky-700 ring-sky-200";
}
