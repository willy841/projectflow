import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

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

    const result = await db.query<{ id: string }>(
      `
        insert into project_vendor_payment_records (project_id, vendor_name, paid_on, amount, note)
        values ($1, $2, $3, $4, $5)
        returning id
      `,
      [body.projectId, vendor.name, body.paidOn, body.amount, body.note ?? ''],
    );

    return NextResponse.json({ ok: true, id: result.rows[0]?.id ?? null });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : '新增付款失敗' },
      { status: 500 },
    );
  }
}
