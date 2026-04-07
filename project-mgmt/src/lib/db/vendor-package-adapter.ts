import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import type { VendorPackage } from '@/components/vendor-data';

type PackageSnapshotSeed = {
  confirmationId: string;
  confirmedAt: string;
  vendorTaskId: string;
  vendorTaskCreatedAt: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName: string;
  eventDate: string;
  location: string;
  loadInTime: string;
};

type VendorPackageGroupSeed = {
  packageId: string;
  code: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  eventDate: string;
  location: string;
  loadInTime: string;
  rows: PackageSnapshotSeed[];
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

async function listLatestVendorConfirmationSeeds() {
  const db = createPhase1DbClient();
  return db.query<PackageSnapshotSeed>(`
    with latest_vendor_confirmations as (
      select
        tc.id,
        tc.task_id,
        tc.confirmed_at,
        row_number() over (
          partition by tc.task_id
          order by tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
        ) as rn
      from task_confirmations tc
      where tc.flow_type = 'vendor'
    )
    select
      lvc.id as "confirmationId",
      coalesce(to_char(lvc.confirmed_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), '') as "confirmedAt",
      vt.id as "vendorTaskId",
      coalesce(to_char(vt.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), '') as "vendorTaskCreatedAt",
      v.id as "vendorId",
      v.name as "vendorName",
      p.id as "projectId",
      p.name as "projectName",
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      coalesce(p.location, '-') as location,
      coalesce(p.load_in_time, '-') as "loadInTime"
    from latest_vendor_confirmations lvc
    inner join vendor_tasks vt on vt.id = lvc.task_id
    inner join vendors v on v.id = vt.vendor_id
    inner join projects p on p.id = vt.project_id
    where lvc.rn = 1
    order by p.event_date nulls last, p.created_at desc, v.name asc, lvc.confirmed_at desc, vt.created_at asc
  `);
}

async function buildVendorPackageGroups(): Promise<VendorPackageGroupSeed[]> {
  const confirmationRows = await listLatestVendorConfirmationSeeds();
  const groups = new Map<string, VendorPackageGroupSeed>();

  for (const row of confirmationRows.rows) {
    const packageId = buildVendorPackageId(row.projectId, row.vendorId);
    const existing = groups.get(packageId);

    if (existing) {
      existing.rows.push(row);
      continue;
    }

    groups.set(packageId, {
      packageId,
      code: buildPackageCode(row.projectId, row.vendorName),
      projectId: row.projectId,
      projectName: row.projectName,
      vendorId: row.vendorId,
      vendorName: row.vendorName,
      eventDate: row.eventDate,
      location: row.location,
      loadInTime: row.loadInTime,
      rows: [row],
    });
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate);
    if (a.projectName !== b.projectName) return a.projectName.localeCompare(b.projectName, 'zh-Hant');
    return a.vendorName.localeCompare(b.vendorName, 'zh-Hant');
  });
}

export async function listDbVendorPackages(): Promise<VendorPackage[]> {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const groups = await buildVendorPackageGroups();

  return Promise.all(
    groups.map(async (group) => {
      const itemGroups = await Promise.all(
        group.rows.map(async (row) => ({
          row,
          snapshots: await repositories.taskConfirmations.listSnapshots(row.confirmationId),
        })),
      );

      const sortedItemGroups = itemGroups.sort((a, b) => {
        if (a.row.vendorTaskCreatedAt !== b.row.vendorTaskCreatedAt) {
          return a.row.vendorTaskCreatedAt.localeCompare(b.row.vendorTaskCreatedAt);
        }
        if (a.row.confirmedAt !== b.row.confirmedAt) {
          return a.row.confirmedAt.localeCompare(b.row.confirmedAt);
        }
        return a.row.vendorTaskId.localeCompare(b.row.vendorTaskId);
      });

      const items = sortedItemGroups.flatMap(({ row, snapshots }) =>
        snapshots.map((snapshot, index) => {
          const payload = snapshot.payload_json as { title?: string; requirement_text?: string | null };
          return {
            id: snapshot.id,
            assignmentId: row.vendorTaskId,
            itemName: payload.title || `處理方案 ${index + 1}`,
            requirementText: payload.requirement_text ?? '',
          };
        }),
      );

      return {
        id: group.packageId,
        code: group.code,
        projectId: group.projectId,
        projectName: group.projectName,
        vendorId: group.vendorId,
        vendorName: group.vendorName,
        eventDate: group.eventDate,
        location: group.location,
        loadInTime: group.loadInTime,
        note: '',
        documentStatus: normalizeVendorDocumentStatus(items.length),
        items,
      } satisfies VendorPackage;
    }),
  );
}

export async function getDbVendorPackageById(id: string): Promise<VendorPackage | null> {
  const packages = await listDbVendorPackages();
  return packages.find((pkg) => pkg.id === id) ?? null;
}
