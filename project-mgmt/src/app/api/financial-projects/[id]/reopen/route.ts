import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createPhase1DbClient();

  try {
    const currentResult = await db.query<{ status: string | null }>(
      `select status from projects where id = $1 limit 1`,
      [id],
    );

    const currentStatus = currentResult.rows[0]?.status ?? null;
    if (!currentResult.rows.length) {
      return NextResponse.json({ ok: false, error: 'project-not-found' }, { status: 404 });
    }

    if (currentStatus !== '已結案' && currentStatus !== '結案') {
      return NextResponse.json({ ok: false, error: 'reopen-not-allowed', currentStatus }, { status: 409 });
    }

    await db.query(
      `
        update projects
        set status = '執行中',
            updated_at = now()
        where id = $1
      `,
      [id],
    );

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/quote-costs');
    revalidatePath(`/quote-costs/${id}`);
    revalidatePath('/closeouts');
    revalidatePath(`/closeouts/${id}`);
    revalidatePath('/accounting-center');

    return NextResponse.json({ ok: true, projectId: id, status: '執行中' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown reopen error';
    console.error('[financial][closeout][reopen] failed', { error: message, projectId: id });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
