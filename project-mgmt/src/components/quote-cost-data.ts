import { getProjectById } from "@/components/project-data";

export type QuoteCostStatus = "執行中" | "已結案";

type CostLineSource = "設計" | "備品" | "廠商";

export type QuoteCostLine = {
  id: string;
  title: string;
  adjustedAmount: number;
  originalAmount: number;
  source: CostLineSource;
  sourceLabel: string;
  vendorName: string | null;
};

export type VendorCostGroup = {
  vendorName: string | null;
  lines: QuoteCostLine[];
};

export type QuoteCostRecord = {
  projectId: string;
  quoteTotal: number;
  quoteImportedAt: string;
  quoteLineCount: number;
  reconciliationConfirmed: boolean;
  reconciliationConfirmedAt?: string;
  closeable: boolean;
  closedAt?: string;
  status: QuoteCostStatus;
  quoteFileName: string;
  note: string;
  costGroups: VendorCostGroup[];
};

const quoteCostRecords: QuoteCostRecord[] = [
  {
    projectId: "spring-popup-2026",
    quoteTotal: 680000,
    quoteImportedAt: "2026-04-01 14:20",
    quoteLineCount: 18,
    reconciliationConfirmed: false,
    closeable: false,
    status: "執行中",
    quoteFileName: "morino-spring-popup-quotation-v3.xlsx",
    note: "仍有未指定廠商的備品與設計成本待補綁，暫不建議結案。",
    costGroups: [
      {
        vendorName: "映彩視覺",
        lines: [
          { id: "spring-design-1", title: "入口主背板輸出完稿", adjustedAmount: 18000, originalAmount: 18000, source: "設計", sourceLabel: "設計文件整理 / R1", vendorName: "映彩視覺" },
          { id: "spring-design-2", title: "導視系統版型整理", adjustedAmount: 8200, originalAmount: 7600, source: "設計", sourceLabel: "設計文件整理 / R2", vendorName: "映彩視覺" },
        ],
      },
      {
        vendorName: "星澄輸出",
        lines: [
          { id: "spring-vendor-1", title: "主背板大圖輸出", adjustedAmount: 28600, originalAmount: 27400, source: "廠商", sourceLabel: "廠商發包清單 / VP-031", vendorName: "星澄輸出" },
          { id: "spring-vendor-2", title: "活動現場導視輸出", adjustedAmount: 16400, originalAmount: 16400, source: "廠商", sourceLabel: "廠商發包清單 / VP-031", vendorName: "星澄輸出" },
        ],
      },
      {
        vendorName: "木與光工坊",
        lines: [
          { id: "spring-proc-1", title: "陳列桌製作", adjustedAmount: 138000, originalAmount: 142000, source: "備品", sourceLabel: "備品整理 / PO-211", vendorName: "木與光工坊" },
          { id: "spring-proc-2", title: "品牌立牌結構", adjustedAmount: 26500, originalAmount: 24800, source: "備品", sourceLabel: "備品整理 / PO-214", vendorName: "木與光工坊" },
        ],
      },
      {
        vendorName: null,
        lines: [
          { id: "spring-unspecified-1", title: "贈品吊卡印刷", adjustedAmount: 12500, originalAmount: 12500, source: "備品", sourceLabel: "備品整理 / PO-219", vendorName: null },
          { id: "spring-unspecified-2", title: "包裝貼紙延伸設計", adjustedAmount: 6800, originalAmount: 6800, source: "設計", sourceLabel: "設計文件整理 / R3", vendorName: null },
        ],
      },
    ],
  },
  {
    projectId: "obsidian-launch-2026",
    quoteTotal: 1280000,
    quoteImportedAt: "2026-03-29 10:12",
    quoteLineCount: 26,
    reconciliationConfirmed: true,
    reconciliationConfirmedAt: "2026-04-02 16:30",
    closeable: true,
    closedAt: "2026-04-03 01:20",
    status: "已結案",
    quoteFileName: "obsidian-launch-master-quote.xlsx",
    note: "對帳已確認，專案已手動結案。",
    costGroups: [
      {
        vendorName: "曜石整合製作",
        lines: [
          { id: "obsidian-vendor-1", title: "舞台主視覺施工", adjustedAmount: 286000, originalAmount: 286000, source: "廠商", sourceLabel: "廠商發包清單 / VP-028", vendorName: "曜石整合製作" },
          { id: "obsidian-vendor-2", title: "接待區背牆木作", adjustedAmount: 196000, originalAmount: 188000, source: "廠商", sourceLabel: "廠商發包清單 / VP-028", vendorName: "曜石整合製作" },
        ],
      },
      {
        vendorName: "映彩視覺",
        lines: [
          { id: "obsidian-design-1", title: "主 KV 延伸版位", adjustedAmount: 52000, originalAmount: 52000, source: "設計", sourceLabel: "設計文件整理 / R1", vendorName: "映彩視覺" },
        ],
      },
      {
        vendorName: "霧光花藝",
        lines: [
          { id: "obsidian-proc-1", title: "接待桌花與名牌採購", adjustedAmount: 32000, originalAmount: 32000, source: "備品", sourceLabel: "備品整理 / PO-188", vendorName: "霧光花藝" },
        ],
      },
    ],
  },
  {
    projectId: "department-store-display-2026",
    quoteTotal: 420000,
    quoteImportedAt: "2026-04-02 11:08",
    quoteLineCount: 15,
    reconciliationConfirmed: false,
    closeable: false,
    status: "執行中",
    quoteFileName: "greenmall-display-quote.xlsx",
    note: "報價單已匯入，但成本仍在補齊中，尚未進入對帳確認。",
    costGroups: [
      {
        vendorName: "青木五金",
        lines: [
          { id: "dept-proc-1", title: "展示架五金與配件", adjustedAmount: 56000, originalAmount: 56000, source: "備品", sourceLabel: "備品整理 / PO-301", vendorName: "青木五金" },
        ],
      },
      {
        vendorName: null,
        lines: [
          { id: "dept-design-1", title: "POP 與價卡完稿", adjustedAmount: 24000, originalAmount: 22500, source: "設計", sourceLabel: "設計文件整理 / R1", vendorName: null },
          { id: "dept-proc-2", title: "贈品包材追加", adjustedAmount: 24000, originalAmount: 24000, source: "備品", sourceLabel: "備品整理 / PO-305", vendorName: null },
        ],
      },
    ],
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function getQuoteCostRecord(projectId: string) {
  return quoteCostRecords.find((record) => record.projectId === projectId);
}

export function getQuoteCostProjects() {
  return quoteCostRecords
    .map((record) => {
      const project = getProjectById(record.projectId);
      if (!project) return null;

      const adjustedCostTotal = sum(
        record.costGroups.flatMap((group) => group.lines.map((line) => line.adjustedAmount)),
      );
      const originalCostTotal = sum(
        record.costGroups.flatMap((group) => group.lines.map((line) => line.originalAmount)),
      );
      const grossProfit = record.quoteTotal - adjustedCostTotal;
      const hasUnassignedVendor = record.costGroups.some((group) => !group.vendorName);

      return {
        ...record,
        project,
        adjustedCostTotal,
        originalCostTotal,
        grossProfit,
        hasUnassignedVendor,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
