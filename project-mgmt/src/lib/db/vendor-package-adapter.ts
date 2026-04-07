import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import type { VendorPackage } from '@/components/vendor-data';

type PackageSnapshotSeed = {
  confirmationId: string;
  vendorTaskId: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  eventDate: string;
  location: string;
  loadInTime: string;
};

export function buildVendorPackageId(projectId: string, vendorId: string) {
  return `pkg-${projectId}-${vendorId}`;
}

function buildPackageCode(projectId: string, vendorName: string) {
  return `PKG-${projectId}-${vendorName}`;
}

function normalizeVendorDocumentStatus(itemCount: number): VendorPackage['documentStatus'] {
  return itemCount > 0 ? '已生成' : '未生成';
}

async function listVendorConfirmationSeeds() {
  const db = createPhase1DbClient();
  return db.query<PackageSnapshotSeed>(`
    select
      tc.id as "confirmationId",
      vt.id as "vendorTaskId",
      v.id as "vendorId",
      v.name as "vendorName",
      p.id as "projectId",
      p.name as "projectName",
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      coalesce(p.location, '-') as location,
      coalesce(p.load_in_time, '-') as "loadInTime"
    from task_confirmations tc
    inner join vendor_tasks vt on vt.id = tc.task_id
    inner join vendors v on v.id = vt.vendor_id
    inner join projects p on p.id = vt.project_id
    where tc.flow_type = 'vendor'
    order by tc.confirmation_no desc, tc.confirmed_at desc
  `);
}

export async function listDbVendorPackages(): Promise<VendorPackage[]> {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const confirmations = await listVendorConfirmationSeeds();
  const dedup = new Map<string, VendorPackage>();

  for (const row of confirmations.rows) {
    const packageId = buildVendorPackageId(row.projectId, row.vendorId);
    if (dedup.has(packageId)) continue;

    const snapshots = await repositories.taskConfirmations.listSnapshots(row.confirmationId);
    dedup.set(packageId, {
      id: packageId,
      code: buildPackageCode(row.projectId, row.vendorName),
      projectId: row.projectId,
      projectName: row.projectName,
      vendorId: row.vendorId,
      vendorName: row.vendorName,
      eventDate: row.eventDate,
      location: row.location,
      loadInTime: row.loadInTime,
      note: '',
      documentStatus: normalizeVendorDocumentStatus(snapshots.length),
      items: snapshots.map((snapshot, index) => {
        const payload = snapshot.payload_json as { title?: string; requirement_text?: string | null };
        return {
          id: snapshot.id,
          assignmentId: row.vendorTaskId,
          itemName: payload.title || `處理方案 ${index + 1}`,
          requirementText: payload.requirement_text ?? '',
        };
      }),
    });
  }

  return Array.from(dedup.values());
}

export async function getDbVendorPackageById(id: string): Promise<VendorPackage | null> {
  const packages = await listDbVendorPackages();
  return packages.find((pkg) => pkg.id === id) ?? null;
}
