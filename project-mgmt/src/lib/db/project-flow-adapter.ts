import { getProjectRouteId, type Project, ProjectExecutionItem, ProjectExecutionSubItem, slugifyProjectName } from '@/components/project-data';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

function formatDateLike(value: string | Date | null | undefined): string {
  if (!value) return '-';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

export type DbBackedProject = Project & { source: 'db' | 'mock' };

function mapExecutionChild(row: {
  id: string;
  title: string;
  quantity: string | null;
  note: string | null;
}): ProjectExecutionSubItem {
  return {
    id: row.id,
    title: row.title,
    quantity: row.quantity ?? undefined,
    note: row.note ?? undefined,
  };
}

function mapExecutionItem(row: {
  id: string;
  title: string;
  size: string | null;
  material: string | null;
  structure: string | null;
  quantity: string | null;
  note: string | null;
}, children: ProjectExecutionSubItem[]): ProjectExecutionItem {
  return {
    id: row.id,
    title: row.title,
    detail: row.note ?? '待補充執行說明。',
    quantity: row.quantity ?? undefined,
    note: row.note ?? undefined,
    children,
  };
}

export async function listDbProjects(): Promise<DbBackedProject[]> {
  const repositories = createPhase1Repositories(createPhase1DbClient());
  const rows = await repositories.projects.list();

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    client: row.client_name ?? '-',
    eventDate: formatDateLike(row.event_date),
    location: row.location ?? '-',
    loadInTime: row.load_in_time ?? '-',
    eventType: row.event_type ?? '-',
    contactName: row.contact_name ?? '-',
    contactPhone: row.contact_phone ?? '-',
    contactEmail: row.contact_email ?? '-',
    contactLine: row.contact_line ?? '-',
    owner: row.owner ?? '-',
    status: (row.status as Project['status']) ?? '執行中',
    progress: 0,
    budget: 'NT$ 0',
    cost: 'NT$ 0',
    note: '',
    requirements: [],
    executionItems: [],
    designTasks: [],
    procurementTasks: [],
    source: 'db',
  }));
}

export async function getDbProjectById(id: string): Promise<DbBackedProject | null> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);
  const project = await repositories.projects.findById(id);
  if (!project) return null;

  const [executionItems, requirementRows] = await Promise.all([
    repositories.executionItems.listByProject(id),
    db.query<{ id: string; title: string; updatedAt: string }>(`
      select id, title, to_char(updated_at, 'YYYY-MM-DD HH24:MI') as "updatedAt"
      from project_requirements
      where project_id = $1
      order by updated_at desc, created_at desc
    `, [id]).catch(() => ({ rows: [] })),
  ]);

  const designTasks: Array<Awaited<ReturnType<typeof repositories.designTasks.listByProject>>[number]> = [];
  const procurementTasks: Array<Awaited<ReturnType<typeof repositories.procurementTasks.listByProject>>[number]> = [];
  const vendorTasks: Array<Awaited<ReturnType<typeof repositories.vendorTasks.listByProject>>[number]> = [];

  const rootItems = executionItems.filter((item) => !item.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  const childrenByParent = new Map<string, ProjectExecutionSubItem[]>();

  executionItems
    .filter((item) => item.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((item) => {
      const list = childrenByParent.get(item.parent_id as string) ?? [];
      list.push(mapExecutionChild(item));
      childrenByParent.set(item.parent_id as string, list);
    });

  const vendorIds = Array.from(new Set([
    ...designTasks.map((task) => task.vendor_id).filter((value): value is string => Boolean(value)),
    ...procurementTasks.map((task) => task.vendor_id).filter((value): value is string => Boolean(value)),
    ...vendorTasks.map((task) => task.vendor_id).filter((value): value is string => Boolean(value)),
  ]));
  const vendorRows = vendorIds.length
    ? await db.query<{ id: string; name: string }>(`
        select id, name
        from vendors
        where id = any($1::uuid[])
      `, [vendorIds]).then((result) => result.rows)
    : [];
  const vendorNameById = new Map(vendorRows.map((vendor) => [vendor.id, vendor.name]));

  return {
    id: project.id,
    code: project.code,
    name: project.name,
    client: project.client_name ?? '-',
    eventDate: formatDateLike(project.event_date),
    location: project.location ?? '-',
    loadInTime: project.load_in_time ?? '-',
    eventType: project.event_type ?? '-',
    contactName: project.contact_name ?? '-',
    contactPhone: project.contact_phone ?? '-',
    contactEmail: project.contact_email ?? '-',
    contactLine: project.contact_line ?? '-',
    owner: project.owner ?? '-',
    status: (project.status as Project['status']) ?? '執行中',
    progress: 0,
    budget: 'NT$ 0',
    cost: 'NT$ 0',
    note: '',
    requirements: requirementRows.rows.map((item) => ({ id: item.id, title: item.title, date: item.updatedAt })),
    executionItems: rootItems.map((item) => mapExecutionItem(item, childrenByParent.get(item.id) ?? [])),
    designTasks: designTasks.map((task) => ({
      id: task.id,
      title: task.title,
      assignee: task.assignee ?? '-',
      due: formatDateLike(project.event_date),
      status: task.status,
      sourceExecutionItemId: task.source_execution_item_id,
      size: task.size ?? '',
      material: task.structure ?? task.material ?? '',
      quantity: task.quantity ?? '',
      referenceUrl: task.reference_url ?? '',
      requirement: task.requirement_text ?? '',
    })),
    procurementTasks: procurementTasks.map((task) => ({
      id: task.id,
      title: task.title,
      buyer: task.assignee ?? vendorNameById.get(task.vendor_id ?? '') ?? '-',
      budget: task.budget_note ?? '未填寫',
      status: task.status,
      sourceExecutionItemId: task.source_execution_item_id,
      assignee: task.assignee ?? '',
      size: task.size ?? '',
      material: task.material ?? '',
      quantity: task.quantity ?? '',
      referenceUrl: task.reference_url ?? '',
      styleUrl: task.style_url ?? task.reference_url ?? '',
      requirement: task.requirement_text ?? '',
    })),
    vendorTasks: vendorTasks.map((task) => ({
      id: task.id,
      title: task.title,
      vendorName: vendorNameById.get(task.vendor_id) ?? '未指定廠商',
      status: task.status,
      sourceExecutionItemId: task.source_execution_item_id,
      assignee: task.assignee ?? '',
      category: task.category ?? '',
      specification: task.specification ?? '',
      referenceUrl: task.reference_url ?? '',
      amount: task.quoted_amount ?? '',
      requirement: task.requirement_text ?? '',
    })),
    source: 'db',
  };
}

export async function resolveDbProjectIdByRouteId(routeId: string): Promise<string | null> {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(routeId)) {
    return routeId;
  }

  const db = createPhase1DbClient();
  const result = await db.query<{ id: string; name: string }>(`
    select id, name
    from projects
    order by created_at desc
  `);
  const matched = result.rows.find((project) => {
    const route = `${slugifyProjectName(project.name)}-${project.id.slice(0, 8)}`;
    return route === routeId || slugifyProjectName(project.name) === routeId;
  });
  return matched?.id ?? null;
}
