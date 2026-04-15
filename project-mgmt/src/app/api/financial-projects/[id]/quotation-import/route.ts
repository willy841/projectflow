import { NextResponse } from 'next/server';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { parseQuotationWorkbook } from '@/lib/quotation-import';

type ProjectExistsRow = { exists: boolean };
type ImportInsertRow = { id: string };

type QueryError = {
  code?: string;
  message?: string;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: '請選擇 Excel 檔案。' }, { status: 400 });
  }

  try {
    const db = createPhase1DbClient();
    const projectRows = await db.query<ProjectExistsRow>(
      `select exists(select 1 from projects where id = $1) as exists`,
      [projectId],
    );

    if (!projectRows.rows[0]?.exists) {
      return NextResponse.json({ ok: false, error: '找不到專案。' }, { status: 404 });
    }

    const parsed = parseQuotationWorkbook(await file.arrayBuffer(), file.name);
    const importedAt = new Date().toISOString();

    await db.query(
      `update financial_quotation_imports set is_active = false where project_id = $1 and is_active = true`,
      [projectId],
    );

    const insertedImport = await db.query<ImportInsertRow>(
      `
        insert into financial_quotation_imports (
          project_id,
          file_name,
          imported_at,
          note,
          is_active,
          total_amount
        )
        values ($1, $2, now(), $3, true, $4)
        returning id
      `,
      [projectId, parsed.fileName, 'Excel 匯入正式版本', parsed.totalAmount],
    );

    const quotationImportId = insertedImport.rows[0]?.id;
    if (!quotationImportId) {
      throw new Error('quotation-import-create-failed');
    }

    for (const item of parsed.items) {
      await db.query(
        `
          insert into financial_quotation_line_items (
            quotation_import_id,
            sort_order,
            category,
            item_name,
            description,
            quantity,
            unit,
            unit_price,
            line_amount,
            remark
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          quotationImportId,
          item.sortOrder,
          null,
          item.itemName,
          item.remark,
          item.quantity,
          item.unit,
          item.unitPrice,
          item.amount,
          item.remark,
        ],
      );
    }

    return NextResponse.json({
      ok: true,
      importedAt,
      fileName: parsed.fileName,
      totalAmount: parsed.totalAmount,
      itemCount: parsed.items.length,
    });
  } catch (error) {
    const queryError = error as QueryError;
    return NextResponse.json(
      { ok: false, error: queryError.message ?? 'Excel 匯入失敗。' },
      { status: queryError.code === '23505' ? 409 : 500 },
    );
  }
}
