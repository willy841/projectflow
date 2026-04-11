import { AccountingCenterPageDb } from '@/components/accounting-center-page-db';
import {
  getAccountingPersonnelSummaryByMonth,
  getAccountingRevenueSummaryByMonth,
  listAccountingActiveProjectsByMonth,
  listAccountingOfficeCategories,
  listAccountingOfficeExpensesByMonth,
  listAccountingOtherExpensesByMonth,
  listAccountingPersonnelEmployees,
} from '@/lib/db/accounting-center-adapter';

export const dynamic = 'force-dynamic';

export default async function AccountingCenterRoute() {
  const workspaceMonth = '2026-04';
  const revenueMonth = '2026-04';

  const [activeProjects, officeCategories, officeExpenses, otherExpenses, revenueSummary, personnelSummary, personnelEmployees] = await Promise.all([
    listAccountingActiveProjectsByMonth(workspaceMonth),
    listAccountingOfficeCategories(),
    listAccountingOfficeExpensesByMonth(workspaceMonth),
    listAccountingOtherExpensesByMonth(workspaceMonth),
    getAccountingRevenueSummaryByMonth(revenueMonth),
    getAccountingPersonnelSummaryByMonth(workspaceMonth),
    listAccountingPersonnelEmployees(),
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
    />
  );
}
