import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; flowType: string; executionItemId: string }> },
) {
  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { id, flowType, executionItemId } = await params;
    const db = createPhase1DbClient();

    if (flowType === 'design') {
      await db.query(
        `delete from design_tasks where project_id = $1 and source_execution_item_id = $2`,
        [id, executionItemId],
      );
      return NextResponse.json({ ok: true, flowType, executionItemId, storage: access.storage });
    }

    if (flowType === 'procurement') {
      await db.query(
        `delete from procurement_tasks where project_id = $1 and source_execution_item_id = $2`,
        [id, executionItemId],
      );
      return NextResponse.json({ ok: true, flowType, executionItemId, storage: access.storage });
    }

    if (flowType === 'vendor') {
      await db.query(
        `delete from vendor_tasks where project_id = $1 and source_execution_item_id = $2`,
        [id, executionItemId],
      );
      return NextResponse.json({ ok: true, flowType, executionItemId, storage: access.storage });
    }

    return NextResponse.json({ ok: false, error: 'Unsupported flow type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown dispatch delete error' },
      { status: 500 },
    );
  }
}
