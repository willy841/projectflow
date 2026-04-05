import { projects } from "@/components/project-data";

export type ConfirmStatus = "尚無回覆" | "待確認" | "已確認";
export type DocumentStatus = "未生成" | "已生成" | "需更新";

export type ProcurementPlan = {
  id: string;
  title: string;
  quantity: string;
  amount: string;
  previewUrl: string;
  vendor: string;
};

export type ProcurementDocumentRow = {
  id: number;
  item: string;
  quantity: string;
};

export type ProcurementBoardRecord = {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  size: string;
  material: string;
  quantity: string;
  replyCount: number;
  confirmStatus: ConfirmStatus;
  documentStatus: DocumentStatus;
  vendorName: string;
  costLabel: string;
  costAmount: number;
  costLocked: boolean;
  note: string;
  referenceUrl: string;
  plans: ProcurementPlan[];
  documentRows: ProcurementDocumentRow[];
};

function getConfirmStatus(status: string): ConfirmStatus {
  if (status === "採購中") return "已確認";
  if (["比價中", "待下單"].includes(status)) return "待確認";
  return "尚無回覆";
}

function getDocumentStatus(status: string, confirmStatus: ConfirmStatus): DocumentStatus {
  if (confirmStatus !== "已確認") return "未生成";
  if (status === "採購中") return "已生成";
  return status === "待下單" ? "需更新" : "未生成";
}

function getReplyCount(confirmStatus: ConfirmStatus, status: string) {
  if (confirmStatus === "已確認") return status === "採購中" ? 2 : 1;
  if (confirmStatus === "待確認") return 1;
  return 0;
}

function parseCurrency(value: string) {
  const numeric = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export const procurementTaskBoardRecords: ProcurementBoardRecord[] = projects.flatMap((project) =>
  project.procurementTasks.map((task, index) => {
    const confirmStatus = getConfirmStatus(task.status);
    const costAmount = parseCurrency(task.budget);
    const costLocked = confirmStatus === "已確認";

    const quantity = index % 2 === 0 ? "3 組" : "1 式";
    const vendorName = task.buyer || "未指定";

    return {
      id: `${project.id}-procurement-${index}`,
      projectId: project.id,
      projectName: project.name,
      title: task.title,
      size: index % 2 === 0 ? "W60 x D60 x H110 cm" : "未填寫",
      material: index % 2 === 0 ? "壓克力 / 金屬" : "紙材 / 印刷",
      quantity,
      replyCount: getReplyCount(confirmStatus, task.status),
      confirmStatus,
      documentStatus: getDocumentStatus(task.status, confirmStatus),
      vendorName,
      costLabel: task.budget,
      costAmount,
      costLocked,
      note: `此處為 ${task.title} 的 mock 原始需求說明，後續會接正式資料。`,
      referenceUrl: "https://example.com/procurement-reference",
      plans: [
        {
          id: `${project.id}-procurement-${index}-plan-a`,
          title: "主採購方案",
          quantity,
          amount: task.budget,
          previewUrl: "https://example.com/procurement-preview-a",
          vendor: vendorName,
        },
        {
          id: `${project.id}-procurement-${index}-plan-b`,
          title: "替代採購方案",
          quantity: index % 2 === 0 ? "1 組" : quantity,
          amount: index % 2 === 0 ? "NT$ 12,500" : task.budget,
          previewUrl: "https://example.com/procurement-preview-b",
          vendor: vendorName,
        },
      ],
      documentRows: [
        { id: 1, item: task.title, quantity },
        { id: 2, item: `${task.title} 備案項目`, quantity: index % 2 === 0 ? "1 組" : quantity },
      ],
    };
  }),
);
