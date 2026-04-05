import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import { createPhase1Services } from '@/lib/db/phase1-services';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);
  const services = createPhase1Services(repositories);

  const confirmation = await services.confirmDesignTaskPlans(id);

  return NextResponse.json({ ok: true, confirmation });
}
