import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import type { VendorPackage } from '@/components/vendor-data';
import type { TaskConfirmationRow } from '@/lib/db/phase1-types';

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

function formatDateOnly(value: string | Date | null | undefined) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function getLatestConfirmation(confirmations: TaskConfirmationRow[]) {
  return [...confirmations].sort((a, b) => {
    if (a.confirmation_no !== b.confirmation_no) return b.confirmation_no - a.confirmation_no;
    const confirmedAtDiff = formatDateTime(b.confirmed_at).localeCompare(formatDateTime(a.confirmed_at));
    if (confirmedAtDiff !== 0) return confirmedAtDiff;
    const createdAtDiff = formatDateTime(b.created_at).localeCompare(formatDateTime(a.created_at));
    if (createdAtDiff !== 0) return createdAtDiff;
    return b.id.localeCompare(a.id);
  })[0] ?? null;
}

async function listLatestVendorConfirmationSeeds() {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const [projects, vendors] = await Promise.all([repositories.projects.list(), repositories.vendors.list()]);
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const vendorMap = new Map(vendors.map((vendor) => [vendor.id, vendor]));
  const rows: PackageSnapshotSeed[] = [];

  for (const project of projects) {
    const tasks = await repositories.vendorTasks.listByProject(project.id);

    for (const task of tasks) {
      const confirmations = await repositories.taskConfirmations.listByTask('vendor', task.id);
      const latestConfirmation = getLatestConfirmation(confirmations);
      if (!latestConfirmation) continue;

      const vendor = vendorMap.get(task.vendor_id);
      if (!vendor) continue;

      rows.push({
        confirmationId: latestConfirmation.id,
        confirmedAt: formatDateTime(latestConfirmation.confirmed_at),
        vendorTaskId: task.id,
        vendorTaskCreatedAt: formatDateTime(task.created_at),
        vendorId: vendor.id,
        vendorName: vendor.name,
        projectId: project.id,
        projectName: project.name,
        eventDate: formatDateOnly(project.event_date),
        location: project.location ?? '-',
        loadInTime: project.load_in_time ?? '-',
      });
    }
  }

  return rows.sort((a, b) => {
    if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate);
    if (a.projectName !== b.projectName) return a.projectName.localeCompare(b.projectName, 'zh-Hant');
    if (a.vendorName !== b.vendorName) return a.vendorName.localeCompare(b.vendorName, 'zh-Hant');
    if (a.confirmedAt !== b.confirmedAt) return b.confirmedAt.localeCompare(a.confirmedAt);
    return a.vendorTaskCreatedAt.localeCompare(b.vendorTaskCreatedAt);
  });
}

async function buildVendorPackageGroups(): Promise<VendorPackageGroupSeed[]> {
  const confirmationRows = await listLatestVendorConfirmationSeeds();
  const groups = new Map<string, VendorPackageGroupSeed>();

  for (const row of confirmationRows) {
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
