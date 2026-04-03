import { designTaskGroups } from "@/components/design-task-data";

export type ConfirmStatus = "尚無回覆" | "待確認" | "已確認";
export type DocumentStatus = "未生成" | "已生成" | "需更新";

export type DesignTaskBoardRecord = {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  size: string;
  material: string;
  replyCount: number;
  confirmStatus: ConfirmStatus;
  documentStatus: DocumentStatus;
  vendorName: string;
};

function getConfirmStatus(status: string, outsourceStatus: string): ConfirmStatus {
  if (outsourceStatus === "已發包") return "已確認";
  if (["進行中", "執行中", "待確認"].includes(status)) return "待確認";
  return "尚無回覆";
}

function getDocumentStatus(confirmStatus: ConfirmStatus, status: string, outsourceStatus: string): DocumentStatus {
  if (confirmStatus !== "已確認") return "未生成";
  if (outsourceStatus === "已發包" && status === "已確認") return "已生成";
  if (outsourceStatus === "已發包") return "需更新";
  return "未生成";
}

function getReplyCount(confirmStatus: ConfirmStatus, status: string) {
  if (confirmStatus === "已確認") return status === "已確認" ? 2 : 1;
  if (confirmStatus === "待確認") return 1;
  return 0;
}

export const designTaskBoardRecords: DesignTaskBoardRecord[] = designTaskGroups.map((task) => {
  const confirmStatus = getConfirmStatus(task.status, task.outsourceStatus);
  return {
    id: task.id,
    projectId: task.projectId,
    projectName: task.projectName,
    title: task.title,
    size: task.size,
    material: task.material,
    replyCount: getReplyCount(confirmStatus, task.status),
    confirmStatus,
    documentStatus: getDocumentStatus(confirmStatus, task.status, task.outsourceStatus),
    vendorName: task.outsourceTarget && task.outsourceTarget !== "尚未指定" ? task.outsourceTarget : "未指定",
  };
});
