import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import { createPhase1Services } from '@/lib/db/phase1-services';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { id } = await context.params;
    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);
    const services = createPhase1Services(repositories);
    const confirmation = await services.confirmProcurementTaskPlans(id);
    return NextResponse.json({ ok: true, confirmation });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown procurement confirm error' },
      { status: 500 },
    );
  }
}
