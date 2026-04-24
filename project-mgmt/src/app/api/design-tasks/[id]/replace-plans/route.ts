import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import { createPhase1Services } from '@/lib/db/phase1-services';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      plans: Array<{
        title: string;
        size?: string;
        material?: string;
        structure?: string;
        quantity?: string;
        amount?: string;
        previewUrl?: string;
        vendor?: string;
      }>;
    };

    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);
    const services = createPhase1Services(repositories);

    const rows = await services.replaceDesignPlans(
      id,
      body.plans
        .filter((plan) => [plan.title, plan.size, plan.material, plan.structure, plan.quantity, plan.amount, plan.previewUrl, plan.vendor].some((value) => value?.trim()))
        .map((plan, index) => ({
          design_task_id: id,
          title: plan.title,
          size: plan.size ?? null,
          material: plan.material ?? null,
          structure: plan.structure ?? null,
          quantity: plan.quantity ?? null,
          amount: plan.amount?.replace(/[^\d.-]/g, '') || null,
          preview_url: plan.previewUrl ?? null,
          vendor_name_text: plan.vendor ?? null,
          sort_order: index + 1,
        })),
    );

    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown replace design plans error' },
      { status: 500 },
    );
  }
}
