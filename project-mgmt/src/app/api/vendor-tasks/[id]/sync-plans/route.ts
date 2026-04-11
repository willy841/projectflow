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
        requirement?: string;
        amount?: string;
        vendorName?: string;
      }>;
    };

    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);
    const services = createPhase1Services(repositories);

    const result = await services.syncVendorPlans(
      id,
      body.plans
        .filter((plan) => plan.title?.trim())
        .map((plan, index) => ({
          id: plan.id,
          vendor_task_id: id,
          title: plan.title,
          requirement_text: plan.requirement ?? null,
          amount: plan.amount?.replace(/[^\d.-]/g, '') || null,
          vendor_name_text: plan.vendorName ?? null,
          sort_order: index + 1,
        })),
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown sync vendor plans error' },
      { status: 500 },
    );
  }
}
