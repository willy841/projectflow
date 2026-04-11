"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";

type MonthOption = {
  key: string;
  label: string;
};

type ActiveProjectRow = {
  project: string;
  eventDate: string;
  totalAmount: number;
  collectedAmount: number;
};

type FullTimeEmployee = {
  id: string;
  name: string;
  salaryMonth: string;
  baseSalary: number;
  allowances: Array<{ label: string; amount: number }>;
  bonuses: Array<{ label: string; amount: number }>;
  otherPayments: Array<{ label: string; amount: number }>;
  overtime: Array<{ label: string; hours: number; multiplier: number; amount: number }>;
  deductions: {
    laborInsurance: number;
    healthInsurance: number;
    dependents: number;
    leaveDeduction: number;
    other: Array<{ label: string; amount: number }>;
  };
  employerContribution: {
    laborInsurance: number;
    healthInsurance: number;
    occupationalInsurance: number;
    pension: number;
    other: Array<{ label: string; amount: number }>;
  };
};

type PartTimeEmployee = {
  id: string;
  name: string;
  salaryMonth: string;
  hours: number;
  hourlyRate: number;
};

type OfficeExpense = {
  id: string;
  item: string;
  category: string;
  amount: number;
  note: string;
};

type OtherExpense = {
  id: string;
  item: string;
  amount: number;
  note: string;
};

type RevenueSummary = {
  closedRevenue: number;
  closedCost: number;
  operatingExpense: number;
};

type MonthData = {
  activeProjects: ActiveProjectRow[];
  fullTimeEmployees: FullTimeEmployee[];
  partTimeEmployees: PartTimeEmployee[];
  officeExpenses: OfficeExpense[];
  otherExpenses: OtherExpense[];
  revenueSummary: RevenueSummary;
};

type FormEmployeeType = "full-time" | "part-time";
type RevenueMode = "month" | "year" | "range";
type PersonnelDraft = {
  fullTime: Record<string, FullTimeEmployee>;
  partTime: Record<string, PartTimeEmployee>;
};

type EmployeeRoster = {
  id: string;
  name: string;
  type: FormEmployeeType;
};

const monthOptions: MonthOption[] = [
  { key: "2026-02", label: "2026 / 2 月" },
  { key: "2026-03", label: "2026 / 3 月" },
  { key: "2026-04", label: "2026 / 4 月" },
  { key: "2026-05", label: "2026 / 5 月" },
];

const accountingDataByMonth: Record<string, MonthData> = {
  "2026-02": {
    activeProjects: [
      { project: "春季快閃店執行", eventDate: "2026-02-18", totalAmount: 420000, collectedAmount: 210000 },
      { project: "企業內訓展區佈置", eventDate: "2026-02-26", totalAmount: 380000, collectedAmount: 380000 },
    ],
    fullTimeEmployees: [
      {
        id: "ft-amy",
        name: "Amy",
        salaryMonth: "2026-02",
        baseSalary: 52000,
        allowances: [{ label: "交通津貼", amount: 3000 }],
        bonuses: [{ label: "專案績效", amount: 5000 }],
        otherPayments: [{ label: "值班補助", amount: 2000 }],
        overtime: [
          { label: "加班前兩小時", hours: 8, multiplier: 1.34, amount: 2787 },
          { label: "加班兩小時後", hours: 3, multiplier: 1.67, amount: 1301 },
          { label: "假日加班", hours: 0, multiplier: 2, amount: 0 },
        ],
        deductions: {
          laborInsurance: 1250,
          healthInsurance: 920,
          dependents: 0,
          leaveDeduction: 0,
          other: [{ label: "團保分攤", amount: 350 }],
        },
        employerContribution: {
          laborInsurance: 2520,
          healthInsurance: 1850,
          occupationalInsurance: 160,
          pension: 3120,
          other: [{ label: "福委會提列", amount: 600 }],
        },
      },
    ],
    partTimeEmployees: [
      { id: "pt-ian", name: "Ian", salaryMonth: "2026-02", hours: 48, hourlyRate: 250 },
    ],
    officeExpenses: [
      { id: "office-1", item: "物流車趟", category: "物流", amount: 18000, note: "北中南三地轉運" },
      { id: "office-2", item: "行政採買", category: "行政", amount: 6200, note: "文具與辦公耗材" },
    ],
    otherExpenses: [
      { id: "other-1", item: "臨時外包雜支", amount: 8800, note: "現場臨時支援" },
    ],
    revenueSummary: { closedRevenue: 560000, closedCost: 318000, operatingExpense: 102258 },
  },
  "2026-03": {
    activeProjects: [
      { project: "品牌論壇主視覺與搭建", eventDate: "2026-03-12", totalAmount: 620000, collectedAmount: 320000 },
      { project: "春季巡迴展示活動", eventDate: "2026-03-27", totalAmount: 540000, collectedAmount: 120000 },
      { project: "校園徵才展策展", eventDate: "2026-03-30", totalAmount: 280000, collectedAmount: 0 },
    ],
    fullTimeEmployees: [
      {
        id: "ft-amy",
        name: "Amy",
        salaryMonth: "2026-03",
        baseSalary: 52000,
        allowances: [{ label: "交通津貼", amount: 3000 }],
        bonuses: [{ label: "專案績效", amount: 7000 }],
        otherPayments: [{ label: "通訊補助", amount: 1500 }],
        overtime: [
          { label: "加班前兩小時", hours: 10, multiplier: 1.34, amount: 3484 },
          { label: "加班兩小時後", hours: 4, multiplier: 1.67, amount: 1734 },
          { label: "假日加班", hours: 6, multiplier: 2, amount: 3104 },
        ],
        deductions: {
          laborInsurance: 1250,
          healthInsurance: 920,
          dependents: 0,
          leaveDeduction: 0,
          other: [{ label: "團保分攤", amount: 350 }],
        },
        employerContribution: {
          laborInsurance: 2520,
          healthInsurance: 1850,
          occupationalInsurance: 160,
          pension: 3120,
          other: [{ label: "福委會提列", amount: 600 }],
        },
      },
      {
        id: "ft-zoe",
        name: "Zoe",
        salaryMonth: "2026-03",
        baseSalary: 46000,
        allowances: [{ label: "專案津貼", amount: 4500 }],
        bonuses: [],
        otherPayments: [{ label: "值班補助", amount: 1800 }],
        overtime: [
          { label: "加班前兩小時", hours: 6, multiplier: 1.34, amount: 2310 },
          { label: "加班兩小時後", hours: 2, multiplier: 1.67, amount: 959 },
          { label: "假日加班", hours: 0, multiplier: 2, amount: 0 },
        ],
        deductions: {
          laborInsurance: 1180,
          healthInsurance: 860,
          dependents: 0,
          leaveDeduction: 0,
          other: [],
        },
        employerContribution: {
          laborInsurance: 2380,
          healthInsurance: 1710,
          occupationalInsurance: 145,
          pension: 2760,
          other: [],
        },
      },
    ],
    partTimeEmployees: [
      { id: "pt-ian", name: "Ian", salaryMonth: "2026-03", hours: 56, hourlyRate: 260 },
      { id: "pt-may", name: "May", salaryMonth: "2026-03", hours: 32, hourlyRate: 240 },
    ],
    officeExpenses: [
      { id: "office-1", item: "物流車趟", category: "物流", amount: 24000, note: "台中與高雄跨區支援" },
      { id: "office-2", item: "行政採買", category: "行政", amount: 6800, note: "文具與清潔備品" },
      { id: "office-3", item: "倉儲租金", category: "倉儲", amount: 26000, note: "三月短租倉位" },
    ],
    otherExpenses: [
      { id: "other-1", item: "臨時外包雜支", amount: 9200, note: "施工支援加派" },
      { id: "other-2", item: "現場餐費補助", amount: 3600, note: "三場活動工作餐" },
    ],
    revenueSummary: { closedRevenue: 780000, closedCost: 462000, operatingExpense: 185293 },
  },
  "2026-04": {
    activeProjects: [
      { project: "百貨檔期主題櫥窗", eventDate: "2026-04-14", totalAmount: 880000, collectedAmount: 320000 },
      { project: "品牌發表會展台輸出", eventDate: "2026-04-21", totalAmount: 540000, collectedAmount: 120000 },
      { project: "企業家庭日活動統籌", eventDate: "2026-04-27", totalAmount: 678000, collectedAmount: 0 },
    ],
    fullTimeEmployees: [
      {
        id: "ft-amy",
        name: "Amy",
        salaryMonth: "2026-04",
        baseSalary: 52000,
        allowances: [{ label: "交通津貼", amount: 3000 }],
        bonuses: [{ label: "專案績效", amount: 9000 }],
        otherPayments: [{ label: "通訊補助", amount: 1500 }],
        overtime: [
          { label: "加班前兩小時", hours: 12, multiplier: 1.34, amount: 4181 },
          { label: "加班兩小時後", hours: 6, multiplier: 1.67, amount: 2601 },
          { label: "假日加班", hours: 8, multiplier: 2, amount: 4138 },
        ],
        deductions: {
          laborInsurance: 1250,
          healthInsurance: 920,
          dependents: 0,
          leaveDeduction: 0,
          other: [{ label: "團保分攤", amount: 350 }],
        },
        employerContribution: {
          laborInsurance: 2520,
          healthInsurance: 1850,
          occupationalInsurance: 160,
          pension: 3120,
          other: [{ label: "福委會提列", amount: 600 }],
        },
      },
      {
        id: "ft-zoe",
        name: "Zoe",
        salaryMonth: "2026-04",
        baseSalary: 46000,
        allowances: [{ label: "專案津貼", amount: 4500 }],
        bonuses: [{ label: "結案獎金", amount: 4000 }],
        otherPayments: [{ label: "值班補助", amount: 1800 }],
        overtime: [
          { label: "加班前兩小時", hours: 8, multiplier: 1.34, amount: 3080 },
          { label: "加班兩小時後", hours: 4, multiplier: 1.67, amount: 1918 },
          { label: "假日加班", hours: 4, multiplier: 2, amount: 2359 },
        ],
        deductions: {
          laborInsurance: 1180,
          healthInsurance: 860,
          dependents: 0,
          leaveDeduction: 1200,
          other: [],
        },
        employerContribution: {
          laborInsurance: 2380,
          healthInsurance: 1710,
          occupationalInsurance: 145,
          pension: 2760,
          other: [],
        },
      },
    ],
    partTimeEmployees: [
      { id: "pt-ian", name: "Ian", salaryMonth: "2026-04", hours: 62, hourlyRate: 260 },
      { id: "pt-may", name: "May", salaryMonth: "2026-04", hours: 40, hourlyRate: 240 },
      { id: "pt-neo", name: "Neo", salaryMonth: "2026-04", hours: 28, hourlyRate: 250 },
    ],
    officeExpenses: [
      { id: "office-1", item: "物流車趟", category: "物流", amount: 28000, note: "北中南巡迴轉運" },
      { id: "office-2", item: "行政採買", category: "行政", amount: 7200, note: "行政耗材與會議補給" },
      { id: "office-3", item: "倉儲租金", category: "倉儲", amount: 26000, note: "專案器材暫放" },
    ],
    otherExpenses: [
      { id: "other-1", item: "臨時外包雜支", amount: 10400, note: "現場施工臨時調派" },
      { id: "other-2", item: "現場餐費補助", amount: 4300, note: "工作餐與夜間加班補貼" },
    ],
    revenueSummary: { closedRevenue: 968000, closedCost: 586000, operatingExpense: 207554 },
  },
  "2026-05": {
    activeProjects: [
      { project: "夏季快閃陳列統包", eventDate: "2026-05-08", totalAmount: 720000, collectedAmount: 180000 },
      { project: "校園畢業展展區工程", eventDate: "2026-05-17", totalAmount: 498000, collectedAmount: 0 },
    ],
    fullTimeEmployees: [],
    partTimeEmployees: [],
    officeExpenses: [],
    otherExpenses: [],
    revenueSummary: { closedRevenue: 420000, closedCost: 265000, operatingExpense: 0 },
  },
};

const initialPersonnelRoster: EmployeeRoster[] = [
  { id: "ft-amy", name: "Amy", type: "full-time" },
  { id: "ft-zoe", name: "Zoe", type: "full-time" },
  { id: "pt-ian", name: "Ian", type: "part-time" },
  { id: "pt-may", name: "May", type: "part-time" },
  { id: "pt-neo", name: "Neo", type: "part-time" },
];

export function AccountingCenterPage({
  initialDbMode = false,
  initialWorkspaceMonth = '2026-04',
  initialRevenueMonth = '2026-04',
  initialActiveProjects,
  initialOfficeCategories,
  initialOfficeExpenses,
  initialOtherExpenses,
  initialRevenueSummary,
  initialPersonnelSummary,
}: {
  initialDbMode?: boolean;
  initialWorkspaceMonth?: string;
  initialRevenueMonth?: string;
  initialActiveProjects?: ActiveProjectRow[];
  initialOfficeCategories?: string[];
  initialOfficeExpenses?: OfficeExpense[];
  initialOtherExpenses?: OtherExpense[];
  initialRevenueSummary?: RevenueSummary;
  initialPersonnelSummary?: { fullTimeCount: number; partTimeCount: number; fullTimeCost: number; partTimeCost: number; total: number };
} = {}) {
  const [workspaceMonth, setWorkspaceMonth] = useState<string>(initialWorkspaceMonth);
  const [revenueMonth, setRevenueMonth] = useState<string>(initialRevenueMonth);
  const [employeeFilter, setEmployeeFilter] = useState<FormEmployeeType>("full-time");
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showManageOfficeCategories, setShowManageOfficeCategories] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [personnelViewMode, setPersonnelViewMode] = useState<"preview" | "edit">("preview");
  const [recordDrawer, setRecordDrawer] = useState<{ type: "full-time" | "part-time" | "office" | "other"; id: string } | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<"active-projects" | "operating-expenses">("active-projects");
  const [expenseTab, setExpenseTab] = useState<"personnel" | "office" | "other" | "editor">("personnel");
  const [expenseEditorTab, setExpenseEditorTab] = useState<"personnel" | "office" | "other">("personnel");
  const [revenueMode, setRevenueMode] = useState<RevenueMode>("month");
  const [rangeStart, setRangeStart] = useState("2026-03");
  const [rangeEnd, setRangeEnd] = useState("2026-04");
  const [yearSelection, setYearSelection] = useState("2026");
  const [employeeRoster, setEmployeeRoster] = useState<EmployeeRoster[]>(initialPersonnelRoster);
  const [officeCategories, setOfficeCategories] = useState(initialOfficeCategories ?? ["物流", "行政", "倉儲"]);
  const [fullTimeDrafts, setFullTimeDrafts] = useState<Record<string, FullTimeEmployee>>(() => buildInitialDrafts().fullTime);
  const [partTimeDrafts, setPartTimeDrafts] = useState<Record<string, PartTimeEmployee>>(() => buildInitialDrafts().partTime);
  const [personnelRecordsByMonth, setPersonnelRecordsByMonth] = useState<Record<string, PersonnelDraft>>(() => buildInitialRecordsByMonth());
  const [officeExpensesByMonth, setOfficeExpensesByMonth] = useState<Record<string, OfficeExpense[]>>(() => initialDbMode ? { [initialWorkspaceMonth]: initialOfficeExpenses ?? [] } : buildInitialOfficeExpensesByMonth());
  const [otherExpensesByMonth, setOtherExpensesByMonth] = useState<Record<string, OtherExpense[]>>(() => initialDbMode ? { [initialWorkspaceMonth]: initialOtherExpenses ?? [] } : buildInitialOtherExpensesByMonth());
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeType, setNewEmployeeType] = useState<FormEmployeeType>("full-time");
  const [newOfficeCategory, setNewOfficeCategory] = useState("");
  const [officeExpenseForm, setOfficeExpenseForm] = useState<{ mode: "create" | "edit"; id?: string; item: string; category: string; amount: string; note: string } | null>(null);
  const [otherExpenseForm, setOtherExpenseForm] = useState<{ mode: "create" | "edit"; id?: string; item: string; amount: string; note: string } | null>(null);

  const monthData = initialDbMode
    ? {
        activeProjects: initialActiveProjects ?? [],
        fullTimeEmployees: [],
        partTimeEmployees: [],
        officeExpenses: initialOfficeExpenses ?? [],
        otherExpenses: initialOtherExpenses ?? [],
        revenueSummary: initialRevenueSummary ?? { closedRevenue: 0, closedCost: 0, operatingExpense: 0 },
      }
    : accountingDataByMonth[workspaceMonth];
  const activeProjectSummary = useMemo(() => {
    const total = monthData.activeProjects.reduce((sum, item) => sum + item.totalAmount, 0);
    const collected = monthData.activeProjects.reduce((sum, item) => sum + item.collectedAmount, 0);
    return {
      total,
      collected,
      outstanding: total - collected,
    };
  }, [monthData.activeProjects]);

  const currentOfficeExpenses = officeExpensesByMonth[workspaceMonth] ?? [];
  const currentOtherExpenses = otherExpensesByMonth[workspaceMonth] ?? [];
  const monthPersonnelRecords = personnelRecordsByMonth[workspaceMonth] ?? { fullTime: {}, partTime: {} };
  const fullTimeRecords = Object.values(monthPersonnelRecords.fullTime);
  const partTimeRecords = Object.values(monthPersonnelRecords.partTime);
  const personnelSummary = useMemo(() => {
    if (initialDbMode && initialPersonnelSummary) {
      return initialPersonnelSummary;
    }
    const fullTimeCost = fullTimeRecords.reduce((sum, record) => sum + calculateFullTimeCost(record), 0);
    const partTimeCost = partTimeRecords.reduce((sum, record) => sum + calculatePartTimePay(record), 0);
    return {
      fullTimeCount: fullTimeRecords.length,
      partTimeCount: partTimeRecords.length,
      fullTimeCost,
      partTimeCost,
      total: fullTimeCost + partTimeCost,
    };
  }, [fullTimeRecords, initialDbMode, initialPersonnelSummary, partTimeRecords]);

  const officeExpenseSummary = currentOfficeExpenses.reduce((sum, item) => sum + item.amount, 0);
  const otherExpenseSummary = currentOtherExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalOperatingExpense = personnelSummary.total + officeExpenseSummary + otherExpenseSummary;

  const filteredRoster = employeeRoster.filter((employee) => employee.type === employeeFilter);

  const revenueSnapshot = useMemo(() => {
    if (initialDbMode) {
      return initialRevenueSummary ?? { closedRevenue: 0, closedCost: 0, operatingExpense: 0 };
    }
    const scopedMonths = getScopedMonths(revenueMode, revenueMonth, yearSelection, rangeStart, rangeEnd);
    return scopedMonths.reduce(
      (acc, monthKey) => {
        const scopedMonth = accountingDataByMonth[monthKey];
        if (!scopedMonth) return acc;
        acc.closedRevenue += scopedMonth.revenueSummary.closedRevenue;
        acc.closedCost += scopedMonth.revenueSummary.closedCost;
        acc.operatingExpense += (personnelRecordsByMonth[monthKey]
          ? Object.values(personnelRecordsByMonth[monthKey].fullTime).reduce((sum, item) => sum + calculateFullTimeCost(item), 0) +
            Object.values(personnelRecordsByMonth[monthKey].partTime).reduce((sum, item) => sum + calculatePartTimePay(item), 0)
          : 0) +
          (officeExpensesByMonth[monthKey] ?? []).reduce((sum, item) => sum + item.amount, 0) +
          (otherExpensesByMonth[monthKey] ?? []).reduce((sum, item) => sum + item.amount, 0);
        return acc;
      },
      { closedRevenue: 0, closedCost: 0, operatingExpense: 0 },
    );
  }, [initialDbMode, initialRevenueSummary, officeExpensesByMonth, otherExpensesByMonth, personnelRecordsByMonth, rangeEnd, rangeStart, revenueMode, revenueMonth, yearSelection]);

  const revenueCards = [
    { label: "已結案總收入", value: formatCurrency(revenueSnapshot.closedRevenue), hint: "承接 Closeout 已結案專案的收入摘要" },
    { label: "已結案總成本", value: formatCurrency(revenueSnapshot.closedCost), hint: "承接 Closeout 已結案專案的最終成本摘要" },
    { label: "營運支出", value: formatCurrency(revenueSnapshot.operatingExpense), hint: "正式對齊管銷成本（= 營運支出）" },
    {
      label: "利潤總計",
      value: formatCurrency(revenueSnapshot.closedRevenue - revenueSnapshot.closedCost - revenueSnapshot.operatingExpense),
      hint: "利潤 = 已結案總收入 - 已結案總成本 - 營運支出",
      emphasize: true,
    },
  ];

  function handleAddEmployee() {
    const name = newEmployeeName.trim();
    if (!name) return;
    const id = `${newEmployeeType === "full-time" ? "ft" : "pt"}-${name.toLowerCase().replace(/\s+/g, "-")}`;
    if (employeeRoster.some((employee) => employee.id === id || employee.name === name)) return;

    setEmployeeRoster((current) => [...current, { id, name, type: newEmployeeType }]);

    if (newEmployeeType === "full-time") {
      setFullTimeDrafts((current) => ({
        ...current,
        [id]: buildDefaultFullTimeDraft(id, name, workspaceMonth),
      }));
    } else {
      setPartTimeDrafts((current) => ({
        ...current,
        [id]: buildDefaultPartTimeDraft(id, name, workspaceMonth),
      }));
    }

    setEmployeeFilter(newEmployeeType);
    setEditingEmployeeId(id);
    setNewEmployeeName("");
    setNewEmployeeType("full-time");
    setShowAddEmployeeModal(false);
  }

  function handleDeleteEmployee(employeeId: string) {
    const target = employeeRoster.find((employee) => employee.id === employeeId);
    if (!target) return;
    const confirmed = window.confirm(`確認刪除員工「${target.name}」？這會把他從目前的人事輸入名單移除。`);
    if (!confirmed) return;

    setEmployeeRoster((current) => current.filter((employee) => employee.id !== employeeId));
    setFullTimeDrafts((current) => {
      const next = { ...current };
      delete next[employeeId];
      return next;
    });
    setPartTimeDrafts((current) => {
      const next = { ...current };
      delete next[employeeId];
      return next;
    });
    setPersonnelRecordsByMonth((current) => {
      const next: Record<string, PersonnelDraft> = {};
      for (const [monthKey, records] of Object.entries(current)) {
        const fullTime = { ...records.fullTime };
        const partTime = { ...records.partTime };
        delete fullTime[employeeId];
        delete partTime[employeeId];
        next[monthKey] = { fullTime, partTime };
      }
      return next;
    });

    if (editingEmployeeId === employeeId) {
      setEditingEmployeeId(null);
    }
  }

  function handlePersonnelSubmit(employeeId: string) {
    const employee = employeeRoster.find((item) => item.id === employeeId);
    if (!employee) return;

    if (employee.type === "full-time") {
      const draft = fullTimeDrafts[employeeId];
      if (!draft) return;
      const targetMonth = draft.salaryMonth;
      const exists = Boolean(personnelRecordsByMonth[targetMonth]?.fullTime[employeeId]);
      if (exists) {
        const overwrite = window.confirm(`同一員工在 ${targetMonth} 已有正式紀錄，是否覆蓋？`);
        if (!overwrite) return;
      }
      setPersonnelRecordsByMonth((current) => ({
        ...current,
        [targetMonth]: {
          fullTime: {
            ...(current[targetMonth]?.fullTime ?? {}),
            [employeeId]: draft,
          },
          partTime: current[targetMonth]?.partTime ?? {},
        },
      }));
      setWorkspaceMonth(targetMonth);
      window.alert(`已送出 ${employee.name} 的人事資料到 ${targetMonth}`);
      setEditingEmployeeId(null);
      return;
    }

    const draft = partTimeDrafts[employeeId];
    if (!draft) return;
    const targetMonth = draft.salaryMonth;
    const exists = Boolean(personnelRecordsByMonth[targetMonth]?.partTime[employeeId]);
    if (exists) {
      const overwrite = window.confirm(`同一員工在 ${targetMonth} 已有正式紀錄，是否覆蓋？`);
      if (!overwrite) return;
    }
    setPersonnelRecordsByMonth((current) => ({
      ...current,
      [targetMonth]: {
        fullTime: current[targetMonth]?.fullTime ?? {},
        partTime: {
          ...(current[targetMonth]?.partTime ?? {}),
          [employeeId]: draft,
        },
      },
    }));
    setWorkspaceMonth(targetMonth);
    window.alert(`已送出 ${employee.name} 的兼職資料到 ${targetMonth}`);
    setEditingEmployeeId(null);
  }

  function handleAddOfficeCategory() {
    const label = newOfficeCategory.trim();
    if (!label || officeCategories.includes(label)) return;
    setOfficeCategories((current) => [...current, label]);
    setNewOfficeCategory("");
  }

  function handleDeleteOfficeCategory(label: string) {
    const used = Object.values(officeExpensesByMonth).some((items) => items.some((item) => item.category === label));
    if (used) {
      window.alert(`分類「${label}」已有既有支出使用，這一輪前端 workflow 先禁止刪除。`);
      return;
    }
    setOfficeCategories((current) => current.filter((category) => category !== label));
  }

  function handleSubmitOfficeExpense() {
    if (!officeExpenseForm) return;
    const item = officeExpenseForm.item.trim();
    const category = officeExpenseForm.category.trim();
    const amount = Number(officeExpenseForm.amount);
    if (!item || !category || Number.isNaN(amount)) return;

    setOfficeExpensesByMonth((current) => {
      const currentMonthItems = current[workspaceMonth] ?? [];
      const nextItem: OfficeExpense = {
        id: officeExpenseForm.id ?? `office-${Date.now()}`,
        item,
        category,
        amount,
        note: officeExpenseForm.note.trim(),
      };
      return {
        ...current,
        [workspaceMonth]: officeExpenseForm.mode === "edit"
          ? currentMonthItems.map((expense) => (expense.id === nextItem.id ? nextItem : expense))
          : [...currentMonthItems, nextItem],
      };
    });
    setOfficeExpenseForm(null);
  }

  function handleSubmitOtherExpense() {
    if (!otherExpenseForm) return;
    const item = otherExpenseForm.item.trim();
    const amount = Number(otherExpenseForm.amount);
    if (!item || Number.isNaN(amount)) return;

    setOtherExpensesByMonth((current) => {
      const currentMonthItems = current[workspaceMonth] ?? [];
      const nextItem: OtherExpense = {
        id: otherExpenseForm.id ?? `other-${Date.now()}`,
        item,
        amount,
        note: otherExpenseForm.note.trim(),
      };
      return {
        ...current,
        [workspaceMonth]: otherExpenseForm.mode === "edit"
          ? currentMonthItems.map((expense) => (expense.id === nextItem.id ? nextItem : expense))
          : [...currentMonthItems, nextItem],
      };
    });
    setOtherExpenseForm(null);
  }

  function handleDeleteOfficeExpense(id: string) {
    if (!window.confirm("確認刪除這筆庶務支出？")) return;
    setOfficeExpensesByMonth((current) => ({
      ...current,
      [workspaceMonth]: (current[workspaceMonth] ?? []).filter((item) => item.id !== id),
    }));
  }

  function handleDeleteOtherExpense(id: string) {
    if (!window.confirm("確認刪除這筆其他支出？")) return;
    setOtherExpensesByMonth((current) => ({
      ...current,
      [workspaceMonth]: (current[workspaceMonth] ?? []).filter((item) => item.id !== id),
    }));
  }

  return (
    <AppShell activePath="/accounting-center">
      <div className="space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">帳務中心</h2>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">營收概況</h3>
            <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center xl:gap-4">
              <div className="flex flex-wrap gap-2">
                {([
                  ["month", "月份"],
                  ["year", "年份"],
                  ["range", "年份區間"],
                ] as Array<[RevenueMode, string]>).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setRevenueMode(mode)}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ring-1 transition ${revenueMode === mode ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {revenueMode === "month" ? (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <span className="text-sm font-semibold text-slate-700">月份</span>
                  <input
                    value={revenueMonth}
                    onChange={(event) => setRevenueMonth(event.target.value)}
                    list="revenue-month-options"
                    className="h-9 w-32 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>
              ) : null}

              {revenueMode === "year" ? (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <span className="text-sm font-semibold text-slate-700">年份</span>
                  <input
                    value={yearSelection}
                    onChange={(event) => setYearSelection(event.target.value)}
                    className="h-9 w-28 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>
              ) : null}

              {revenueMode === "range" ? (
                <>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <span className="text-sm font-semibold text-slate-700">起始</span>
                    <input
                      value={rangeStart}
                      onChange={(event) => setRangeStart(event.target.value)}
                      className="h-9 w-32 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <span className="text-sm font-semibold text-slate-700">結束</span>
                    <input
                      value={rangeEnd}
                      onChange={(event) => setRangeEnd(event.target.value)}
                      className="h-9 w-32 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400"
                    />
                  </div>
                  <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">區間：</span>
                    {rangeStart} ～ {rangeEnd}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <datalist id="revenue-month-options">
            {monthOptions.map((month) => <option key={month.key} value={month.key} />)}
          </datalist>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {revenueCards.map((card) => (
              <MetricCard
                key={card.label}
                label={card.label}
                value={card.value}
                hint={card.hint}
                tone={card.emphasize ? "emerald" : "slate"}
                emphasize={card.emphasize}
              />
            ))}
          </div>

        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900">帳務管理</h3>
              <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setWorkspaceTab("active-projects")} className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ring-1 transition ${workspaceTab === "active-projects" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>執行中專案</button>
              <button type="button" onClick={() => setWorkspaceTab("operating-expenses")} className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ring-1 transition ${workspaceTab === "operating-expenses" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>管銷成本</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {monthOptions.map((month) => {
                const active = workspaceMonth === month.key;
                return (
                  <button
                    key={month.key}
                    type="button"
                    onClick={() => setWorkspaceMonth(month.key)}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ring-1 transition ${
                      active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
          </div>

          {workspaceTab === "active-projects" ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="總金額" value={formatCurrency(activeProjectSummary.total)} hint="本月份進行中專案總金額" tone="slate" compact />
                <MetricCard label="已收款" value={formatCurrency(activeProjectSummary.collected)} hint="目前已收回金額" tone="emerald" compact />
                <MetricCard label="未收款" value={formatCurrency(activeProjectSummary.outstanding)} hint="尚未收回金額" tone="amber" compact />
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      {['專案名稱', '活動日期', '總金額', '已收款', '未收款', '查看詳情'].map((header) => (
                        <th key={header} className="px-4 py-3 font-medium whitespace-nowrap">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {monthData.activeProjects.map((project) => (
                      <tr key={project.project} className="align-middle">
                        <td className="px-4 py-3 font-semibold text-slate-900">{project.project}</td>
                        <td className="px-4 py-3 text-slate-600">{project.eventDate}</td>
                        <td className="px-4 py-3 text-slate-900">{formatCurrency(project.totalAmount)}</td>
                        <td className="px-4 py-3 text-slate-900">{formatCurrency(project.collectedAmount)}</td>
                        <td className="px-4 py-3 font-semibold text-amber-700">{formatCurrency(Math.max(project.totalAmount - project.collectedAmount, 0))}</td>
                        <td className="px-4 py-3">
                          <Link href="/quote-costs" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">查看詳情</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid gap-3 sm:grid-cols-4">
                <MetricCard label="人事成本" value={formatCurrency(personnelSummary.total)} hint="正職 + 兼職" tone="rose" compact />
                <MetricCard label="庶務成本" value={formatCurrency(officeExpenseSummary)} hint="物流 / 行政 / 倉儲" tone="sky" compact />
                <MetricCard label="其他成本" value={formatCurrency(otherExpenseSummary)} hint="其他營運支出" tone="violet" compact />
                <MetricCard label="營運支出總計" value={formatCurrency(totalOperatingExpense)} hint="本月份總計" tone="amber" compact />
              </div>

              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                <button type="button" onClick={() => setExpenseTab("personnel")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${expenseTab === "personnel" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>人事</button>
                <button type="button" onClick={() => setExpenseTab("office")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${expenseTab === "office" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>庶務</button>
                <button type="button" onClick={() => setExpenseTab("other")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${expenseTab === "other" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>其他</button>
                <button type="button" onClick={() => setExpenseTab("editor")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${expenseTab === "editor" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>管銷編輯</button>
              </div>

              {expenseTab === "personnel" ? (
                <Panel title="本月人事總覽">
                    <div className="grid gap-3 sm:grid-cols-5">
                      <MetricCard label="正職人數" value={String(personnelSummary.fullTimeCount)} hint="本月正式紀錄" tone="slate" compact />
                      <MetricCard label="兼職人數" value={String(personnelSummary.partTimeCount)} hint="本月正式紀錄" tone="slate" compact />
                      <MetricCard label="正職成本小計" value={formatCurrency(personnelSummary.fullTimeCost)} hint="本月正職成本" tone="rose" compact />
                      <MetricCard label="兼職成本小計" value={formatCurrency(personnelSummary.partTimeCost)} hint="本月兼職成本" tone="rose" compact />
                      <MetricCard label="人事總成本" value={formatCurrency(personnelSummary.total)} hint="本月人事總成本" tone="amber" compact />
                    </div>
                    <div className="mt-5 space-y-4">
                      <ListBlock title="正職記錄" headers={["姓名", "應支合計", "應扣合計", "單位負擔合計", "人事成本總支出", "查看詳情"]} rows={fullTimeRecords.map((record) => [record.name, formatCurrency(calculateFullTimeGross(record)), formatCurrency(calculateFullTimeDeduction(record)), formatCurrency(calculateFullTimeEmployerContribution(record)), formatCurrency(calculateFullTimeCost(record))])} actionLabel="查看詳情" onAction={(index) => setRecordDrawer({ type: "full-time", id: fullTimeRecords[index].id })} />
                      <ListBlock title="兼職記錄" headers={["姓名", "本月工作時數", "每小時薪資金額", "本月應支金額", "查看詳情"]} rows={partTimeRecords.map((record) => [record.name, `${record.hours} 小時`, formatCurrency(record.hourlyRate), formatCurrency(calculatePartTimePay(record))])} actionLabel="查看詳情" onAction={(index) => setRecordDrawer({ type: "part-time", id: partTimeRecords[index].id })} />
                    </div>
                  </Panel>
              ) : null}

              {expenseTab === "office" ? (
                <Panel title="本月庶務支出">
                  <div className="mt-5"><ListBlock title="庶務記錄區" headers={["項目名稱", "分類", "金額", "備註", "查看詳情"]} rows={currentOfficeExpenses.map((expense) => [expense.item, expense.category, formatCurrency(expense.amount), expense.note || "-"])} actionLabel="查看詳情" onAction={(index) => setRecordDrawer({ type: "office", id: currentOfficeExpenses[index].id })} /></div>
                </Panel>
              ) : null}

              {expenseTab === "other" ? (
                <Panel title="其他支出">
                  <div className="mt-5"><ListBlock title="其他記錄區" headers={["項目名稱", "金額", "備註", "查看詳情"]} rows={currentOtherExpenses.map((expense) => [expense.item, formatCurrency(expense.amount), expense.note || "-"])} actionLabel="查看詳情" onAction={(index) => setRecordDrawer({ type: "other", id: currentOtherExpenses[index].id })} /></div>
                </Panel>
              ) : null}

              {expenseTab === "editor" ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                    <button type="button" onClick={() => setExpenseEditorTab("personnel")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${expenseEditorTab === "personnel" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>人事編輯</button>
                    <button type="button" onClick={() => setExpenseEditorTab("office")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${expenseEditorTab === "office" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>庶務編輯</button>
                    <button type="button" onClick={() => setExpenseEditorTab("other")} className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition ${expenseEditorTab === "other" ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>其他編輯</button>
                  </div>

                  {expenseEditorTab === "personnel" ? (
                    <Panel title="人事費用管理" actions={<button type="button" onClick={() => setShowAddEmployeeModal(true)} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">新增員工</button>}>
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button type="button" onClick={() => setEmployeeFilter("full-time")} className={`rounded-2xl border p-4 text-left transition ${employeeFilter === "full-time" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">正職員工</p><p className="text-2xl font-semibold">{employeeRoster.filter((item) => item.type === "full-time").length}</p></div></button>
                          <button type="button" onClick={() => setEmployeeFilter("part-time")} className={`rounded-2xl border p-4 text-left transition ${employeeFilter === "part-time" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">兼職員工</p><p className="text-2xl font-semibold">{employeeRoster.filter((item) => item.type === "part-time").length}</p></div></button>
                        </div>
                        <div className="space-y-3">
                          {filteredRoster.map((employee) => {
                            const isExpanded = editingEmployeeId === employee.id;
                            const rosterFullTimeDraft = employee.type === "full-time" ? fullTimeDrafts[employee.id] : null;
                            const rosterPartTimeDraft = employee.type === "part-time" ? partTimeDrafts[employee.id] : null;

                            return (
                              <div key={employee.id} className="space-y-3">
                                <div onClick={() => { if (editingEmployeeId === employee.id && personnelViewMode === "preview") { setEditingEmployeeId(null); } else { setEditingEmployeeId(employee.id); setPersonnelViewMode("preview"); } }} className="flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-2.5 transition hover:border-slate-300 hover:bg-slate-50">
                                  <div className="flex items-center gap-3"><p className="font-semibold text-slate-900">{employee.name}</p><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${employee.type === "full-time" ? "bg-sky-50 text-sky-700 ring-sky-200" : "bg-violet-50 text-violet-700 ring-violet-200"}`}>{employee.type === "full-time" ? "正職" : "兼職"}</span></div>
                                  <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                                    <button type="button" onClick={() => { if (editingEmployeeId === employee.id && personnelViewMode === "edit") { setEditingEmployeeId(null); } else { setEditingEmployeeId(employee.id); setPersonnelViewMode("edit"); } }} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">編輯</button>
                                    <button type="button" onClick={() => handleDeleteEmployee(employee.id)} className="inline-flex items-center justify-center px-2 py-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700">刪除</button>
                                  </div>
                                </div>

                                {isExpanded && employee.type === "full-time" && rosterFullTimeDraft ? (
                                  <EditableBlock title={personnelViewMode === "edit" ? "正職薪資設定" : "正職薪資明細"} badge="" mode={personnelViewMode}>
                                    <div className={`grid gap-4 ${personnelViewMode === "edit" ? "xl:grid-cols-2" : "xl:grid-cols-3"}`}>
                                      <ReadOnlyPair label="姓名" value={employee.name} />
                                      <ReadOnlyPair label="類型" value="正職" />
                                      <EditablePair label="送出年月" value={rosterFullTimeDraft.salaryMonth} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, salaryMonth: value } }))} />
                                      {personnelViewMode === "edit" ? <EditableNumberPair label="本薪" value={rosterFullTimeDraft.baseSalary} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, baseSalary: value } }))} /> : <ReadOnlyPair label="本薪" value={formatCurrency(rosterFullTimeDraft.baseSalary)} />}
                                    </div>
                                    <DetailGroup title="應支付項目區" indexLabel="1" tone="slate">
                                      {personnelViewMode === "edit" ? (
                                        <div className="grid gap-4 xl:grid-cols-3">
                                          <EditableNumberPair label="津貼" value={rosterFullTimeDraft.allowances[0]?.amount ?? 0} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, allowances: [{ label: rosterFullTimeDraft.allowances[0]?.label ?? "交通津貼", amount: value }] } }))} />
                                          <EditableNumberPair label="獎金" value={rosterFullTimeDraft.bonuses[0]?.amount ?? 0} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, bonuses: [{ label: rosterFullTimeDraft.bonuses[0]?.label ?? "獎金", amount: value }] } }))} />
                                          <EditableNumberPair label="其他加給" value={rosterFullTimeDraft.otherPayments[0]?.amount ?? 0} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, otherPayments: [{ label: rosterFullTimeDraft.otherPayments[0]?.label ?? "其他加給", amount: value }] } }))} />
                                        </div>
                                      ) : (
                                        <>
                                          <InlineAmountList title="津貼明細" items={rosterFullTimeDraft.allowances} />
                                          <InlineAmountList title="獎金明細" items={rosterFullTimeDraft.bonuses} />
                                          <InlineAmountList title="其他加給明細" items={rosterFullTimeDraft.otherPayments} />
                                        </>
                                      )}
                                      <SummaryLine label="應支合計（含加班費）" value={formatCurrency(calculateFullTimeGross(rosterFullTimeDraft))} />
                                    </DetailGroup>
                                    <DetailGroup title="加班計算區" indexLabel="2" tone="amber">{personnelViewMode === "edit" ? <div className="grid gap-4 xl:grid-cols-3">{rosterFullTimeDraft.overtime.map((row, index) => <div key={row.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="mb-3 text-sm font-semibold text-slate-700">{row.label}</p><div className="grid gap-4"><EditableNumberPair label="時數" value={row.hours} onChange={(value) => setFullTimeDrafts((current) => { const nextOvertime = [...rosterFullTimeDraft.overtime]; nextOvertime[index] = { ...row, hours: value }; return { ...current, [employee.id]: { ...rosterFullTimeDraft, overtime: nextOvertime } }; })} /><EditableNumberPair label="係數" value={row.multiplier} onChange={(value) => setFullTimeDrafts((current) => { const nextOvertime = [...rosterFullTimeDraft.overtime]; nextOvertime[index] = { ...row, multiplier: value }; return { ...current, [employee.id]: { ...rosterFullTimeDraft, overtime: nextOvertime } }; })} /><ReadOnlyPair label="加班金額" value={formatCurrency(calculateOvertimeAmount(rosterFullTimeDraft.baseSalary, row))} /></div></div>)}</div> : rosterFullTimeDraft.overtime.map((row) => <SummaryLine key={row.label} label={`${row.label}｜${row.hours} 小時 × ${row.multiplier}`} value={formatCurrency(calculateOvertimeAmount(rosterFullTimeDraft.baseSalary, row))} />)}<SummaryLine label="加班費合計" value={formatCurrency(calculateOvertimeTotal(rosterFullTimeDraft))} emphasize /></DetailGroup>
                                    <DetailGroup title="應扣項目區" indexLabel="3" tone="rose">{personnelViewMode === "edit" ? <div className="grid gap-4 xl:grid-cols-2"><EditableNumberPair label="勞保費" value={rosterFullTimeDraft.deductions.laborInsurance} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, deductions: { ...rosterFullTimeDraft.deductions, laborInsurance: value } } }))} /><EditableNumberPair label="健保費" value={rosterFullTimeDraft.deductions.healthInsurance} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, deductions: { ...rosterFullTimeDraft.deductions, healthInsurance: value } } }))} /><EditableNumberPair label="眷屬負擔" value={rosterFullTimeDraft.deductions.dependents} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, deductions: { ...rosterFullTimeDraft.deductions, dependents: value } } }))} /><EditableNumberPair label="請假扣款" value={rosterFullTimeDraft.deductions.leaveDeduction} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, deductions: { ...rosterFullTimeDraft.deductions, leaveDeduction: value } } }))} /><EditableNumberPair label="其他扣項" value={rosterFullTimeDraft.deductions.other[0]?.amount ?? 0} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, deductions: { ...rosterFullTimeDraft.deductions, other: [{ label: rosterFullTimeDraft.deductions.other[0]?.label ?? "其他扣項", amount: value }] } } }))} /></div> : <><SummaryLine label="勞保費" value={formatCurrency(rosterFullTimeDraft.deductions.laborInsurance)} /><SummaryLine label="健保費" value={formatCurrency(rosterFullTimeDraft.deductions.healthInsurance)} /><SummaryLine label="眷屬負擔" value={formatCurrency(rosterFullTimeDraft.deductions.dependents)} /><SummaryLine label="請假扣款" value={formatCurrency(rosterFullTimeDraft.deductions.leaveDeduction)} /><InlineAmountList title="其他扣項明細" items={rosterFullTimeDraft.deductions.other} /></>}<SummaryLine label="應扣合計" value={formatCurrency(calculateFullTimeDeduction(rosterFullTimeDraft))} emphasize /><SummaryLine label="實領金額" value={formatCurrency(calculateFullTimeNetPay(rosterFullTimeDraft))} emphasize /></DetailGroup>
                                    <DetailGroup title="公司負擔" indexLabel="4" tone="sky">{personnelViewMode === "edit" ? <div className="grid gap-4 xl:grid-cols-2"><EditableNumberPair label="單位負擔勞保" value={rosterFullTimeDraft.employerContribution.laborInsurance} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, employerContribution: { ...rosterFullTimeDraft.employerContribution, laborInsurance: value } } }))} /><EditableNumberPair label="單位負擔健保" value={rosterFullTimeDraft.employerContribution.healthInsurance} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, employerContribution: { ...rosterFullTimeDraft.employerContribution, healthInsurance: value } } }))} /><EditableNumberPair label="職保" value={rosterFullTimeDraft.employerContribution.occupationalInsurance} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, employerContribution: { ...rosterFullTimeDraft.employerContribution, occupationalInsurance: value } } }))} /><EditableNumberPair label="勞退" value={rosterFullTimeDraft.employerContribution.pension} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, employerContribution: { ...rosterFullTimeDraft.employerContribution, pension: value } } }))} /><EditableNumberPair label="其他單位負擔" value={rosterFullTimeDraft.employerContribution.other[0]?.amount ?? 0} onChange={(value) => setFullTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterFullTimeDraft, employerContribution: { ...rosterFullTimeDraft.employerContribution, other: [{ label: rosterFullTimeDraft.employerContribution.other[0]?.label ?? "其他單位負擔", amount: value }] } } }))} /></div> : <><SummaryLine label="單位負擔勞保" value={formatCurrency(rosterFullTimeDraft.employerContribution.laborInsurance)} /><SummaryLine label="單位負擔健保" value={formatCurrency(rosterFullTimeDraft.employerContribution.healthInsurance)} /><SummaryLine label="職保" value={formatCurrency(rosterFullTimeDraft.employerContribution.occupationalInsurance)} /><SummaryLine label="勞退" value={formatCurrency(rosterFullTimeDraft.employerContribution.pension)} /><InlineAmountList title="其他單位負擔明細" items={rosterFullTimeDraft.employerContribution.other} /></>}<SummaryLine label="單位負擔合計" value={formatCurrency(calculateFullTimeEmployerContribution(rosterFullTimeDraft))} emphasize /><SummaryLine label="人事成本總支出" value={formatCurrency(calculateFullTimeCost(rosterFullTimeDraft))} emphasize /></DetailGroup>
                                    {personnelViewMode === "edit" ? <FooterActions onSubmit={() => handlePersonnelSubmit(employee.id)} /> : null}
                                  </EditableBlock>
                                ) : null}

                                {isExpanded && employee.type === "part-time" && rosterPartTimeDraft ? (
                                  <EditableBlock title={personnelViewMode === "edit" ? "兼職薪資設定" : "兼職薪資明細"} badge="" mode={personnelViewMode}>
                                    <div className="grid gap-4 xl:grid-cols-2">
                                      <ReadOnlyPair label="姓名" value={employee.name} />
                                      <ReadOnlyPair label="類型" value="兼職" />
                                      <EditablePair label="送出年月" value={rosterPartTimeDraft.salaryMonth} onChange={(value) => setPartTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterPartTimeDraft, salaryMonth: value } }))} />
                                    </div>
                                    <DetailGroup title="應支付項目區" indexLabel="1" tone="slate">
                                      <div className="grid gap-4 xl:grid-cols-2">
                                        {personnelViewMode === "edit" ? <EditableNumberPair label="本月工作時數" value={rosterPartTimeDraft.hours} onChange={(value) => setPartTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterPartTimeDraft, hours: value } }))} /> : <ReadOnlyPair label="本月工作時數" value={`${rosterPartTimeDraft.hours} 小時`} />}
                                        {personnelViewMode === "edit" ? <EditableNumberPair label="每小時薪資金額" value={rosterPartTimeDraft.hourlyRate} onChange={(value) => setPartTimeDrafts((current) => ({ ...current, [employee.id]: { ...rosterPartTimeDraft, hourlyRate: value } }))} /> : <ReadOnlyPair label="每小時薪資金額" value={formatCurrency(rosterPartTimeDraft.hourlyRate)} />}
                                      </div>
                                      <SummaryLine label="本月應支金額" value={formatCurrency(calculatePartTimePay(rosterPartTimeDraft))} emphasize />
                                    </DetailGroup>
                                    {personnelViewMode === "edit" ? <FooterActions onSubmit={() => handlePersonnelSubmit(employee.id)} /> : null}
                                  </EditableBlock>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Panel>
                  ) : null}

                  {expenseEditorTab === "office" ? (
                  <Panel title="庶務項目" actions={<><button type="button" onClick={() => setShowManageOfficeCategories(true)} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">管理分類</button><button type="button" onClick={() => setOfficeExpenseForm({ mode: "create", item: "", category: officeCategories[0] ?? "", amount: "", note: "" })} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">新增支出</button></>}>
                    <div className="mt-5"><ListBlock title="" headers={["項目名稱", "分類", "金額", "編輯", "刪除"]} rows={currentOfficeExpenses.map((expense) => [expense.item, expense.category, formatCurrency(expense.amount)])} actionLabel="編輯" secondaryActionLabel="刪除" onAction={(index) => { const target = currentOfficeExpenses[index]; setOfficeExpenseForm({ mode: "edit", id: target.id, item: target.item, category: target.category, amount: String(target.amount), note: target.note }); }} onSecondaryAction={(index) => handleDeleteOfficeExpense(currentOfficeExpenses[index].id)} /></div>
                  </Panel>
                  ) : null}

                  {expenseEditorTab === "other" ? (
                  <Panel title="其他項目" actions={<button type="button" onClick={() => setOtherExpenseForm({ mode: "create", item: "", amount: "", note: "" })} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">新增支出</button>}>
                    <div className="mt-5"><ListBlock title="" headers={["項目名稱", "金額", "備註", "編輯", "刪除"]} rows={currentOtherExpenses.map((expense) => [expense.item, formatCurrency(expense.amount), expense.note || "-"])} actionLabel="編輯" secondaryActionLabel="刪除" onAction={(index) => { const target = currentOtherExpenses[index]; setOtherExpenseForm({ mode: "edit", id: target.id, item: target.item, amount: String(target.amount), note: target.note }); }} onSecondaryAction={(index) => handleDeleteOtherExpense(currentOtherExpenses[index].id)} /></div>
                  </Panel>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {showAddEmployeeModal ? (
        <ModalShell title="新增員工" badge="">
          <div className="space-y-4">
            <EditablePair label="姓名" value={newEmployeeName} onChange={setNewEmployeeName} placeholder="輸入員工姓名" />
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">類型</p>
              <div className="flex gap-2">
                {([
                  ["full-time", "正職"],
                  ["part-time", "兼職"],
                ] as Array<[FormEmployeeType, string]>).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewEmployeeType(type)}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ring-1 transition ${newEmployeeType === type ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ModalActions onCancel={() => setShowAddEmployeeModal(false)} onSubmit={handleAddEmployee} submitLabel="建立員工" />
        </ModalShell>
      ) : null}

      {showManageOfficeCategories ? (
        <ModalShell title="庶務分類設定" badge="">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={newOfficeCategory}
                onChange={(event) => setNewOfficeCategory(event.target.value)}
                placeholder="新增分類名稱"
                className="h-11 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
              />
              <button
                type="button"
                onClick={handleAddOfficeCategory}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                新增分類
              </button>
            </div>
            <div className="space-y-2">
              {officeCategories.map((category) => (
                <div key={category} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                  <span className="font-medium text-slate-800">{category}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteOfficeCategory(category)}
                    className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    刪除
                  </button>
                </div>
              ))}
            </div>
          </div>
          <ModalActions onCancel={() => setShowManageOfficeCategories(false)} onSubmit={() => setShowManageOfficeCategories(false)} submitLabel="完成" />
        </ModalShell>
      ) : null}

      {officeExpenseForm ? (
        <ModalShell title={officeExpenseForm.mode === "create" ? "新增庶務支出" : "編輯庶務支出"} badge="">
          <div className="space-y-4">
            <EditablePair label="項目名稱" value={officeExpenseForm.item} onChange={(value) => setOfficeExpenseForm((current) => current ? { ...current, item: value } : current)} />
            <EditablePair label="分類" value={officeExpenseForm.category} onChange={(value) => setOfficeExpenseForm((current) => current ? { ...current, category: value } : current)} listId="office-category-list" />
            <datalist id="office-category-list">
              {officeCategories.map((category) => <option key={category} value={category} />)}
            </datalist>
            <EditablePair label="金額" value={officeExpenseForm.amount} onChange={(value) => setOfficeExpenseForm((current) => current ? { ...current, amount: value } : current)} inputMode="numeric" />
            <EditablePair label="備註" value={officeExpenseForm.note} onChange={(value) => setOfficeExpenseForm((current) => current ? { ...current, note: value } : current)} />
          </div>
          <ModalActions onCancel={() => setOfficeExpenseForm(null)} onSubmit={handleSubmitOfficeExpense} submitLabel={officeExpenseForm.mode === "create" ? "建立支出" : "更新支出"} />
        </ModalShell>
      ) : null}

      {otherExpenseForm ? (
        <ModalShell title={otherExpenseForm.mode === "create" ? "新增其他支出" : "編輯其他支出"} badge="">
          <div className="space-y-4">
            <EditablePair label="項目名稱" value={otherExpenseForm.item} onChange={(value) => setOtherExpenseForm((current) => current ? { ...current, item: value } : current)} />
            <EditablePair label="金額" value={otherExpenseForm.amount} onChange={(value) => setOtherExpenseForm((current) => current ? { ...current, amount: value } : current)} inputMode="numeric" />
            <EditablePair label="備註" value={otherExpenseForm.note} onChange={(value) => setOtherExpenseForm((current) => current ? { ...current, note: value } : current)} />
          </div>
          <ModalActions onCancel={() => setOtherExpenseForm(null)} onSubmit={handleSubmitOtherExpense} submitLabel={otherExpenseForm.mode === "create" ? "建立支出" : "更新支出"} />
        </ModalShell>
      ) : null}

      {recordDrawer ? (
        <DrawerShell title={getDrawerTitle(recordDrawer.type)} onClose={() => setRecordDrawer(null)}>
          {renderDrawerContent(recordDrawer, { fullTimeRecords, partTimeRecords, currentOfficeExpenses, currentOtherExpenses })}
        </DrawerShell>
      ) : null}
    </AppShell>
  );
}

function Panel({ eyebrow, title, description, actions, children }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <article className="rounded-3xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p> : null}
          <h4 className={`${eyebrow ? 'mt-2' : ''} text-xl font-semibold text-slate-900`}>{title}</h4>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function EditableBlock({ title, badge, mode = "edit", children }: { title: string; badge: string; mode?: "preview" | "edit"; children: ReactNode }) {
  return (
    <section className={`rounded-3xl border p-5 ${mode === "edit" ? "border-slate-200 bg-slate-50/70" : "border-slate-200 bg-white"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <h5 className="text-lg font-semibold text-slate-900">{title}</h5>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${mode === "edit" ? "bg-white text-slate-700 ring-slate-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>{badge}</span>
      </div>
      <div className={`mt-5 space-y-5 ${mode === "preview" ? "opacity-95" : ""}`}>{children}</div>
    </section>
  );
}

function DetailGroup({ title, children, indexLabel, tone = "slate" }: { title: string; children: ReactNode; indexLabel?: string; tone?: "slate" | "amber" | "rose" | "sky" }) {
  const toneClasses = {
    slate: {
      wrapper: "border-slate-200 bg-slate-50/85",
      badge: "bg-white text-slate-700 ring-slate-200",
      title: "text-slate-900",
    },
    amber: {
      wrapper: "border-amber-200 bg-amber-50/85",
      badge: "bg-white text-amber-700 ring-amber-200",
      title: "text-amber-900",
    },
    rose: {
      wrapper: "border-rose-200 bg-rose-50/85",
      badge: "bg-white text-rose-700 ring-rose-200",
      title: "text-rose-900",
    },
    sky: {
      wrapper: "border-sky-200 bg-sky-50/85",
      badge: "bg-white text-sky-700 ring-sky-200",
      title: "text-sky-900",
    },
  }[tone];

  return (
    <div className={`space-y-3 rounded-2xl border p-4 ${toneClasses.wrapper}`}>
      <div className="flex flex-wrap items-center gap-2">
        {indexLabel ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses.badge}`}>{indexLabel}</span> : null}
        <h6 className={`text-sm font-semibold ${toneClasses.title}`}>{title}</h6>
      </div>
      {children}
    </div>
  );
}

function FooterActions({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
      <button type="button" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
        取消
      </button>
      <button type="button" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
        暫存
      </button>
      <button type="button" onClick={onSubmit} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
        送出
      </button>
    </div>
  );
}

function MetricCard({ label, value, hint, tone, compact = false, emphasize = false }: { label: string; value: string; hint: string; tone: "slate" | "emerald" | "amber" | "rose" | "sky" | "violet"; compact?: boolean; emphasize?: boolean }) {
  return (
    <article className={`rounded-3xl border ${compact ? 'p-4' : 'p-5'} shadow-sm ${getCardToneClass(tone)} ${emphasize ? 'ring-2 ring-emerald-300' : 'ring-1 ring-inset ring-transparent'}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 font-semibold tracking-tight text-slate-900 ${compact ? 'text-xl' : 'text-3xl'}`}>{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
    </article>
  );
}

function ListBlock({
  title,
  headers,
  rows,
  actionLabel,
  secondaryActionLabel,
  onAction,
  onSecondaryAction,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  actionLabel: string;
  secondaryActionLabel?: string;
  onAction: (index: number) => void;
  onSecondaryAction?: (index: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      {title ? <h5 className="text-base font-semibold text-slate-900">{title}</h5> : null}
      <div className={`${title ? 'mt-4' : ''} overflow-x-auto rounded-2xl border border-slate-200`}>
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} className={`px-4 py-3 ${cellIndex === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{cell}</td>
                ))}
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onAction(index)} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                    {actionLabel}
                  </button>
                </td>
                {secondaryActionLabel ? (
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onSecondaryAction?.(index)} className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                      {secondaryActionLabel}
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReadOnlyPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-700">{label}</p>
      <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function EditablePair({ label, value, onChange, placeholder, inputMode, listId }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; listId?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-700">{label}</p>
      <input
        value={value}
        list={listId}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400"
      />
    </div>
  );
}

function EditableNumberPair({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <EditablePair label={label} value={String(value)} onChange={(next) => onChange(Number(next) || 0)} inputMode="numeric" />;
}

function InlineAmountList({ title, items }: { title: string; items: Array<{ label: string; amount: number }> }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
        {items.map((item) => (
          <SummaryLine key={`${title}-${item.label}`} label={item.label} value={formatCurrency(item.amount)} />
        ))}
      </div>
    </div>
  );
}

function SummaryLine({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${emphasize ? 'text-slate-900' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}

function ModalShell({ title, badge, children }: { title: string; badge: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{badge}</div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSubmit, submitLabel }: { onCancel: () => void; onSubmit: () => void; submitLabel: string }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
        取消
      </button>
      <button type="button" onClick={onSubmit} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
        {submitLabel}
      </button>
    </div>
  );
}

function DrawerShell({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/25">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">查看詳情 / drawer</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            關閉
          </button>
        </div>
        <div className="mt-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function renderDrawerContent(
  drawer: { type: "full-time" | "part-time" | "office" | "other"; id: string },
  source: {
    fullTimeRecords: FullTimeEmployee[];
    partTimeRecords: PartTimeEmployee[];
    currentOfficeExpenses: OfficeExpense[];
    currentOtherExpenses: OtherExpense[];
  },
) {
  if (drawer.type === "full-time") {
    const record = source.fullTimeRecords.find((item) => item.id === drawer.id);
    if (!record) return <p className="text-sm text-slate-500">找不到這筆正職記錄。</p>;
    return (
      <>
        <ReadOnlyPair label="姓名" value={record.name} />
        <ReadOnlyPair label="類型" value="正職" />
        <ReadOnlyPair label="薪資日期" value={record.salaryMonth} />
        <DetailGroup title="應支付摘要區">
          <SummaryLine label="本薪" value={formatCurrency(record.baseSalary)} />
          <InlineAmountList title="津貼明細" items={record.allowances} />
          <InlineAmountList title="獎金明細" items={record.bonuses} />
          <InlineAmountList title="其他加給明細" items={record.otherPayments} />
          <SummaryLine label="加班費合計" value={formatCurrency(calculateOvertimeTotal(record))} />
          <SummaryLine label="應支合計" value={formatCurrency(calculateFullTimeGross(record))} emphasize />
        </DetailGroup>
        <DetailGroup title="應扣摘要區">
          <SummaryLine label="應扣合計" value={formatCurrency(calculateFullTimeDeduction(record))} />
          <SummaryLine label="實領金額" value={formatCurrency(calculateFullTimeNetPay(record))} emphasize />
        </DetailGroup>
        <DetailGroup title="單位負擔摘要區">
          <SummaryLine label="單位負擔合計" value={formatCurrency(calculateFullTimeEmployerContribution(record))} />
          <SummaryLine label="人事成本總支出" value={formatCurrency(calculateFullTimeCost(record))} emphasize />
        </DetailGroup>
      </>
    );
  }

  if (drawer.type === "part-time") {
    const record = source.partTimeRecords.find((item) => item.id === drawer.id);
    if (!record) return <p className="text-sm text-slate-500">找不到這筆兼職記錄。</p>;
    return (
      <>
        <ReadOnlyPair label="姓名" value={record.name} />
        <ReadOnlyPair label="類型" value="兼職" />
        <ReadOnlyPair label="薪資日期" value={record.salaryMonth} />
        <DetailGroup title="兼職薪資摘要區">
          <SummaryLine label="本月工作時數" value={`${record.hours} 小時`} />
          <SummaryLine label="每小時薪資金額" value={formatCurrency(record.hourlyRate)} />
          <SummaryLine label="本月應支金額" value={formatCurrency(calculatePartTimePay(record))} emphasize />
        </DetailGroup>
      </>
    );
  }

  if (drawer.type === "office") {
    const record = source.currentOfficeExpenses.find((item) => item.id === drawer.id);
    if (!record) return <p className="text-sm text-slate-500">找不到這筆庶務支出。</p>;
    return (
      <>
        <DetailGroup title="基本資訊區">
          <SummaryLine label="項目名稱" value={record.item} />
          <SummaryLine label="分類" value={record.category} />
          <SummaryLine label="金額" value={formatCurrency(record.amount)} emphasize />
        </DetailGroup>
        <DetailGroup title="補充資訊區">
          <p className="text-sm leading-6 text-slate-600">{record.note || "-"}</p>
        </DetailGroup>
      </>
    );
  }

  const record = source.currentOtherExpenses.find((item) => item.id === drawer.id);
  if (!record) return <p className="text-sm text-slate-500">找不到這筆其他支出。</p>;
  return (
    <>
      <DetailGroup title="基本資訊區">
        <SummaryLine label="項目名稱" value={record.item} />
        <SummaryLine label="金額" value={formatCurrency(record.amount)} emphasize />
      </DetailGroup>
      <DetailGroup title="補充資訊區">
        <p className="text-sm leading-6 text-slate-600">{record.note || "-"}</p>
      </DetailGroup>
    </>
  );
}

function getDrawerTitle(type: "full-time" | "part-time" | "office" | "other") {
  return {
    "full-time": "正職記錄詳情",
    "part-time": "兼職記錄詳情",
    office: "庶務支出詳情",
    other: "其他支出詳情",
  }[type];
}

function buildInitialDrafts(): PersonnelDraft {
  const fullTime: Record<string, FullTimeEmployee> = {};
  const partTime: Record<string, PartTimeEmployee> = {};

  Object.values(accountingDataByMonth).forEach((month) => {
    month.fullTimeEmployees.forEach((employee) => {
      if (!fullTime[employee.id]) fullTime[employee.id] = employee;
    });
    month.partTimeEmployees.forEach((employee) => {
      if (!partTime[employee.id]) partTime[employee.id] = employee;
    });
  });

  return { fullTime, partTime };
}

function buildInitialRecordsByMonth(): Record<string, PersonnelDraft> {
  return Object.fromEntries(
    Object.entries(accountingDataByMonth).map(([monthKey, month]) => [
      monthKey,
      {
        fullTime: Object.fromEntries(month.fullTimeEmployees.map((employee) => [employee.id, employee])),
        partTime: Object.fromEntries(month.partTimeEmployees.map((employee) => [employee.id, employee])),
      },
    ]),
  );
}

function buildInitialOfficeExpensesByMonth() {
  return Object.fromEntries(Object.entries(accountingDataByMonth).map(([monthKey, month]) => [monthKey, month.officeExpenses]));
}

function buildInitialOtherExpensesByMonth() {
  return Object.fromEntries(Object.entries(accountingDataByMonth).map(([monthKey, month]) => [monthKey, month.otherExpenses]));
}

function buildDefaultFullTimeDraft(id: string, name: string, salaryMonth: string): FullTimeEmployee {
  return {
    id,
    name,
    salaryMonth,
    baseSalary: 42000,
    allowances: [{ label: "交通津貼", amount: 2000 }],
    bonuses: [],
    otherPayments: [],
    overtime: [
      { label: "加班前兩小時", hours: 0, multiplier: 1.34, amount: 0 },
      { label: "加班兩小時後", hours: 0, multiplier: 1.67, amount: 0 },
      { label: "假日加班", hours: 0, multiplier: 2, amount: 0 },
    ],
    deductions: {
      laborInsurance: 0,
      healthInsurance: 0,
      dependents: 0,
      leaveDeduction: 0,
      other: [],
    },
    employerContribution: {
      laborInsurance: 0,
      healthInsurance: 0,
      occupationalInsurance: 0,
      pension: 0,
      other: [],
    },
  };
}

function buildDefaultPartTimeDraft(id: string, name: string, salaryMonth: string): PartTimeEmployee {
  return {
    id,
    name,
    salaryMonth,
    hours: 0,
    hourlyRate: 220,
  };
}

function calculateOvertimeAmount(baseSalary: number, item: FullTimeEmployee["overtime"][number]) {
  const hourlyRate = baseSalary / 240;
  return Math.round(hourlyRate * item.hours * item.multiplier);
}

function calculateOvertimeTotal(record: FullTimeEmployee) {
  return record.overtime.reduce((sum, item) => sum + calculateOvertimeAmount(record.baseSalary, item), 0);
}

function calculateFullTimeGross(record: FullTimeEmployee) {
  return record.baseSalary +
    record.allowances.reduce((sum, item) => sum + item.amount, 0) +
    record.bonuses.reduce((sum, item) => sum + item.amount, 0) +
    record.otherPayments.reduce((sum, item) => sum + item.amount, 0) +
    calculateOvertimeTotal(record);
}

function calculateFullTimeDeduction(record: FullTimeEmployee) {
  return record.deductions.laborInsurance +
    record.deductions.healthInsurance +
    record.deductions.dependents +
    record.deductions.leaveDeduction +
    record.deductions.other.reduce((sum, item) => sum + item.amount, 0);
}

function calculateFullTimeNetPay(record: FullTimeEmployee) {
  return calculateFullTimeGross(record) - calculateFullTimeDeduction(record);
}

function calculateFullTimeEmployerContribution(record: FullTimeEmployee) {
  return record.employerContribution.laborInsurance +
    record.employerContribution.healthInsurance +
    record.employerContribution.occupationalInsurance +
    record.employerContribution.pension +
    record.employerContribution.other.reduce((sum, item) => sum + item.amount, 0);
}

function calculateFullTimeCost(record: FullTimeEmployee) {
  return calculateFullTimeGross(record) + calculateFullTimeEmployerContribution(record);
}

function calculatePartTimePay(record: PartTimeEmployee) {
  return record.hours * record.hourlyRate;
}

function getScopedMonths(mode: RevenueMode, selectedMonth: string, selectedYear: string, rangeStart: string, rangeEnd: string) {
  const allMonths = monthOptions.map((item) => item.key);
  if (mode === "month") return [selectedMonth];
  if (mode === "year") return allMonths.filter((month) => month.startsWith(selectedYear));
  return allMonths.filter((month) => month >= rangeStart && month <= rangeEnd);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCardToneClass(tone: "slate" | "emerald" | "amber" | "rose" | "sky" | "violet") {
  return {
    slate: "border-slate-200 bg-slate-50",
    emerald: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-200 bg-amber-50",
    rose: "border-rose-200 bg-rose-50",
    sky: "border-sky-200 bg-sky-50",
    violet: "border-violet-200 bg-violet-50",
  }[tone];
}

