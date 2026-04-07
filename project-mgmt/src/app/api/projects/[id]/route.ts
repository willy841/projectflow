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
      name?: string;
      client?: string;
      eventDate?: string;
      location?: string;
      loadInTime?: string;
      status?: string;
    };

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const project = await repositories.projects.update(id, {
      name: body.name?.trim(),
      client_name: body.client?.trim() || null,
      event_date: body.eventDate?.trim() || null,
      location: body.location?.trim() || null,
      load_in_time: body.loadInTime?.trim() || null,
      status: body.status?.trim() || '執行中',
    });

    return NextResponse.json({ ok: true, project, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown update project error' }, { status: 500 });
  }
}
