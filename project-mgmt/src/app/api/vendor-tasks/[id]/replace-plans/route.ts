import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      plans: Array<{ title: string; requirement?: string; amount?: string }>;
    };

    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);

    await repositories.vendorTaskPlans.deleteByTask(id);

    const rows = [];
    for (const [index, plan] of body.plans.filter((plan) => plan.title?.trim()).entries()) {
      rows.push(
        await repositories.vendorTaskPlans.insert({
          vendor_task_id: id,
          title: plan.title,
          requirement_text: plan.requirement ?? null,
          amount: plan.amount?.replace(/[^\d.-]/g, '') || null,
          sort_order: index + 1,
        }),
      );
    }

    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown replace vendor plans error' },
      { status: 500 },
    );
  }
}
