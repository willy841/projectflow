import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

function buildProjectCode() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PRJ-${stamp}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const body = (await request.json()) as {
      name?: string;
      client?: string;
      eventDate?: string;
      location?: string;
      owner?: string;
      loadInTime?: string;
      eventType?: string;
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
      contactLine?: string;
    };

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: '專案名稱必填' }, { status: 400 });
    }

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const project = await repositories.projects.insert({
      code: buildProjectCode(),
      name,
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
      status: '執行中',
    });

    return NextResponse.json({ ok: true, project, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown create project error' }, { status: 500 });
  }
}
