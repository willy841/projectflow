"use client";

import { useMemo, useState } from "react";

type FormEmployeeType = "full-time" | "part-time";

export type AccountingPersonnelEditorEmployee = {
  id: string;
  name: string;
  type: FormEmployeeType;
  isActive?: boolean;
};

export type AccountingPersonnelEditorRecord = {
  employeeId: string;
  name: string;
  employeeType: FormEmployeeType;
  salaryMonth: string;
  payloadJson: Record<string, unknown>;
};

type Props = {
  month: string;
  employees: AccountingPersonnelEditorEmployee[];
  records: AccountingPersonnelEditorRecord[];
};

type PartTimeDraft = {
  employeeId: string;
  salaryMonth: string;
  hours: number;
  hourlyRate: number;
};

export function AccountingPersonnelEditor({ month, employees, records }: Props) {
  const [employeeFilter, setEmployeeFilter] = useState<FormEmployeeType>("full-time");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeType, setNewEmployeeType] = useState<FormEmployeeType>("full-time");
  const [saving, setSaving] = useState(false);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.isActive !== false),
    [employees],
  );

  const filteredRoster = useMemo(
    () => activeEmployees.filter((employee) => employee.type === employeeFilter),
    [activeEmployees, employeeFilter],
  );

  const recordMap = useMemo(() => {
    const map = new Map<string, AccountingPersonnelEditorRecord>();
    for (const record of records) {
      map.set(record.employeeId, record);
    }
    return map;
  }, [records]);

  const [drafts, setDrafts] = useState<Record<string, PartTimeDraft>>(() => {
    const next: Record<string, PartTimeDraft> = {};
    for (const employee of activeEmployees.filter((item) => item.type === "part-time")) {
      const record = records.find((item) => item.employeeId === employee.id);
      next[employee.id] = buildPartTimeDraft(employee.id, month, record?.payloadJson);
    }
    return next;
  });

  async function handleAddEmployee() {
    const name = newEmployeeName.trim();
    if (!name) return;
    const response = await fetch('/api/accounting/personnel/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, employeeType: newEmployeeType }),
    });
    const result = await response.json();
    if (!response.ok || !result?.ok) {
      window.alert(result?.error ?? '建立員工失敗');
      return;
    }
    window.location.reload();
  }

  async function handleDeleteEmployee(employeeId: string, employeeName: string) {
    const confirmed = window.confirm(`確認刪除員工「${employeeName}」？刪除後 roster 會隱藏。`);
    if (!confirmed) return;
    const response = await fetch(`/api/accounting/personnel/employees/${employeeId}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok || !result?.ok) {
      window.alert(result?.error ?? '刪除員工失敗');
      return;
    }
    window.location.reload();
  }

  async function handleSubmit(employeeId: string) {
    const employee = activeEmployees.find((item) => item.id === employeeId);
    if (!employee || employee.type !== 'part-time') return;
    const draft = drafts[employeeId];
    if (!draft) return;
    setSaving(true);
    try {
      const payload = {
        hours: draft.hours,
        hourlyRate: draft.hourlyRate,
        totalCost: draft.hours * draft.hourlyRate,
      };
      const response = await fetch('/api/accounting/personnel/records/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, salaryMonth: draft.salaryMonth, payload }),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) {
        window.alert(result?.error ?? '送出失敗');
        return;
      }
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xl font-semibold text-slate-900">人事費用管理</h4>
          <p className="mt-2 text-sm text-slate-500">重做人事 editor 工作流：選員工、編輯、送出，全部只走 DB employee uuid。</p>
        </div>
        <button type="button" onClick={() => setShowAddEmployeeModal(true)} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">新增員工</button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button data-testid="personnel-filter-full-time" type="button" onClick={() => setEmployeeFilter("full-time")} className={`rounded-2xl border p-4 text-left transition ${employeeFilter === "full-time" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">正職員工</p><p className="text-2xl font-semibold">{activeEmployees.filter((item) => item.type === "full-time").length}</p></div>
        </button>
        <button data-testid="personnel-filter-part-time" type="button" onClick={() => setEmployeeFilter("part-time")} className={`rounded-2xl border p-4 text-left transition ${employeeFilter === "part-time" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
          <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">兼職員工</p><p className="text-2xl font-semibold">{activeEmployees.filter((item) => item.type === "part-time").length}</p></div>
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {filteredRoster.map((employee) => {
          const record = recordMap.get(employee.id);
          const selected = selectedEmployeeId === employee.id;
          const draft = drafts[employee.id] ?? buildPartTimeDraft(employee.id, month, record?.payloadJson);
          const totalCost = draft.hours * draft.hourlyRate;
          return (
            <div key={employee.id} data-testid={`personnel-card-${employee.id}`} className="space-y-3">
              <div data-testid={`personnel-preview-toggle-${employee.id}`} onClick={() => { setSelectedEmployeeId(selected ? null : employee.id); setMode('preview'); }} className="flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-2.5 transition hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-slate-900">{employee.name}</p>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${employee.type === 'full-time' ? 'bg-sky-50 text-sky-700 ring-sky-200' : 'bg-violet-50 text-violet-700 ring-violet-200'}`}>{employee.type === 'full-time' ? '正職' : '兼職'}</span>
                </div>
                <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                  <button data-testid={`personnel-edit-toggle-${employee.id}`} type="button" onClick={() => { setSelectedEmployeeId(selected ? null : employee.id); setMode('edit'); }} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">編輯</button>
                  <button data-testid={`personnel-delete-${employee.id}`} type="button" onClick={() => handleDeleteEmployee(employee.id, employee.name)} className="inline-flex items-center justify-center px-2 py-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700">刪除</button>
                </div>
              </div>

              {selected && employee.type === 'part-time' ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h5 className="text-lg font-semibold text-slate-900">{mode === 'edit' ? '兼職薪資設定' : '兼職薪資明細'}</h5>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{mode === 'edit' ? '編輯中' : '預覽'}</span>
                  </div>
                  <div className="mt-5 space-y-5">
                    <div className="grid gap-4 xl:grid-cols-2">
                      <ReadOnlyPair label="姓名" value={employee.name} />
                      <ReadOnlyPair label="類型" value="兼職" />
                      <EditablePair label="送出年月" value={draft.salaryMonth} onChange={(value) => setDrafts((current) => ({ ...current, [employee.id]: { ...draft, salaryMonth: value } }))} />
                    </div>
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">1</span>
                        <h6 className="text-sm font-semibold text-slate-900">應支付項目區</h6>
                      </div>
                      <div className="grid gap-4 xl:grid-cols-2">
                        {mode === 'edit' ? (
                          <EditableNumberPair testId={`personnel-hours-${employee.id}`} label="本月工作時數" value={draft.hours} onChange={(value) => setDrafts((current) => ({ ...current, [employee.id]: { ...draft, hours: value } }))} />
                        ) : (
                          <ReadOnlyPair label="本月工作時數" value={`${draft.hours} 小時`} />
                        )}
                        {mode === 'edit' ? (
                          <EditableNumberPair testId={`personnel-hourly-${employee.id}`} label="每小時薪資金額" value={draft.hourlyRate} onChange={(value) => setDrafts((current) => ({ ...current, [employee.id]: { ...draft, hourlyRate: value } }))} />
                        ) : (
                          <ReadOnlyPair label="每小時薪資金額" value={formatCurrency(draft.hourlyRate)} />
                        )}
                      </div>
                      <SummaryLine label="本月應支金額" value={formatCurrency(totalCost)} emphasize />
                    </div>
                    {mode === 'edit' ? (
                      <div data-testid={`personnel-${employee.id}-footer`} className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                        <button type="button" onClick={() => setSelectedEmployeeId(null)} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">取消</button>
                        <button type="button" data-testid={`personnel-${employee.id}-submit`} disabled={saving} onClick={() => handleSubmit(employee.id)} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">送出</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div data-testid="personnel-debug-overlay" className="fixed bottom-4 left-4 z-40 max-w-md rounded-2xl border border-amber-300 bg-amber-50/95 px-4 py-3 text-xs text-slate-800 shadow-lg">
        <div><strong>selectedEmployeeId:</strong> {selectedEmployeeId ?? 'null'}</div>
        <div><strong>mode:</strong> {mode}</div>
        <div><strong>employeeFilter:</strong> {employeeFilter}</div>
        <div><strong>draftKeys:</strong> {Object.keys(drafts).join(', ') || 'none'}</div>
        <div><strong>filteredRoster:</strong> {filteredRoster.map((item) => `${item.name}:${item.id}`).join(' | ') || 'none'}</div>
        {selectedEmployeeId ? <div><strong>currentDraft:</strong> {JSON.stringify(drafts[selectedEmployeeId] ?? null)}</div> : null}
      </div>

      {showAddEmployeeModal ? (
        <ModalShell title="新增員工">
          <div className="space-y-4">
            <EditablePair label="姓名" value={newEmployeeName} onChange={setNewEmployeeName} placeholder="輸入員工姓名" />
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">類型</p>
              <div className="flex gap-2">
                {([
                  ['full-time', '正職'],
                  ['part-time', '兼職'],
                ] as Array<[FormEmployeeType, string]>).map(([type, label]) => (
                  <button key={type} type="button" onClick={() => setNewEmployeeType(type)} className={`rounded-2xl px-4 py-2 text-sm font-medium ring-1 transition ${newEmployeeType === type ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-100'}`}>{label}</button>
                ))}
              </div>
            </div>
          </div>
          <ModalActions onCancel={() => setShowAddEmployeeModal(false)} onSubmit={handleAddEmployee} submitLabel="建立員工" />
        </ModalShell>
      ) : null}
    </section>
  );
}

function buildPartTimeDraft(employeeId: string, month: string, payload?: Record<string, unknown>): PartTimeDraft {
  return {
    employeeId,
    salaryMonth: month,
    hours: Number(payload?.hours ?? 0),
    hourlyRate: Number(payload?.hourlyRate ?? 0),
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(value);
}

function ReadOnlyPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-700">{label}</p>
      <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function EditablePair({ label, value, onChange, placeholder, testId }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; testId?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-700">{label}</p>
      <input data-testid={testId} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-400" />
    </div>
  );
}

function EditableNumberPair({ label, value, onChange, testId }: { label: string; value: number; onChange: (value: number) => void; testId?: string }) {
  return <EditablePair label={label} value={String(value)} onChange={(next) => onChange(Number(next) || 0)} testId={testId} />;
}

function SummaryLine({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${emphasize ? 'text-slate-900' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}

function ModalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSubmit, submitLabel }: { onCancel: () => void; onSubmit: () => void; submitLabel: string }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">取消</button>
      <button type="button" onClick={onSubmit} className="inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">{submitLabel}</button>
    </div>
  );
}
