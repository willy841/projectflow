import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { hasFinancialQuotationImportTotalAmountColumn } from '@/lib/db/quotation-schema';
import { getQuoteCostProjectByIdWithDbFinancials } from '@/lib/db/financial-flow-adapter';
import { saveCloseoutRetainedSnapshot } from '@/lib/db/closeout-retained-snapshot';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      expectedOutstandingTotal?: number;
      expectedReconciliationStatus?: '未開始' | '待確認' | '已完成';
    };

    const db = createPhase1DbClient();
    const projectRows = await db.query<{ status: string | null }>(
      `select status from projects where id = $1 limit 1`,
      [id],
    );

    if (!projectRows.rows[0]) {
      return NextResponse.json({ ok: false, error: 'project-not-found' }, { status: 404 });
    }

    const collectionRows = await db.query<{ total: number | null }>(
      `
        select coalesce(sum(amount), 0)::float8 as total
        from project_collection_records
        where project_id = $1
      `,
      [id],
    );

    const hasQuotationImportTotalAmountColumn = await hasFinancialQuotationImportTotalAmountColumn().catch(() => false);
    const quotationRows = await db.query<{ total: number | null }>(
      hasQuotationImportTotalAmountColumn
        ? `
            select coalesce(total_amount, 0)::float8 as total
            from financial_quotation_imports
            where project_id = $1 and is_active = true
            limit 1
          `
        : `
            select coalesce(sum(quantity * unit_price), 0)::float8 as total
            from financial_quotation_line_items fqli
            inner join financial_quotation_imports fqi on fqi.id = fqli.quotation_import_id
            where fqi.project_id = $1 and fqi.is_active = true
          `,
      [id],
    );

    const reconciliationRows = await db.query<{ totalCount: number; reconciledCount: number }>(
      `
        select
          count(*)::int as "totalCount",
          count(*) filter (where reconciliation_status = '已對帳')::int as "reconciledCount"
        from financial_reconciliation_groups
        where project_id = $1
      `,
      [id],
    );

    const quotationTotal = quotationRows.rows[0]?.total ?? 0;
    const collectedTotal = collectionRows.rows[0]?.total ?? 0;
    const outstandingTotal = Math.max(quotationTotal - collectedTotal, 0);
    const totalCount = reconciliationRows.rows[0]?.totalCount ?? 0;
    const reconciledCount = reconciliationRows.rows[0]?.reconciledCount ?? 0;
    const reconciliationStatus = totalCount > 0 && reconciledCount === totalCount ? '已完成' : reconciledCount > 0 ? '待確認' : '未開始';

    if (typeof body.expectedOutstandingTotal === 'number' && Math.abs(body.expectedOutstandingTotal - outstandingTotal) > 0.001) {
      return NextResponse.json({ ok: false, error: 'stale-outstanding-total', outstandingTotal, reconciliationStatus }, { status: 409 });
    }

    if (body.expectedReconciliationStatus && body.expectedReconciliationStatus !== reconciliationStatus) {
      return NextResponse.json({ ok: false, error: 'stale-reconciliation-status', outstandingTotal, reconciliationStatus }, { status: 409 });
    }

    if (outstandingTotal > 0) {
      return NextResponse.json({ ok: false, error: 'outstanding-not-zero', outstandingTotal, reconciliationStatus }, { status: 400 });
    }

    if (reconciliationStatus !== '已完成') {
      return NextResponse.json({ ok: false, error: 'reconciliation-not-complete', outstandingTotal, reconciliationStatus }, { status: 400 });
    }

    const liveProject = await getQuoteCostProjectByIdWithDbFinancials(id);
    if (!liveProject) {
      return NextResponse.json({ ok: false, error: 'financial-project-not-found' }, { status: 404 });
    }

    await saveCloseoutRetainedSnapshot({
      ...liveProject,
      projectStatus: '已結案',
      closeStatus: '已結案',
    });

    const result = await db.query<{ id: string; status: string }>(
      `
        update projects
        set status = '已結案'
        where id = $1
        returning id, status
      `,
      [id],
    );

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/quote-costs');
    revalidatePath(`/quote-costs/${id}`);
    revalidatePath('/closeouts');
    revalidatePath(`/closeouts/${id}`);
    revalidatePath('/accounting-center');

    return NextResponse.json({
      ok: true,
      id,
      status: result.rows[0]?.status ?? '已結案',
      outstandingTotal,
      reconciliationStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown closeout error';
    console.error('[financial][closeout][write] failed', { error: message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
