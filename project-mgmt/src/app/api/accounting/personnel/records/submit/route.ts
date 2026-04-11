import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      employeeId?: string;
      salaryMonth?: string;
      payload?: Record<string, unknown>;
    };
    if (!body.employeeId || !body.salaryMonth) {
      return NextResponse.json({ ok: false, error: 'employeeId 與 salaryMonth 為必填' }, { status: 400 });
    }
    const db = createPhase1DbClient();
    const result = await db.query(`
      insert into accounting_personnel_records (employee_id, salary_month, record_status, payload_json, submitted_at)
      values ($1, $2, 'submitted', $3::jsonb, now())
      on conflict (employee_id, salary_month, record_status)
      do update set payload_json = excluded.payload_json, submitted_at = excluded.submitted_at
      returning id
    `, [body.employeeId, body.salaryMonth, JSON.stringify(body.payload ?? {})]);
    return NextResponse.json({ ok: true, id: result.rows[0]?.id ?? null });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown personnel submit error' }, { status: 500 });
  }
}
