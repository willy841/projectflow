import { createPhase1DbClient } from '@/lib/db/phase1-client';

type OverviewMetricRow = {
  totalProjects: number;
  inProgressProjects: number;
  pendingDesignCount: number;
  pendingProcurementCount: number;
  pendingVendorCount: number;
  activeCollectedTotal: number;
  activeOutstandingTotal: number;
};

export type HomeOverviewMetric = {
  label: string;
  value: string;
  change: string;
};

export type HomeOverviewRecentProject = {
  id: string;
  name: string;
  client: string;
  eventDate: string;
  status: string;
  owner: string;
};

export type HomeOverviewReadModel = {
  headlineBadges: string[];
  metrics: HomeOverviewMetric[];
  recentProjects: HomeOverviewRecentProject[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function getHomeOverviewReadModel(): Promise<HomeOverviewReadModel> {
  const db = createPhase1DbClient();

  const metricRows = await db.query<OverviewMetricRow>(`
    with project_base as (
      select
        p.id,
        case when coalesce(p.status, '') in ('已結案', '結案') then '已結案' else '執行中' end as normalized_status
      from projects p
      where coalesce(p.status, '') not in ('已結案', '結案')
    ),
    design_pending as (
      select count(*)::int as count
      from design_tasks
      where coalesce(status, '') not in ('已完成', '已結案', 'done')
    ),
    procurement_pending as (
      select count(*)::int as count
      from procurement_tasks
      where coalesce(status, '') not in ('已完成', '已結案', 'done')
    ),
    vendor_pending as (
      select count(*)::int as count
      from vendor_tasks
      where coalesce(status, '') not in ('已完成', '已結案', 'done')
    ),
    active_projects as (
      select id
      from project_base
      where normalized_status = '執行中'
    ),
    quotation_totals as (
      select
        fqi.project_id,
        coalesce(sum(fqli.quantity * fqli.unit_price), 0)::float8 as total
      from financial_quotation_imports fqi
      inner join financial_quotation_line_items fqli on fqli.quotation_import_id = fqi.id
      where fqi.is_active = true
      group by fqi.project_id
    ),
    collection_totals as (
      select
        project_id,
        coalesce(sum(amount), 0)::float8 as total
      from project_collection_records
      group by project_id
    )
    select
      (select count(*)::int from project_base) as "totalProjects",
      (select count(*)::int from project_base where normalized_status = '執行中') as "inProgressProjects",
      (select count from design_pending) as "pendingDesignCount",
      (select count from procurement_pending) as "pendingProcurementCount",
      (select count from vendor_pending) as "pendingVendorCount",
      coalesce((
        select sum(coalesce(ct.total, 0))::float8
        from active_projects ap
        left join collection_totals ct on ct.project_id = ap.id
      ), 0)::float8 as "activeCollectedTotal",
      coalesce((
        select sum(greatest(coalesce(qt.total, 0) - coalesce(ct.total, 0), 0))::float8
        from active_projects ap
        left join quotation_totals qt on qt.project_id = ap.id
        left join collection_totals ct on ct.project_id = ap.id
      ), 0)::float8 as "activeOutstandingTotal"
  `);

  const metrics = metricRows.rows[0] ?? {
    totalProjects: 0,
    inProgressProjects: 0,
    pendingDesignCount: 0,
    pendingProcurementCount: 0,
    pendingVendorCount: 0,
    activeCollectedTotal: 0,
    activeOutstandingTotal: 0,
  };

  const recentRows = await db.query<HomeOverviewRecentProject>(`
    select
      p.id,
      p.name,
      coalesce(p.client_name, '未填寫') as client,
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      '執行中' as status,
      '-' as owner
    from projects p
    where coalesce(p.status, '') not in ('已結案', '結案')
    order by p.event_date desc nulls last, p.created_at desc
    limit 8
  `);

  return {
    headlineBadges: [
      `${metrics.inProgressProjects} 個進行中專案`,
      `${metrics.pendingDesignCount} 個待處理設計交辦`,
      `active 未收款 ${formatCurrency(metrics.activeOutstandingTotal)}`,
    ],
    metrics: [
      { label: '專案總數', value: String(metrics.totalProjects), change: `執行中 ${metrics.inProgressProjects}` },
      { label: '待處理設計交辦', value: String(metrics.pendingDesignCount), change: 'overview active aggregation' },
      { label: '待採購備品', value: String(metrics.pendingProcurementCount), change: 'overview active aggregation' },
      { label: '待廠商處理', value: String(metrics.pendingVendorCount), change: 'overview active aggregation' },
      { label: 'active 已收款', value: formatCurrency(metrics.activeCollectedTotal), change: 'active aggregation only' },
      { label: 'active 未收款', value: formatCurrency(metrics.activeOutstandingTotal), change: 'active aggregation only' },
    ],
    recentProjects: recentRows.rows,
  };
}
