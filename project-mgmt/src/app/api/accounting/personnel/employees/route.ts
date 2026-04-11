import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; employeeType?: 'full-time' | 'part-time' };
    const name = body.name?.trim();
    const employeeType = body.employeeType;
    if (!name || !employeeType) {
      return NextResponse.json({ ok: false, error: '姓名與類型皆為必填' }, { status: 400 });
    }
    const db = createPhase1DbClient();
    const result = await db.query(`
      insert into accounting_personnel_employees (name, employee_type)
      values ($1, $2)
      on conflict (name, employee_type) do update set is_active = true
      returning id, name, employee_type as "employeeType", is_active as "isActive"
    `, [name, employeeType]);
    return NextResponse.json({ ok: true, row: result.rows[0] ?? null });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown personnel employee create error' }, { status: 500 });
  }
}
