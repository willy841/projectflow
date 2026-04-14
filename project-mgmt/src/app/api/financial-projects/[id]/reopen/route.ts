import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  try {
    await db.query(
      `
        update projects
        set status = '執行中',
            updated_at = now()
        where id = $1
      `,
      [id],
    );

    return NextResponse.json({ ok: true, projectId: id, status: '執行中' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown reopen error';
    console.error('[financial][closeout][reopen] failed', { error: message, projectId: id });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
