import { AccountingCenterPage } from '@/components/accounting-center-page';
import { AccountingPersonnelEditor } from '@/components/accounting-personnel-editor';
import {
  AccountingActiveProjectRow,
  AccountingOfficeCategoryRow,
  AccountingOfficeExpenseRow,
  AccountingOtherExpenseRow,
  AccountingPersonnelEmployeeRow,
  AccountingPersonnelRecordRow,
  AccountingPersonnelSummary,
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
  personnelSummary,
  personnelEmployees,
  personnelRecords,
}: {
  workspaceMonth: string;
  revenueMonth: string;
  activeProjects: AccountingActiveProjectRow[];
  officeCategories: AccountingOfficeCategoryRow[];
  officeExpenses: AccountingOfficeExpenseRow[];
  otherExpenses: AccountingOtherExpenseRow[];
  revenueSummary: AccountingRevenueSummary;
  personnelSummary: AccountingPersonnelSummary;
  personnelEmployees: AccountingPersonnelEmployeeRow[];
  personnelRecords: AccountingPersonnelRecordRow[];
}) {
  const employeeRoster = personnelEmployees.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.employeeType,
    isActive: item.isActive,
  }));

  return (
    <>
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
        initialPersonnelSummary={personnelSummary}
        initialEmployeeRoster={employeeRoster.map((item) => ({ id: item.id, name: item.name, type: item.type }))}
        initialPersonnelRecords={personnelRecords}
      />
      <div className="mt-6">
        <AccountingPersonnelEditor
          month={workspaceMonth}
          employees={employeeRoster}
          records={personnelRecords.map((item) => ({
            employeeId: item.employeeId,
            name: item.name,
            employeeType: item.employeeType,
            salaryMonth: item.salaryMonth,
            payloadJson: item.payloadJson,
          }))}
        />
      </div>
    </>
  );
}
