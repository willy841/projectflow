import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import { createPhase1Services } from '@/lib/db/phase1-services';

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string; vendorId: string }> },
) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { projectId, vendorId } = await context.params;
    const db = createPhase1DbClient();
    const repositories = createPhase1Repositories(db);
    const services = createPhase1Services(repositories);
    const tasks = await repositories.vendorTasks.listByProjectAndVendor(projectId, vendorId);

    if (!tasks.length) {
      return NextResponse.json({ ok: false, error: '找不到這個 project + vendor 群組任務' }, { status: 404 });
    }

    const confirmations = [];
    for (const task of tasks) {
      confirmations.push(await services.confirmVendorTaskPlans(task.id));
    }

    return NextResponse.json({
      ok: true,
      taskCount: tasks.length,
      confirmationIds: confirmations.map((confirmation) => confirmation.id),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown vendor group confirm error' },
      { status: 500 },
    );
  }
}
