import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: '分類名稱不得為空' }, { status: 400 });
    }

    const db = createPhase1DbClient();
    const result = await db.query(`
      insert into accounting_office_categories (name)
      values ($1)
      on conflict (name) do update set is_active = true
      returning id, name, is_active as "isActive"
    `, [name]);

    return NextResponse.json({ ok: true, row: result.rows[0] ?? null });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown office category create error' }, { status: 500 });
  }
}
