import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import { getVendorFinancialSummary } from '@/lib/db/vendor-financial-adapter';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      projectId?: string;
      paidOn?: string;
      amount?: number;
      note?: string;
    };

    if (!body.projectId || !body.paidOn || typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json({ ok: false, error: '缺少必要欄位' }, { status: 400 });
    }

    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);
    const vendor = await repositories.vendors.findById(id);
    if (!vendor) {
      return NextResponse.json({ ok: false, error: '找不到廠商' }, { status: 404 });
    }

    const financialSummary = await getVendorFinancialSummary({ vendorId: vendor.id, vendorName: vendor.name });
    const targetRecord = financialSummary.records.find((record) => record.projectId === body.projectId);
    if (!targetRecord) {
      return NextResponse.json({ ok: false, error: '找不到這筆 project × vendor 應付資料' }, { status: 400 });
    }
    if (targetRecord.hasUnreconciledGroups) {
      return NextResponse.json({ ok: false, error: '此專案內該廠商尚未全部對帳，暫不可標記已付款' }, { status: 400 });
    }

    const paidAmountResult = await db.query<{ total: string | null }>(
      `
        select coalesce(sum(amount), 0)::text as total
        from project_vendor_payment_records
        where project_id = $1 and (vendor_id = $2 or (vendor_id is null and vendor_name = $3))
      `,
      [body.projectId, vendor.id, vendor.name],
    );
    const currentPaidAmount = Number(paidAmountResult.rows[0]?.total ?? '0');
    const remainingUnpaidAmount = Math.max(targetRecord.adjustedCost - currentPaidAmount, 0);
    if (remainingUnpaidAmount <= 0) {
      return NextResponse.json({ ok: false, error: '這筆 project × vendor 已無未付款金額' }, { status: 400 });
    }
    if (body.amount > remainingUnpaidAmount) {
      return NextResponse.json({ ok: false, error: `付款金額不可超過目前未付款金額 ${remainingUnpaidAmount}` }, { status: 400 });
    }

    const result = await db.query<{ id: string }>(
      `
        insert into project_vendor_payment_records (project_id, vendor_id, vendor_name, paid_on, amount, note)
        values ($1, $2, $3, $4, $5, $6)
        returning id
      `,
      [body.projectId, vendor.id, vendor.name, body.paidOn, body.amount, body.note ?? ''],
    );

    return NextResponse.json({ ok: true, id: result.rows[0]?.id ?? null });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : '新增付款失敗' },
      { status: 500 },
    );
  }
}
