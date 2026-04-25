import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

    const deleteTasksAndConfirmations = async (taskTable: 'design_tasks' | 'procurement_tasks' | 'vendor_tasks', confirmationFlowType: 'design' | 'procurement' | 'vendor') => {
      await db.query('begin');
      try {
        const taskRows = await db.query<{ id: string }>(
          `select id from ${taskTable} where project_id = $1 and source_execution_item_id = $2`,
          [id, executionItemId],
        );
        const taskIds = taskRows.rows.map((row) => row.id);

        if (taskIds.length) {
          await db.query(
            `delete from task_confirmations where project_id = $1 and flow_type = $2 and task_id = any($3::uuid[])`,
            [id, confirmationFlowType, taskIds],
          );
        }

        await db.query(
          `delete from ${taskTable} where project_id = $1 and source_execution_item_id = $2`,
          [id, executionItemId],
        );
        await db.query('commit');
      } catch (error) {
        await db.query('rollback');
        throw error;
      }

      revalidatePath('/');
      revalidatePath('/projects');
      revalidatePath(`/projects/${id}`);
      revalidatePath('/quote-costs');
      revalidatePath(`/quote-costs/${id}`);
      revalidatePath('/closeouts');
      revalidatePath(`/closeouts/${id}`);
    };

    if (flowType === 'design') {
      await deleteTasksAndConfirmations('design_tasks', 'design');
      return NextResponse.json({ ok: true, flowType, executionItemId, storage: access.storage });
    }

    if (flowType === 'procurement') {
      await deleteTasksAndConfirmations('procurement_tasks', 'procurement');
      return NextResponse.json({ ok: true, flowType, executionItemId, storage: access.storage });
    }

    if (flowType === 'vendor') {
      await deleteTasksAndConfirmations('vendor_tasks', 'vendor');
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
