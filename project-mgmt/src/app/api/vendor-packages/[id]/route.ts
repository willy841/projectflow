import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { buildVendorPackageId } from '@/lib/db/vendor-package-adapter';

function parsePackageId(id: string) {
  const prefix = 'pkg-';
  if (!id.startsWith(prefix)) return null;
  const rest = id.slice(prefix.length);
  if (rest.length !== 73) return null;
  const projectId = rest.slice(0, 36);
  const separator = rest.slice(36, 37);
  const vendorId = rest.slice(37);
  if (separator !== '-') return null;
  return { projectId, vendorId };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsed = parsePackageId(id);
    if (!parsed) {
      return NextResponse.json({ ok: false, error: '無效的 vendor package id' }, { status: 400 });
    }

    const body = (await request.json()) as {
      note?: string;
      documentStatus?: '未生成' | '已生成' | '需更新';
      items?: Array<{
        id?: string;
        assignmentId?: string;
        itemName?: string;
        requirementText?: string;
      }>;
    };

    const db = createPhase1DbClient();
    const documentId = buildVendorPackageId(parsed.projectId, parsed.vendorId);

    await db.query(
      `insert into public.vendor_package_documents (id, project_id, vendor_id, note, document_status, generated_at, updated_at)
       values ($1, $2, $3, $4, $5, case when $5 = '已生成' then now() else null end, now())
       on conflict (id) do update
       set note = excluded.note,
           document_status = excluded.document_status,
           generated_at = case when excluded.document_status = '已生成' then coalesce(public.vendor_package_documents.generated_at, now()) else public.vendor_package_documents.generated_at end,
           updated_at = now()`,
      [documentId, parsed.projectId, parsed.vendorId, body.note?.trim() ?? '', body.documentStatus ?? '未生成'],
    );

    if (Array.isArray(body.items)) {
      await db.query('delete from public.vendor_package_document_items where document_id = $1', [documentId]);
      for (let index = 0; index < body.items.length; index += 1) {
        const item = body.items[index];
        await db.query(
          `insert into public.vendor_package_document_items (document_id, vendor_task_id, sort_order, item_name, requirement_text, updated_at)
           values ($1, $2, $3, $4, $5, now())`,
          [documentId, item.assignmentId ?? null, index, item.itemName?.trim() ?? '', item.requirementText?.trim() ?? ''],
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'unknown vendor package patch error' }, { status: 500 });
  }
}
