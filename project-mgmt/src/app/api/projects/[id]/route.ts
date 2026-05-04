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
      eventType?: string;
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
      contactLine?: string;
      owner?: string;
      status?: string;
    };

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const project = await repositories.projects.update(id, {
      name: body.name?.trim(),
      client_name: body.client?.trim() || null,
      event_date: body.eventDate?.trim() || null,
      location: body.location?.trim() || null,
      load_in_time: body.loadInTime?.trim() || null,
      event_type: body.eventType?.trim() || null,
      contact_name: body.contactName?.trim() || null,
      contact_phone: body.contactPhone?.trim() || null,
      contact_email: body.contactEmail?.trim() || null,
      contact_line: body.contactLine?.trim() || null,
      owner: body.owner?.trim() || null,
      status: body.status?.trim() || '執行中',
    });

    return NextResponse.json({ ok: true, project, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown update project error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      confirmProjectName?: string;
    };

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const project = await repositories.projects.findById(id);

    if (!project) {
      return NextResponse.json({ ok: false, error: '找不到專案' }, { status: 404 });
    }

    const confirmProjectName = body.confirmProjectName?.trim();
    if (!confirmProjectName || confirmProjectName !== project.name) {
      return NextResponse.json({ ok: false, error: '請輸入正確專案名稱後再刪除' }, { status: 400 });
    }

    await repositories.projects.delete(id);

    return NextResponse.json({
      ok: true,
      deletedProjectId: id,
      deletedProjectName: project.name,
      storage: access.storage,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown delete project error' }, { status: 500 });
  }
}
