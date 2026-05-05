import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';
import { createPhase1Services } from '@/lib/db/phase1-services';

function normalizeVendorName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function POST(
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
      flowType?: 'design' | 'procurement' | 'vendor';
      executionItemId?: string;
      title?: string;
      size?: string;
      material?: string;
      quantity?: string;
      structure?: string;
      referenceUrl?: string;
      note?: string;
      item?: string;
      budgetNote?: string;
      vendorName?: string;
      requirement?: string;
      amount?: string;
      assignee?: string;
      status?: string;
    };

    if (!body.flowType || !body.executionItemId) {
      return NextResponse.json({ ok: false, error: '缺少派發必要欄位' }, { status: 400 });
    }

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const services = createPhase1Services(repositories);
    const title = body.title?.trim() || body.item?.trim() || '未命名任務';

    const taskStatus = '進行中';

    if (body.flowType === 'design') {
      const existing = (await repositories.designTasks.listByProject(id)).find(
        (task) => task.source_execution_item_id === body.executionItemId,
      );

      const task = existing
        ? await repositories.designTasks.update(existing.id, {
            vendor_id: null,
            title,
            assignee: body.assignee?.trim() || null,
            size: body.size?.trim() || null,
            material: body.material?.trim() || null,
            structure: body.structure?.trim() || null,
            quantity: body.quantity?.trim() || null,
            requirement_text: body.note?.trim() || null,
            reference_url: body.referenceUrl?.trim() || null,
            status: taskStatus,
          })
        : await services.publishDesignTask({
            project_id: id,
            source_execution_item_id: body.executionItemId,
            vendor_id: null,
            title,
            assignee: body.assignee?.trim() || null,
            size: body.size?.trim() || null,
            material: body.material?.trim() || null,
            structure: body.structure?.trim() || null,
            quantity: body.quantity?.trim() || null,
            requirement_text: body.note?.trim() || null,
            reference_url: body.referenceUrl?.trim() || null,
            status: taskStatus,
          });

      const currentPlans = await repositories.designTaskPlans.listByTask(task.id);
      if (currentPlans.length === 1) {
        await repositories.designTaskPlans.update(currentPlans[0].id, {
          title,
          size: body.size?.trim() || null,
          material: body.material?.trim() || null,
          structure: body.structure?.trim() || null,
          quantity: body.quantity?.trim() || null,
          preview_url: body.referenceUrl?.trim() || null,
        });
      }

      return NextResponse.json({ ok: true, taskId: task.id, boardPath: `/design-tasks/${task.id}`, storage: access.storage });
    }

    if (body.flowType === 'procurement') {
      const existing = (await repositories.procurementTasks.listByProject(id)).find(
        (task) => task.source_execution_item_id === body.executionItemId,
      );

      const task = existing
        ? await repositories.procurementTasks.update(existing.id, {
            vendor_id: null,
            title,
            quantity: body.quantity?.trim() || null,
            budget_note: body.budgetNote?.trim() || null,
            requirement_text: body.note?.trim() || null,
            reference_url: body.referenceUrl?.trim() || null,
            status: taskStatus,
          })
        : await services.publishProcurementTask({
            project_id: id,
            source_execution_item_id: body.executionItemId,
            vendor_id: null,
            title,
            quantity: body.quantity?.trim() || null,
            budget_note: body.budgetNote?.trim() || null,
            requirement_text: body.note?.trim() || null,
            reference_url: body.referenceUrl?.trim() || null,
            status: taskStatus,
          });

      const currentPlans = await repositories.procurementTaskPlans.listByTask(task.id);
      if (currentPlans.length === 1) {
        await repositories.procurementTaskPlans.update(currentPlans[0].id, {
          title,
          quantity: body.quantity?.trim() || null,
          preview_url: body.referenceUrl?.trim() || null,
        });
      }

      return NextResponse.json({ ok: true, taskId: task.id, boardPath: `/procurement-tasks/${task.id}`, storage: access.storage });
    }

    const normalizedVendorName = body.vendorName?.trim();
    if (!normalizedVendorName) {
      return NextResponse.json({ ok: false, error: '執行廠商必填，且需匹配既有廠商資料' }, { status: 400 });
    }

    const normalized = normalizeVendorName(normalizedVendorName);
    const vendor = await repositories.vendors.findByNormalizedName(normalized);
    if (!vendor) {
      return NextResponse.json({ ok: false, error: '執行廠商未匹配既有廠商資料' }, { status: 400 });
    }

    const existing = (await repositories.vendorTasks.listByProjectAndVendor(id, vendor.id)).find(
      (task) => task.source_execution_item_id === body.executionItemId,
    );

    const task = existing
      ? await repositories.vendorTasks.update(existing.id, {
          title,
          requirement_text: body.requirement?.trim() || body.note?.trim() || null,
          status: taskStatus,
        })
      : await services.publishVendorTask({
          project_id: id,
          source_execution_item_id: body.executionItemId,
          vendor_id: vendor.id,
          title,
          requirement_text: body.requirement?.trim() || body.note?.trim() || null,
          status: taskStatus,
        });

    const currentPlans = await repositories.vendorTaskPlans.listByTask(task.id);
    if (currentPlans.length === 1) {
      await repositories.vendorTaskPlans.update(currentPlans[0].id, {
        title,
        requirement_text: body.requirement?.trim() || body.note?.trim() || null,
        amount: body.amount?.trim() || null,
      });
    }

    return NextResponse.json({ ok: true, taskId: task.id, boardPath: `/vendor-assignments/${task.id}`, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown dispatch error' }, { status: 500 });
  }
}
