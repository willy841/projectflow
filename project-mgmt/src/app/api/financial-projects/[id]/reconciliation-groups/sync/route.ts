import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      groups?: Array<{
        sourceType?: string;
        vendorId?: string | null;
        vendorName?: string;
        reconciliationStatus?: '未對帳' | '待確認' | '已對帳';
        amountTotal?: number;
        itemCount?: number;
      }>;
    };

    const groups = (body.groups ?? []).filter((group) => group.sourceType && group.vendorName);
    const db = createPhase1DbClient();
    await db.query(`alter table financial_reconciliation_groups add column if not exists amount_total numeric null`);
    await db.query(`alter table financial_reconciliation_groups add column if not exists item_count integer null`);
    await db.query(`alter table financial_reconciliation_groups drop constraint if exists chk_financial_reconciliation_groups_status`);
    await db.query(`alter table financial_reconciliation_groups add constraint chk_financial_reconciliation_groups_status check (reconciliation_status in ('未對帳', '待確認', '已對帳'))`);
    await db.query('begin');

    try {
      await db.query('delete from financial_reconciliation_groups where project_id = $1', [id]);

      const rows = [];
      for (const group of groups) {
        const result = await db.query(
          `
            insert into financial_reconciliation_groups (
              project_id,
              source_type,
              vendor_id,
              vendor_name,
              reconciliation_status,
              reconciled_at,
              amount_total,
              item_count
            )
            values ($1, $2, $3, $4, $5, case when $5 = '已對帳' then now() else null end, $6, $7)
            returning *
          `,
          [
            id,
            group.sourceType,
            group.vendorId ?? null,
            group.vendorName,
            group.reconciliationStatus ?? '未對帳',
            Number(group.amountTotal ?? 0),
            Number(group.itemCount ?? 0),
          ],
        );
        if (result.rows[0]) rows.push(result.rows[0]);
      }

      await db.query('commit');
      return NextResponse.json({ ok: true, rows });
    } catch (error) {
      await db.query('rollback');
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown reconciliation group sync error';
    console.error('[financial][reconciliation-groups][sync] failed', { error: message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
