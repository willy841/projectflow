import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  formatCurrency,
  type CostLineItem,
  type CostSourceType,
  type QuoteCostProject,
} from '@/components/quote-cost-data';
import type { QuoteCostDetailPresenter } from '@/components/quote-cost-detail-presenter';

export type ReconciliationGroupItemView = {
  id: string;
  itemName: string;
  sourceRef: string;
  vendorName: string | null;
  adjustedAmount: number;
};

export type ReconciliationGroupView = {
  key: string;
  sourceType: '設計' | '備品' | '廠商';
  vendorName: string;
  amountTotal: number;
  itemCount: number;
  reconciliationStatus: '未對帳' | '已對帳';
  items?: ReconciliationGroupItemView[];
};

export type CollectionRecordView = {
  id: string;
  collectedOn: string;
  amount: number;
  note: string;
};

export type VendorPaymentView = {
  vendorName: string;
  payableAmount: number;
  paidAmount: number;
};

export function QuoteCostHeader({
  presenter,
  projectName,
  eventDate,
  reconciliationStatus,
  closeStatus,
}: {
  presenter: QuoteCostDetailPresenter;
  projectName: string;
  eventDate: string;
  reconciliationStatus: string;
  closeStatus: string;
}) {
  const isClosedView = presenter.archived;

  return (
    <header className={`overflow-hidden rounded-[28px] border p-6 shadow-sm xl:p-7 ${isClosedView ? 'border-slate-200 bg-linear-to-br from-slate-50 to-white' : 'border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white'}`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 xl:self-center">
          <h2 className={`text-3xl font-semibold tracking-tight ${isClosedView ? 'text-slate-900' : 'text-white'}`}>{projectName}</h2>
          <div className={`mt-4 grid gap-3 sm:grid-cols-1 xl:max-w-[320px] ${isClosedView ? 'text-slate-600' : 'text-slate-200'}`}>
            <OverviewRow label="活動日期" value={eventDate} archived={isClosedView} />
          </div>
        </div>
        <div className={`grid gap-3 rounded-3xl border p-4 text-sm sm:min-w-[300px] ${isClosedView ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-white/10 bg-white/6 text-slate-200'}`}>
          <div>
            <p className={`text-base font-semibold ${isClosedView ? 'text-slate-900' : 'text-white'}`}>{presenter.shellTitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <QuickPanel value={reconciliationStatus} label="對帳狀態" archived={isClosedView} />
            <QuickPanel value={closeStatus} label="結案狀態" archived={isClosedView} />
          </div>
          {presenter.archived ? (
            <Link href={presenter.listHref} className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${isClosedView ? 'border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
              返回{presenter.listLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function CollectionSection({
  presenter,
  eventDate,
  collectionRecords,
  onCreate,
  onDelete,
}: {
  presenter: QuoteCostDetailPresenter;
  eventDate: string;
  collectionRecords: CollectionRecordView[];
  onCreate?: () => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SimpleSectionTitle title={presenter.collectionTitle} />
        {presenter.canCreateCollectionRecord ? (
          <button type="button" onClick={onCreate} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            {presenter.collectionPrimaryActionLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">收款日期</th>
              <th className="px-4 py-3 font-medium">收款金額</th>
              <th className="px-4 py-3 font-medium">備註</th>
              <th className="px-4 py-3 font-medium">刪除</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {collectionRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 text-slate-700">{record.collectedOn || eventDate}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(record.amount)}</td>
                <td className="px-4 py-3 text-slate-600">{record.note || '-'}</td>
                <td className="px-4 py-3">
                  {presenter.canDeleteCollectionRecord ? (
                    <button type="button" onClick={() => onDelete?.(record.id)} className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                      刪除
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ActiveOnlyFinancialSections({
  quoteImportRecord,
  quotationItems,
  vendorPaymentRecords,
}: {
  quoteImportRecord: QuoteCostProject['quotationImport'];
  quotationItems: QuoteCostProject['quotationItems'];
  vendorPaymentRecords: VendorPaymentView[];
}) {
  return (
    <>
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SimpleSectionTitle title="廠商付款狀態" />
          <p className="text-sm text-slate-500">這裡只做 project 視角 readback；實際付款主入口在 Vendor Data detail。</p>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">廠商</th>
                <th className="px-4 py-3 font-medium">目前應付</th>
                <th className="px-4 py-3 font-medium">已付款</th>
                <th className="px-4 py-3 font-medium">未付款</th>
                <th className="px-4 py-3 font-medium">付款狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {vendorPaymentRecords.map((record) => {
                const unpaid = Math.max(record.payableAmount - record.paidAmount, 0);
                const status = record.paidAmount <= 0 ? '未付款' : record.paidAmount < record.payableAmount ? '部分付款' : '已付款';
                return (
                  <tr key={record.vendorName}>
                    <td className="px-4 py-3 font-medium text-slate-900">{record.vendorName}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(record.payableAmount)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(record.paidAmount)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(unpaid)}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${status === '已付款' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : status === '部分付款' ? 'bg-sky-50 text-sky-700 ring-sky-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>{status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SimpleSectionTitle title="對外報價單" />
          <div className="flex flex-wrap gap-2">
            {quoteImportRecord ? (
              <span className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">已承接正式報價版本</span>
            ) : (
              <span className="inline-flex items-center rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">尚無正式報價資料</span>
            )}
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[980px] divide-y divide-slate-200 text-left text-sm xl:min-w-full">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">分類</th>
                <th className="px-4 py-3 font-medium">項目名稱</th>
                <th className="px-4 py-3 font-medium">說明</th>
                <th className="px-4 py-3 font-medium">數量</th>
                <th className="px-4 py-3 font-medium">單位</th>
                <th className="px-4 py-3 font-medium">單價</th>
                <th className="px-4 py-3 font-medium">小計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {quotationItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-slate-600">{item.category}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.itemName}</td>
                  <td className="px-4 py-4 text-slate-600">{item.description}</td>
                  <td className="px-4 py-4 text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-4 text-slate-600">{item.unit}</td>
                  <td className="px-4 py-4 text-slate-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export function CostManagementSection({
  archived,
  children,
}: {
  archived: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-[28px] border p-6 shadow-sm ${archived ? 'border-slate-200 bg-slate-50/70' : 'border-slate-200 bg-white'}`}>
      {children}
    </section>
  );
}

export function getCostSourceSummary(costItems: CostLineItem[], projectId: string) {
  const sourceOrder: CostSourceType[] = ['設計', '備品', '廠商'];
  const sourceTone: Record<CostSourceType, string> = {
    設計: 'bg-blue-50 text-blue-700 ring-blue-200',
    備品: 'bg-amber-50 text-amber-700 ring-amber-200',
    廠商: 'bg-violet-50 text-violet-700 ring-violet-200',
    人工: 'bg-slate-100 text-slate-700 ring-slate-200',
  };
  const sourceHref: Record<Exclude<CostSourceType, '人工'>, string> = {
    設計: `/design-tasks?project=${encodeURIComponent(projectId)}`,
    備品: `/procurement-tasks?project=${encodeURIComponent(projectId)}`,
    廠商: `/vendor-assignments?project=${encodeURIComponent(projectId)}`,
  };
  const sourceDescription: Record<Exclude<CostSourceType, '人工'>, string> = {
    設計: '承接設計線全部確認後的正式成本。',
    備品: '承接備品線全部確認後的正式成本。',
    廠商: '承接廠商線全部確認後的正式成本。',
  };

  return sourceOrder.map((sourceType) => {
    const items = costItems.filter((item) => item.sourceType === sourceType && item.includedInCost);
    return {
      label: sourceType,
      count: items.length,
      originalTotal: items.reduce((sum, item) => sum + item.originalAmount, 0),
      badgeClass: sourceTone[sourceType],
      href: sourceHref[sourceType as Exclude<CostSourceType, '人工'>],
      description: sourceDescription[sourceType as Exclude<CostSourceType, '人工'>],
    };
  });
}

export function QuickPanel({ value, label, archived }: { value: string; label: string; archived: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 ${archived ? 'border-slate-200 bg-white text-slate-500' : 'border-white/8 bg-black/10 text-slate-300'}`}>
      <p>{label}</p>
      <p className={`mt-1 font-semibold ${archived ? 'text-slate-900' : 'text-white'}`}>{value}</p>
    </div>
  );
}

export function OverviewRow({ label, value, archived = false }: { label: string; value: string; archived?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${archived ? 'bg-white ring-slate-200' : 'bg-slate-50 ring-slate-200'}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

export function SimpleSectionTitle({ title }: { title: string }) {
  return <h3 className="text-xl font-semibold text-slate-900">{title}</h3>;
}
