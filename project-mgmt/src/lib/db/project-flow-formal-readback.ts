import type { ProjectFlowFormalReadbackRow } from '@/components/workflow-derived-board';
import { listDbDesignTasksByProject } from '@/lib/db/design-flow-adapter';
import { listDbProcurementTasksByProject } from '@/lib/db/procurement-flow-adapter';

export async function listDbDesignFormalReadbackRowsByProject(projectId: string): Promise<ProjectFlowFormalReadbackRow[]> {
  const tasks = await listDbDesignTasksByProject(projectId);
  return tasks.map((task) => ({
    flowType: 'design',
    projectId: task.projectId,
    taskId: task.id,
    sourceExecutionItemId: task.id,
    projectName: task.projectName,
    taskTitle: task.title,
    assignee: task.assignee === '-' ? null : task.assignee,
    requirementText: null,
    quantityText: task.quantity === '未填寫' ? null : task.quantity,
    sizeText: task.size === '未填寫' ? null : task.size,
    materialText: task.material === '未填寫' ? null : task.material,
    referenceUrl: null,
    latestConfirmationId: null,
    latestConfirmationNo: task.replyCount || null,
    confirmationStatus: task.replyCount > 0 ? '待確認' : '尚無回覆',
    latestConfirmedVendorName: null,
    latestConfirmedAmountLabel: null,
    latestConfirmedAmountValue: null,
    confirmedReplyCount: 0,
    totalReplyCount: task.replyCount,
    documentStatus: '未生成',
    generatedDocumentCount: 0,
    expectedDocumentCount: 0,
    costLocked: false,
    includeInCost: false,
  }));
}

export async function listDbProcurementFormalReadbackRowsByProject(projectId: string): Promise<ProjectFlowFormalReadbackRow[]> {
  const tasks = await listDbProcurementTasksByProject(projectId);
  return tasks.map((task) => ({
    flowType: 'procurement',
    projectId: task.projectId,
    taskId: task.id,
    sourceExecutionItemId: task.id,
    projectName: task.projectName,
    taskTitle: task.title,
    assignee: null,
    requirementText: null,
    quantityText: task.quantity === '未填寫' ? null : task.quantity,
    sizeText: null,
    materialText: null,
    referenceUrl: null,
    latestConfirmationId: null,
    latestConfirmationNo: null,
    confirmationStatus: '尚無回覆',
    latestConfirmedVendorName: null,
    latestConfirmedAmountLabel: task.costLabel === '未填寫' ? null : task.costLabel,
    latestConfirmedAmountValue: null,
    confirmedReplyCount: 0,
    totalReplyCount: 0,
    documentStatus: '未生成',
    generatedDocumentCount: 0,
    expectedDocumentCount: 0,
    costLocked: false,
    includeInCost: false,
  }));
}

export async function listDbProjectFlowFormalReadbackRowsByProject(projectId: string): Promise<ProjectFlowFormalReadbackRow[]> {
  const [designRows, procurementRows] = await Promise.all([
    listDbDesignFormalReadbackRowsByProject(projectId),
    listDbProcurementFormalReadbackRowsByProject(projectId),
  ]);
  return [...designRows, ...procurementRows];
}
