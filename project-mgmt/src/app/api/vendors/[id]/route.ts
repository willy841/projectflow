import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { id } = await params;
    const body = (await request.json()) as {
      tradeLabel?: string;
      contactName?: string;
      phone?: string;
      email?: string;
      lineId?: string;
      address?: string;
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      laborName?: string;
      nationalId?: string;
      birthDateRoc?: string;
      unionMembership?: string;
    };

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const vendor = await repositories.vendors.update(id, {
      trade_label: body.tradeLabel?.trim() || null,
      contact_name: body.contactName?.trim() || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      line_id: body.lineId?.trim() || null,
      address: body.address?.trim() || null,
      bank_name: body.bankName?.trim() || null,
      account_name: body.accountName?.trim() || null,
      account_number: body.accountNumber?.trim() || null,
      labor_name: body.laborName?.trim() || null,
      labor_id_no: body.nationalId?.trim() || null,
      labor_birthday_roc: body.birthDateRoc?.trim() || null,
      labor_union_membership: body.unionMembership?.trim() || null,
    });

    return NextResponse.json({ ok: true, vendor, storage: access.storage });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown update vendor error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { id } = await params;
    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);

    const vendorTaskRefs = await db.query<{ count: string }>(
      `select count(*)::text as count from vendor_tasks where vendor_id = $1`,
      [id],
    );
    const designTaskRefs = await db.query<{ count: string }>(
      `select count(*)::text as count from design_tasks where vendor_id = $1`,
      [id],
    );
    const procurementTaskRefs = await db.query<{ count: string }>(
      `select count(*)::text as count from procurement_tasks where vendor_id = $1`,
      [id],
    );

    const linkedCount =
      Number(vendorTaskRefs.rows[0]?.count ?? '0') +
      Number(designTaskRefs.rows[0]?.count ?? '0') +
      Number(procurementTaskRefs.rows[0]?.count ?? '0');

    if (linkedCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: '這個廠商目前仍被任務使用中，請先解除相關交辦或改派其他廠商後再刪除。',
          code: 'VENDOR_IN_USE',
          linkedCount,
        },
        { status: 409 },
      );
    }

    await repositories.vendors.delete(id);

    return NextResponse.json({ ok: true, deletedId: id, storage: access.storage });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown delete vendor error' },
      { status: 500 },
    );
  }
}
