import type { ProjectFlowFormalReadbackRow } from '@/components/workflow-derived-board';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

const CANONICAL_CONFIRMATIONS_CTE = `
with latest_task_confirmations as (
  select distinct on (tc.flow_type, tc.task_id)
    tc.id,
    tc.flow_type,
    tc.task_id,
    tc.project_id,
    tc.confirmed_at
  from task_confirmations tc
  where tc.status = 'confirmed'
  order by tc.flow_type, tc.task_id, tc.confirmed_at desc, tc.created_at desc
)
`;

type FormalReadbackDbRow = {
  taskId: string;
  projectId: string;
  projectName: string;
  title: string;
  assignee: string | null;
  size: string | null;
  material: string | null;
  quantity: string | null;
  requirementText: string | null;
  referenceUrl: string | null;
  latestConfirmationId: string | null;
  latestConfirmedVendorName: string | null;
  latestConfirmedAmountLabel: string | null;
  latestConfirmedAmountValue: number | null;
  totalReplyCount: number;
};

export async function listDbDesignFormalReadbackRowsByProject(projectId: string): Promise<ProjectFlowFormalReadbackRow[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<FormalReadbackDbRow>(`
    ${CANONICAL_CONFIRMATIONS_CTE}
    select
      dt.id as "taskId",
      dt.project_id as "projectId",
      p.name as "projectName",
      dt.title,
      dt.assignee,
      dt.size,
      dt.material,
      dt.quantity,
      dt.requirement_text as "requirementText",
      dt.reference_url as "referenceUrl",
      tc.id as "latestConfirmationId",
      coalesce(v.name, nullif(ts.payload_json->>'vendor_name_text', '')) as "latestConfirmedVendorName",
      nullif(ts.payload_json->>'amount', '') as "latestConfirmedAmountLabel",
      nullif(ts.payload_json->>'amount', '')::numeric::float8 as "latestConfirmedAmountValue",
      coalesce(reply_counts.reply_count, 0)::int as "totalReplyCount"
    from design_tasks dt
    inner join projects p on p.id = dt.project_id
    left join latest_task_confirmations tc on tc.flow_type = 'design' and tc.task_id = dt.id
    left join lateral (
      select ts.payload_json
      from task_confirmation_plan_snapshots ts
      where ts.task_confirmation_id = tc.id
      order by ts.sort_order asc, ts.created_at asc
      limit 1
    ) ts on true
    left join vendors v on v.id = nullif(ts.payload_json->>'vendor_id', '')::uuid
    left join lateral (
      select count(*)::int as reply_count
      from design_task_plans dtp
      where dtp.design_task_id = dt.id
    ) reply_counts on true
    where dt.project_id = $1
    order by dt.created_at desc
  `, [projectId]);

  return rows.rows.map((row) => ({
    flowType: 'design',
    projectId: row.projectId,
    taskId: row.taskId,
    sourceExecutionItemId: row.taskId,
    projectName: row.projectName,
    taskTitle: row.title,
    assignee: row.assignee,
    requirementText: row.requirementText,
    quantityText: row.quantity,
    sizeText: row.size,
    materialText: row.material,
    referenceUrl: row.referenceUrl,
    latestConfirmationId: row.latestConfirmationId,
    latestConfirmationNo: row.latestConfirmationId ? 1 : null,
    confirmationStatus: row.latestConfirmationId ? '已確認' : row.totalReplyCount > 0 ? '待確認' : '尚無回覆',
    latestConfirmedVendorName: row.latestConfirmedVendorName,
    latestConfirmedAmountLabel: row.latestConfirmedAmountLabel,
    latestConfirmedAmountValue: row.latestConfirmedAmountValue,
    confirmedReplyCount: row.latestConfirmationId ? 1 : 0,
    totalReplyCount: row.totalReplyCount,
    documentStatus: row.latestConfirmationId ? '已生成' : '未生成',
    generatedDocumentCount: row.latestConfirmationId ? 1 : 0,
    expectedDocumentCount: row.latestConfirmationId ? 1 : 0,
    costLocked: Boolean(row.latestConfirmationId),
    includeInCost: Boolean(row.latestConfirmationId && row.latestConfirmedAmountValue != null),
  }));
}

export async function listDbProcurementFormalReadbackRowsByProject(projectId: string): Promise<ProjectFlowFormalReadbackRow[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<FormalReadbackDbRow>(`
    ${CANONICAL_CONFIRMATIONS_CTE}
    select
      pt.id as "taskId",
      pt.project_id as "projectId",
      p.name as "projectName",
      pt.title,
      null::text as assignee,
      null::text as size,
      null::text as material,
      pt.quantity,
      pt.requirement_text as "requirementText",
      pt.reference_url as "referenceUrl",
      tc.id as "latestConfirmationId",
      coalesce(v.name, nullif(ts.payload_json->>'vendor_name_text', '')) as "latestConfirmedVendorName",
      nullif(ts.payload_json->>'amount', '') as "latestConfirmedAmountLabel",
      nullif(ts.payload_json->>'amount', '')::numeric::float8 as "latestConfirmedAmountValue",
      coalesce(reply_counts.reply_count, 0)::int as "totalReplyCount"
    from procurement_tasks pt
    inner join projects p on p.id = pt.project_id
    left join latest_task_confirmations tc on tc.flow_type = 'procurement' and tc.task_id = pt.id
    left join lateral (
      select ts.payload_json
      from task_confirmation_plan_snapshots ts
      where ts.task_confirmation_id = tc.id
      order by ts.sort_order asc, ts.created_at asc
      limit 1
    ) ts on true
    left join vendors v on v.id = nullif(ts.payload_json->>'vendor_id', '')::uuid
    left join lateral (
      select count(*)::int as reply_count
      from procurement_task_plans ptp
      where ptp.procurement_task_id = pt.id
    ) reply_counts on true
    where pt.project_id = $1
    order by pt.created_at desc
  `, [projectId]);

  return rows.rows.map((row) => ({
    flowType: 'procurement',
    projectId: row.projectId,
    taskId: row.taskId,
    sourceExecutionItemId: row.taskId,
    projectName: row.projectName,
    taskTitle: row.title,
    assignee: null,
    requirementText: row.requirementText,
    quantityText: row.quantity,
    sizeText: row.size,
    materialText: row.material,
    referenceUrl: row.referenceUrl,
    latestConfirmationId: row.latestConfirmationId,
    latestConfirmationNo: row.latestConfirmationId ? 1 : null,
    confirmationStatus: row.latestConfirmationId ? '已確認' : row.totalReplyCount > 0 ? '待確認' : '尚無回覆',
    latestConfirmedVendorName: row.latestConfirmedVendorName,
    latestConfirmedAmountLabel: row.latestConfirmedAmountLabel,
    latestConfirmedAmountValue: row.latestConfirmedAmountValue,
    confirmedReplyCount: row.latestConfirmationId ? 1 : 0,
    totalReplyCount: row.totalReplyCount,
    documentStatus: row.latestConfirmationId ? '已生成' : '未生成',
    generatedDocumentCount: row.latestConfirmationId ? 1 : 0,
    expectedDocumentCount: row.latestConfirmationId ? 1 : 0,
    costLocked: Boolean(row.latestConfirmationId),
    includeInCost: Boolean(row.latestConfirmationId && row.latestConfirmedAmountValue != null),
  }));
}

export async function listDbProjectFlowFormalReadbackRowsByProject(projectId: string): Promise<ProjectFlowFormalReadbackRow[]> {
  const [designRows, procurementRows] = await Promise.all([
    listDbDesignFormalReadbackRowsByProject(projectId),
    listDbProcurementFormalReadbackRowsByProject(projectId),
  ]);
  return [...designRows, ...procurementRows];
}
