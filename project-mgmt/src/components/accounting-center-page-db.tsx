import { AccountingCenterPage } from '@/components/accounting-center-page';
import {
  AccountingActiveProjectRow,
  AccountingOfficeCategoryRow,
  AccountingOfficeExpenseRow,
  AccountingOtherExpenseRow,
  AccountingRevenueSummary,
} from '@/lib/db/accounting-center-adapter';

export function AccountingCenterPageDb({
  workspaceMonth,
  revenueMonth,
  activeProjects,
  officeCategories,
  officeExpenses,
  otherExpenses,
  revenueSummary,
}: {
  workspaceMonth: string;
  revenueMonth: string;
  activeProjects: AccountingActiveProjectRow[];
  officeCategories: AccountingOfficeCategoryRow[];
  officeExpenses: AccountingOfficeExpenseRow[];
  otherExpenses: AccountingOtherExpenseRow[];
  revenueSummary: AccountingRevenueSummary;
}) {
  return (
    <AccountingCenterPage
      initialDbMode
      initialWorkspaceMonth={workspaceMonth}
      initialRevenueMonth={revenueMonth}
      initialActiveProjects={activeProjects.map((item) => ({
        project: item.projectName,
        eventDate: item.eventDate,
        totalAmount: item.totalAmount,
        collectedAmount: item.collectedAmount,
      }))}
      initialOfficeCategories={officeCategories.map((item) => item.name)}
      initialOfficeExpenses={officeExpenses.map((item) => ({
        id: item.id,
        item: item.itemName,
        category: item.categoryName,
        amount: item.amount,
        note: item.note,
      }))}
      initialOtherExpenses={otherExpenses.map((item) => ({
        id: item.id,
        item: item.itemName,
        amount: item.amount,
        note: item.note,
      }))}
      initialRevenueSummary={revenueSummary}
    />
  );
}
