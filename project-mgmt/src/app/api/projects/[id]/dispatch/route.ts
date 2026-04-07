import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
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
    };

    if (!body.flowType || !body.executionItemId) {
      return NextResponse.json({ ok: false, error: '缺少派發必要欄位' }, { status: 400 });
    }

    const repositories = createPhase1Repositories(createPhase1DbClient());
    const services = createPhase1Services(repositories);
    const title = body.title?.trim() || body.item?.trim() || '未命名任務';

    if (body.flowType === 'design') {
      const existing = (await repositories.designTasks.listByProject(id)).find(
        (task) => task.source_execution_item_id === body.executionItemId,
      );

      const task = existing
        ? await repositories.designTasks.update(existing.id, {
            title,
            size: body.size?.trim() || null,
            material: body.material?.trim() || null,
            structure: body.structure?.trim() || null,
            quantity: body.quantity?.trim() || null,
            requirement_text: body.note?.trim() || null,
            reference_url: body.referenceUrl?.trim() || null,
            status: '待處理',
          })
        : await services.publishDesignTask({
            project_id: id,
            source_execution_item_id: body.executionItemId,
            title,
            size: body.size?.trim() || null,
            material: body.material?.trim() || null,
            structure: body.structure?.trim() || null,
            quantity: body.quantity?.trim() || null,
            requirement_text: body.note?.trim() || null,
            reference_url: body.referenceUrl?.trim() || null,
            status: '待處理',
          });

      return NextResponse.json({ ok: true, taskId: task.id, boardPath: `/design-tasks/${task.id}` });
    }

    if (body.flowType === 'procurement') {
      const existing = (await repositories.procurementTasks.listByProject(id)).find(
        (task) => task.source_execution_item_id === body.executionItemId,
      );

      const task = existing
        ? await repositories.procurementTasks.update(existing.id, {
            title,
            quantity: body.quantity?.trim() || null,
            budget_note: body.budgetNote?.trim() || null,
            requirement_text: body.note?.trim() || null,
            reference_url: body.referenceUrl?.trim() || null,
            status: '待處理',
          })
        : await services.publishProcurementTask({
            project_id: id,
            source_execution_item_id: body.executionItemId,
            title,
            quantity: body.quantity?.trim() || null,
            budget_note: body.budgetNote?.trim() || null,
            requirement_text: body.note?.trim() || null,
            reference_url: body.referenceUrl?.trim() || null,
            status: '待處理',
          });

      return NextResponse.json({ ok: true, taskId: task.id, boardPath: `/procurement-tasks/${task.id}` });
    }

    const vendorName = body.vendorName?.trim();
    if (!vendorName) {
      return NextResponse.json({ ok: false, error: '廠商名稱必填' }, { status: 400 });
    }

    const normalized = normalizeVendorName(vendorName);
    let vendor = await repositories.vendors.findByNormalizedName(normalized);
    if (!vendor) {
      vendor = await repositories.vendors.insert({ name: vendorName, normalized_name: normalized });
    }

    const existing = (await repositories.vendorTasks.listByProjectAndVendor(id, vendor.id)).find(
      (task) => task.source_execution_item_id === body.executionItemId,
    );

    const task = existing
      ? await repositories.vendorTasks.update(existing.id, {
          title,
          requirement_text: body.requirement?.trim() || body.note?.trim() || null,
          status: '待處理',
        })
      : await services.publishVendorTask({
          project_id: id,
          source_execution_item_id: body.executionItemId,
          vendor_id: vendor.id,
          title,
          requirement_text: body.requirement?.trim() || body.note?.trim() || null,
          status: '待處理',
        });

    if (body.amount?.trim() || body.requirement?.trim()) {
      await services.syncVendorPlans(task.id, [
        {
          title,
          requirement_text: body.requirement?.trim() || null,
          amount: body.amount?.trim() || null,
          sort_order: 1,
        },
      ]);
    }

    return NextResponse.json({ ok: true, taskId: task.id, boardPath: `/vendor-assignments/${task.id}` });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown dispatch error' }, { status: 500 });
  }
}
