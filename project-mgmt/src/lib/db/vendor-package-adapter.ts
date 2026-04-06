import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export type DbVendorPackageListItem = {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  vendorName: string;
  eventDate: string;
  location: string;
  loadInTime: string;
  itemCount: number;
  documentStatus: '未生成' | '已生成' | '需更新';
  note: string;
};

export type DbVendorPackageDetail = DbVendorPackageListItem & {
  items: Array<{
    id: string;
    assignmentId: string;
    itemName: string;
    requirementText: string;
  }>;
};

type PackageSnapshotSeed = {
  confirmationId: string;
  vendorTaskId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  eventDate: string;
  location: string;
  loadInTime: string;
  taskTitle: string;
};

function buildPackageId(projectId: string, vendorName: string) {
  return `pkg-${projectId}-${encodeURIComponent(vendorName)}`;
}

function buildPackageCode(projectId: string, vendorName: string) {
  return `PKG-${projectId}-${vendorName}`;
}

function normalizeVendorDocumentStatus(itemCount: number): '未生成' | '已生成' | '需更新' {
  return itemCount > 0 ? '已生成' : '未生成';
}

export async function listDbVendorPackages(): Promise<DbVendorPackageListItem[]> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);
  const vendorTasks = await db.query<PackageSnapshotSeed>(`
    select
      tc.id as "confirmationId",
      vt.id as "vendorTaskId",
      v.name as "vendorName",
      p.id as "projectId",
      p.name as "projectName",
      coalesce(p.event_date::text, '-') as "eventDate",
      coalesce(p.location, '-') as location,
      coalesce(p.load_in_time, '-') as "loadInTime",
      vt.title as "taskTitle"
    from task_confirmations tc
    inner join vendor_tasks vt on vt.id = tc.task_id
    inner join vendors v on v.id = vt.vendor_id
    inner join projects p on p.id = vt.project_id
    where tc.flow_type = 'vendor'
    order by tc.confirmation_no desc, tc.confirmed_at desc
  `);

  const dedup = new Map<string, DbVendorPackageListItem>();

  for (const row of vendorTasks.rows) {
    const packageId = buildPackageId(row.projectId, row.vendorName);
    if (dedup.has(packageId)) continue;

    const snapshots = await repositories.taskConfirmations.listSnapshots(row.confirmationId);
    dedup.set(packageId, {
      id: packageId,
      code: buildPackageCode(row.projectId, row.vendorName),
      projectId: row.projectId,
      projectName: row.projectName,
      vendorName: row.vendorName,
      eventDate: row.eventDate,
      location: row.location,
      loadInTime: row.loadInTime,
      itemCount: snapshots.length,
      documentStatus: normalizeVendorDocumentStatus(snapshots.length),
      note: '',
    });
  }

  return Array.from(dedup.values());
}

export async function getDbVendorPackageById(id: string): Promise<DbVendorPackageDetail | null> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);
  const confirmations = await db.query<PackageSnapshotSeed>(`
    select
      tc.id as "confirmationId",
      vt.id as "vendorTaskId",
      v.name as "vendorName",
      p.id as "projectId",
      p.name as "projectName",
      coalesce(p.event_date::text, '-') as "eventDate",
      coalesce(p.location, '-') as location,
      coalesce(p.load_in_time, '-') as "loadInTime",
      vt.title as "taskTitle"
    from task_confirmations tc
    inner join vendor_tasks vt on vt.id = tc.task_id
    inner join vendors v on v.id = vt.vendor_id
    inner join projects p on p.id = vt.project_id
    where tc.flow_type = 'vendor'
    order by tc.confirmation_no desc, tc.confirmed_at desc
  `);

  for (const row of confirmations.rows) {
    const packageId = buildPackageId(row.projectId, row.vendorName);
    if (packageId !== id) continue;

    const snapshots = await repositories.taskConfirmations.listSnapshots(row.confirmationId);
    return {
      id: packageId,
      code: buildPackageCode(row.projectId, row.vendorName),
      projectId: row.projectId,
      projectName: row.projectName,
      vendorName: row.vendorName,
      eventDate: row.eventDate,
      location: row.location,
      loadInTime: row.loadInTime,
      itemCount: snapshots.length,
      documentStatus: normalizeVendorDocumentStatus(snapshots.length),
      note: '',
      items: snapshots.map((snapshot, index) => {
        const payload = snapshot.payload_json as { title?: string; requirement_text?: string | null };
        return {
          id: snapshot.id,
          assignmentId: row.vendorTaskId,
          itemName: payload.title || `處理方案 ${index + 1}`,
          requirementText: payload.requirement_text ?? '',
        };
      }),
    };
  }

  return null;
}
