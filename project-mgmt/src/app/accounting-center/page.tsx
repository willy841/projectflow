import { AccountingCenterPageDb } from '@/components/accounting-center-page-db';
import {
  getAccountingPersonnelSummaryByMonth,
  getAccountingRevenueSummaryByMonth,
  listAccountingActiveProjectsByMonth,
  listAccountingOfficeCategories,
  listAccountingOfficeExpensesByMonth,
  listAccountingOtherExpensesByMonth,
  listAccountingPersonnelEmployees,
  listAccountingPersonnelRecordsByMonth,
} from '@/lib/db/accounting-center-adapter';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AccountingCenterRoute() {
  await requireAdmin();

  const workspaceMonth = '2026-04';
  const revenueMonth = '2026-04';

  const [activeProjects, officeCategories, officeExpenses, otherExpenses, revenueSummary, personnelSummary, personnelEmployees, personnelRecords] = await Promise.all([
    listAccountingActiveProjectsByMonth(workspaceMonth),
    listAccountingOfficeCategories(),
    listAccountingOfficeExpensesByMonth(workspaceMonth),
    listAccountingOtherExpensesByMonth(workspaceMonth),
    getAccountingRevenueSummaryByMonth(revenueMonth),
    getAccountingPersonnelSummaryByMonth(workspaceMonth),
    listAccountingPersonnelEmployees(),
    listAccountingPersonnelRecordsByMonth(workspaceMonth),
  ]);

  return (
    <AccountingCenterPageDb
      workspaceMonth={workspaceMonth}
      revenueMonth={revenueMonth}
      activeProjects={activeProjects}
      officeCategories={officeCategories}
      officeExpenses={officeExpenses}
      otherExpenses={otherExpenses}
      revenueSummary={revenueSummary}
      personnelSummary={personnelSummary}
      personnelEmployees={personnelEmployees}
      personnelRecords={personnelRecords}
    />
  );
}
