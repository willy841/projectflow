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
  vendorId?: string | null;
  vendorName: string;
  amountTotal: number;
  itemCount: number;
  reconciliationStatus: string;
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
  reconciledCount: number;
  unreconciledCount: number;
  payableAmount: number;
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
    <header className={`px-1 py-1 ${isClosedView ? 'text-slate-100' : 'text-white'}`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 xl:self-center">
          <h2 className={`text-3xl font-semibold tracking-tight ${isClosedView ? 'text-slate-50' : 'text-white'}`}>{projectName}</h2>
          <div className={`mt-4 flex flex-wrap items-center gap-2 ${isClosedView ? 'text-slate-300' : 'text-slate-200'}`}>
            <OverviewRow label="活動日期" value={eventDate} archived={isClosedView} />
          </div>
        </div>
        <div className="sm:min-w-[300px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`text-base font-semibold ${isClosedView ? 'text-slate-50' : 'text-white'}`}>{presenter.shellTitle}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <QuickPanel value={reconciliationStatus} label="對帳狀態" archived={isClosedView} />
              <QuickPanel value={closeStatus} label="結案狀態" archived={isClosedView} />
              {presenter.archived ? (
                <Link href={presenter.listHref} className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${isClosedView ? 'border border-white/10 bg-white/[0.06] text-slate-100 hover:bg-white/[0.1]' : 'border border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.12]'}`}>
                  返回{presenter.listLabel}
                </Link>
              ) : null}
            </div>
          </div>
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
    <section className="space-y-5 px-1">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SimpleSectionTitle title={presenter.collectionTitle} />
        {presenter.canCreateCollectionRecord ? (
          <button type="button" onClick={onCreate} className="pf-btn-create px-4 py-2.5">
            {presenter.collectionPrimaryActionLabel}
          </button>
        ) : null}
      </div>
      <div className="pf-table-shell mt-5">
        <table className="pf-table">
          <thead>
            <tr>
              <th className="px-4 py-3 font-medium">收款日期</th>
              <th className="px-4 py-3 font-medium">收款金額</th>
              <th className="px-4 py-3 font-medium">備註</th>
              <th className="px-4 py-3 font-medium">刪除</th>
            </tr>
          </thead>
          <tbody>
            {collectionRecords.map((record) => (
              <tr key={record.id}>
                <td className="text-slate-300">{record.collectedOn || eventDate}</td>
                <td className="font-semibold text-slate-100">{formatCurrency(record.amount)}</td>
                <td className="text-slate-300">{record.note || '-'}</td>
                <td>
                  {presenter.canDeleteCollectionRecord ? (
                    <button type="button" onClick={() => onDelete?.(record.id)} className="pf-btn-danger px-3 py-2 text-sm">
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
  quotationTotal,
  onOpenQuoteDetail,
  onImportExcel,
}: {
  quoteImportRecord: QuoteCostProject['quotationImport'];
  quotationItems: QuoteCostProject['quotationItems'];
  vendorPaymentRecords: VendorPaymentView[];
  quotationTotal: number;
  onOpenQuoteDetail?: () => void;
  onImportExcel?: () => void;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:items-start">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.76),rgba(10,18,33,0.66))] p-5 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SimpleSectionTitle title="對外報價單" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onImportExcel}
              className="pf-btn-secondary min-h-11 px-4 py-2.5"
            >
              匯入 Excel
            </button>
            <button
              type="button"
              onClick={onOpenQuoteDetail}
              disabled={!quotationItems.length && !quoteImportRecord}
              className="pf-btn-create min-h-11 px-4 py-2.5 disabled:border-white/10 disabled:bg-white/10"
            >
              查看明細
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {quoteImportRecord ? (
            <span className="inline-flex items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-4 py-2 text-sm font-semibold text-emerald-200">已承接正式報價版本</span>
          ) : (
            <span className="inline-flex items-center rounded-2xl border border-amber-300/20 bg-amber-400/12 px-4 py-2 text-sm font-semibold text-amber-200">尚無正式報價資料</span>
          )}
          <span className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200">共 {quotationItems.length} 筆</span>
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,47,73,0.88),rgba(15,23,42,0.92))] px-5 py-4 text-white shadow-[0_24px_48px_-28px_rgba(14,165,233,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <p className="text-sm text-slate-300">報價總金額</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(quotationTotal)}</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.76),rgba(10,18,33,0.66))] p-5 shadow-[0_34px_84px_-30px_rgba(0,0,0,0.72),0_10px_18px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_18px_28px_-20px_rgba(255,255,255,0.05),inset_0_-28px_44px_-24px_rgba(2,6,23,0.98)] backdrop-blur-[28px]">
        <div className="flex items-center justify-between gap-3">
          <SimpleSectionTitle title="廠商對帳摘要" />
        </div>
        <div className="pf-table-shell mt-4">
          <table className="pf-table">
            <thead>
              <tr>
                <th className="px-4 py-3 font-medium">廠商</th>
                <th className="px-4 py-3 font-medium">已對帳</th>
                <th className="px-4 py-3 font-medium">未對帳</th>
                <th className="px-4 py-3 font-medium">目前應付總額</th>
              </tr>
            </thead>
            <tbody>
              {vendorPaymentRecords.map((record) => (
                <tr key={record.vendorName}>
                  <td className="font-medium text-slate-100">{record.vendorName}</td>
                  <td className="text-slate-300">{record.reconciledCount} 筆</td>
                  <td className="text-slate-300">{record.unreconciledCount} 筆</td>
                  <td className="font-semibold text-slate-100">{formatCurrency(record.payableAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
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
    <section className="space-y-5 px-1">
      {children}
    </section>
  );
}

export function getCostSourceSummary(costItems: CostLineItem[], projectId: string) {
  const sourceOrder: CostSourceType[] = ['設計', '備品', '廠商'];
  const sourceTone: Record<CostSourceType, string> = {
    設計: 'bg-sky-400/14 text-sky-200 ring-sky-300/20',
    備品: 'bg-amber-400/14 text-amber-200 ring-amber-300/20',
    廠商: 'bg-violet-400/14 text-violet-200 ring-violet-300/20',
    人工: 'bg-white/[0.07] text-slate-200 ring-white/10',
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
    <div className={`rounded-2xl border px-3 py-2 ${archived ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'border-white/10 bg-black/10 text-slate-300'}`}>
      <p>{label}</p>
      <p className={`mt-1 font-semibold ${archived ? 'text-slate-100' : 'text-white'}`}>{value}</p>
    </div>
  );
}

export function OverviewRow({ label, value, archived = false }: { label: string; value: string; archived?: boolean }) {
  return (
    <div className={`inline-flex min-w-[180px] items-center gap-3 rounded-2xl border px-4 py-3 ${archived ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'border-white/10 bg-white/[0.04]'}`}>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-sm font-semibold leading-6 text-slate-100">{value}</p>
    </div>
  );
}

export function SimpleSectionTitle({ title }: { title: string }) {
  return <h3 className="text-xl font-semibold text-slate-50">{title}</h3>;
}

export function QuoteDetailModal({
  items,
  quoteImportRecord,
  onClose,
}: {
  items: QuoteCostProject['quotationItems'];
  quoteImportRecord: QuoteCostProject['quotationImport'];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,50,0.9),rgba(10,18,33,0.84))] shadow-[0_40px_120px_-46px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-slate-50">對外報價單明細</h3>
            <p className="mt-1 text-sm text-slate-400">
              {quoteImportRecord ? `目前版本：${quoteImportRecord.fileName} · 匯入時間 ${quoteImportRecord.importedAt}` : '目前尚未承接正式報價版本。'}
            </p>
            {typeof quoteImportRecord?.totalAmount === 'number' ? (
              <p className="mt-2 text-sm font-semibold text-slate-100">總金額 {formatCurrency(quoteImportRecord.totalAmount)}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pf-btn-secondary min-h-11 px-4 py-2.5"
          >
            關閉
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="pf-table-shell">
            <table className="pf-table min-w-[1080px] xl:min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 font-medium">商品名稱</th>
                  <th className="px-4 py-3 font-medium">單價</th>
                  <th className="px-4 py-3 font-medium">數量</th>
                  <th className="px-4 py-3 font-medium">單位</th>
                  <th className="px-4 py-3 font-medium">金額</th>
                  <th className="px-4 py-3 font-medium min-w-[320px]">備註</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="font-medium text-slate-100">{item.itemName}</td>
                    <td className="whitespace-nowrap text-slate-300">{formatCurrency(item.unitPrice)}</td>
                    <td className="whitespace-nowrap text-slate-300">{item.quantity}</td>
                    <td className="whitespace-nowrap text-slate-300">{item.unit || '-'}</td>
                    <td className="whitespace-nowrap font-semibold text-slate-100">{formatCurrency(item.amount)}</td>
                    <td className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{item.remark || '-'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">目前沒有可顯示的報價明細。</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
