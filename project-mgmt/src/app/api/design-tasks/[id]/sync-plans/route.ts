import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import { createPhase1Services } from '@/lib/db/phase1-services';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { id } = await context.params;
    const body = (await request.json()) as {
      plans: Array<{
        id?: string;
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

    const result = await services.syncDesignPlans(
      id,
      body.plans
        .filter((plan) => plan.title?.trim())
        .map((plan, index) => ({
          id: plan.id,
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

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown sync design plans error' },
      { status: 500 },
    );
  }
}
