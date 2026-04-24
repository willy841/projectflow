import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      plans: Array<{
        title: string;
        quantity?: string;
        amount?: string;
        previewUrl?: string;
        vendor?: string;
      }>;
    };

    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);

    await repositories.procurementTaskPlans.deleteByTask(id);

    const rows = [];
    for (const [index, plan] of body.plans.filter((plan) => [plan.title, plan.quantity, plan.amount, plan.previewUrl, plan.vendor].some((value) => value?.trim())).entries()) {
      rows.push(
        await repositories.procurementTaskPlans.insert({
          procurement_task_id: id,
          title: plan.title,
          quantity: plan.quantity ?? null,
          amount: plan.amount?.replace(/[^\d.-]/g, '') || null,
          preview_url: plan.previewUrl ?? null,
          vendor_name_text: plan.vendor ?? null,
          sort_order: index + 1,
        }),
      );
    }

    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown replace procurement plans error' },
      { status: 500 },
    );
  }
}
