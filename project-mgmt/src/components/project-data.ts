export type ProjectStatus = "執行中" | "待發包" | "採購中" | "已結案";

export type Project = {
  id: string;
  code: string;
  name: string;
  client: string;
  eventDate: string;
  loadInTime: string;
  location: string;
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
    title: string;
    status: string;
    category: string;
  }>;
  designTasks: Array<{
    title: string;
    assignee: string;
    due: string;
    status: string;
  }>;
  procurementTasks: Array<{
    title: string;
    buyer: string;
    budget: string;
    status: string;
  }>;
};

export const projects: Project[] = [
  {
    id: "spring-popup-2026",
    code: "PRJ-2026-031",
    name: "春季品牌快閃活動",
    client: "森野生活",
    eventDate: "2026-04-12",
    loadInTime: "2026-04-10 09:00",
    location: "松山文創園區",
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
    loadInTime: "2026-04-18 08:00",
    location: "南港展覽館",
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
    loadInTime: "2026-04-23 10:00",
    location: "台中新光三越",
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

  if (["待發包", "待下單", "待處理", "待確認", "待拆解"].includes(status)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (["已結案"].includes(status)) {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  return "bg-sky-50 text-sky-700 ring-sky-200";
}
