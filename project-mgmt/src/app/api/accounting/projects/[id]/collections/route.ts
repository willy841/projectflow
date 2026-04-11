import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      collectedOn?: string;
      amount?: number | string;
      note?: string;
    };
    const db = createPhase1DbClient();
    const result = await db.query(`
      insert into project_collection_records (project_id, collected_on, amount, note)
      values ($1, $2, $3, $4)
      returning id
    `, [id, body.collectedOn, Number(body.amount ?? 0), body.note?.trim() || null]);
    return NextResponse.json({ ok: true, id: result.rows[0]?.id ?? null });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown collection create error' }, { status: 500 });
  }
}
