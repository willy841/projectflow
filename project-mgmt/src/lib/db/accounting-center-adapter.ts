import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { getQuoteCostProjectsWithDbFinancials } from '@/lib/db/financial-flow-adapter';

export type AccountingRevenueSummary = {
  closedRevenue: number;
  closedCost: number;
  operatingExpense: number;
};

export type AccountingActiveProjectRow = {
  projectId: string;
  projectName: string;
  eventDate: string;
  totalAmount: number;
  collectedAmount: number;
  outstandingAmount: number;
};

export type AccountingOfficeExpenseRow = {
  id: string;
  expenseMonth: string;
  itemName: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  note: string;
};

export type AccountingOtherExpenseRow = {
  id: string;
  expenseMonth: string;
  itemName: string;
  amount: number;
  note: string;
};

export type AccountingOfficeCategoryRow = {
  id: string;
  name: string;
  isActive: boolean;
};

function monthRange(month: string) {
  return { start: `${month}-01`, next: new Date(`${month}-01T00:00:00Z`) };
}

function listMonthsInRange(startMonth: string, endMonth: string) {
  const result: string[] = [];
  const cursor = new Date(`${startMonth}-01T00:00:00Z`);
  const end = new Date(`${endMonth}-01T00:00:00Z`);
  while (cursor <= end) {
    result.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return result;
}

export async function listAccountingOfficeCategories(): Promise<AccountingOfficeCategoryRow[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<AccountingOfficeCategoryRow>(`
    select id, name, is_active as "isActive"
    from accounting_office_categories
    where is_active = true
    order by name asc
  `);
  return rows.rows;
}

export async function listAccountingOfficeExpensesByMonth(month: string): Promise<AccountingOfficeExpenseRow[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<AccountingOfficeExpenseRow>(`
    select
      e.id,
      e.expense_month as "expenseMonth",
      e.item_name as "itemName",
      e.category_id as "categoryId",
      c.name as "categoryName",
      e.amount::float8 as amount,
      coalesce(e.note, '') as note
    from accounting_office_expenses e
    inner join accounting_office_categories c on c.id = e.category_id
    where e.expense_month = $1
    order by e.created_at desc, e.id desc
  `, [month]);
  return rows.rows;
}

export async function listAccountingOtherExpensesByMonth(month: string): Promise<AccountingOtherExpenseRow[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<AccountingOtherExpenseRow>(`
    select
      id,
      expense_month as "expenseMonth",
      item_name as "itemName",
      amount::float8 as amount,
      coalesce(note, '') as note
    from accounting_other_expenses
    where expense_month = $1
    order by created_at desc, id desc
  `, [month]);
  return rows.rows;
}

export async function getAccountingOperatingExpenseSummaryByMonth(month: string) {
  const db = createPhase1DbClient();
  const office = await db.query<{ total: number }>(`select coalesce(sum(amount), 0)::float8 as total from accounting_office_expenses where expense_month = $1`, [month]);
  const other = await db.query<{ total: number }>(`select coalesce(sum(amount), 0)::float8 as total from accounting_other_expenses where expense_month = $1`, [month]);
  const personnel = await db.query<{ payloadJson: Record<string, unknown> }>(`
    select payload_json as "payloadJson"
    from accounting_personnel_records
    where salary_month = $1 and record_status = 'submitted'
  `, [month]);

  const personnelTotal = personnel.rows.reduce((sum, row) => sum + Number((row.payloadJson?.totalCost as number | string | undefined) ?? 0), 0);
  const officeTotal = office.rows[0]?.total ?? 0;
  const otherTotal = other.rows[0]?.total ?? 0;

  return {
    personnelTotal,
    officeTotal,
    otherTotal,
    operatingExpenseTotal: personnelTotal + officeTotal + otherTotal,
  };
}

export async function listAccountingActiveProjectsByMonth(month: string): Promise<AccountingActiveProjectRow[]> {
  const db = createPhase1DbClient();
  const projects = await getQuoteCostProjectsWithDbFinancials();
  const rows = await db.query<{ projectId: string; collectedAmount: number }>(`
    select project_id as "projectId", coalesce(sum(amount), 0)::float8 as "collectedAmount"
    from project_collection_records
    where to_char(collected_on, 'YYYY-MM') = $1
    group by project_id
  `, [month]);
  const collectedMap = new Map(rows.rows.map((row) => [row.projectId, row.collectedAmount]));

  return projects
    .filter((project) => project.projectStatus === '執行中' && project.eventDate.startsWith(month))
    .map((project) => {
      const totalAmount = project.quotationItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const collectedAmount = collectedMap.get(project.id) ?? 0;
      return {
        projectId: project.id,
        projectName: project.projectName,
        eventDate: project.eventDate,
        totalAmount,
        collectedAmount,
        outstandingAmount: totalAmount - collectedAmount,
      };
    });
}

export async function getAccountingRevenueSummaryByMonths(months: string[]): Promise<AccountingRevenueSummary> {
  const projects = await getQuoteCostProjectsWithDbFinancials();
  const operatingTotals = await Promise.all(months.map((month) => getAccountingOperatingExpenseSummaryByMonth(month)));

  const closedProjects = projects.filter((project) => project.projectStatus === '已結案' && months.some((month) => project.eventDate.startsWith(month)));
  const closedRevenue = closedProjects.reduce((sum, project) => sum + project.quotationItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0), 0);
  const closedCost = closedProjects.reduce((sum, project) => sum + project.costItems.filter((item) => item.includedInCost).reduce((acc, item) => acc + item.adjustedAmount, 0), 0);
  const operatingExpense = operatingTotals.reduce((sum, item) => sum + item.operatingExpenseTotal, 0);

  return { closedRevenue, closedCost, operatingExpense };
}

export async function getAccountingRevenueSummaryByMonth(month: string) {
  return getAccountingRevenueSummaryByMonths([month]);
}

export async function getAccountingRevenueSummaryByYear(year: string) {
  return getAccountingRevenueSummaryByMonths(Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`));
}

export async function getAccountingRevenueSummaryByRange(startMonth: string, endMonth: string) {
  return getAccountingRevenueSummaryByMonths(listMonthsInRange(startMonth, endMonth));
}
