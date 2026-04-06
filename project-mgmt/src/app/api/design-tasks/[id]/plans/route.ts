import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      title: string;
      size?: string;
      material?: string;
      structure?: string;
      quantity?: string;
      amount?: string;
      previewUrl?: string;
      vendor?: string;
    };

    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);

    const row = await repositories.designTaskPlans.insert({
      design_task_id: id,
      title: body.title,
      size: body.size ?? null,
      material: body.material ?? null,
      structure: body.structure ?? null,
      quantity: body.quantity ?? null,
      amount: body.amount?.replace(/[^\d.-]/g, '') || null,
      preview_url: body.previewUrl ?? null,
      vendor_name_text: body.vendor ?? null,
      sort_order: Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({ ok: true, row });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown design plan insert error',
      },
      { status: 500 },
    );
  }
}
