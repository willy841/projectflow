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
