import {
  type QuoteImportRecord,
  type QuoteLineItem,
} from '@/components/quote-cost-data';
import { quoteCostProjectFixtures } from '@/components/quote-cost-fixtures';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export type QuotationReadModelStatus = 'db-read-model' | 'missing-schema-seed-fallback' | 'query-failed-seed-fallback';

export type QuotationReadModel = {
  quotationImported: boolean;
  quotationImport: QuoteImportRecord | null;
  quotationItems: QuoteLineItem[];
  status: QuotationReadModelStatus;
};

const EMPTY_QUOTATION_READ_MODEL: QuotationReadModel = {
  quotationImported: false,
  quotationImport: null,
  quotationItems: [],
  status: 'query-failed-seed-fallback',
};

function buildSeedProjection(projectId: string, status: QuotationReadModelStatus): QuotationReadModel {
  const fixtureProject = quoteCostProjectFixtures.find((project) => project.id === projectId);

  return {
    quotationImported: fixtureProject?.quotationImported ?? EMPTY_QUOTATION_READ_MODEL.quotationImported,
    quotationImport: fixtureProject?.quotationImport ?? EMPTY_QUOTATION_READ_MODEL.quotationImport,
    quotationItems: fixtureProject?.quotationItems ?? EMPTY_QUOTATION_READ_MODEL.quotationItems,
    status,
  };
}

type QuotationSchemaExistsRow = {
  importsExists: boolean;
  itemsExists: boolean;
};

type QuotationImportRow = {
  projectId: string;
  quotationImportId: string;
  importedAt: string;
  fileName: string;
  note: string | null;
};

type QuotationLineItemRow = {
  projectId: string;
  itemId: string;
  category: string | null;
  itemName: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  unitPrice: number;
  sortOrder: number;
};

async function hasQuotationReadModelSchema() {
  const db = createPhase1DbClient();
  const rows = await db.query<QuotationSchemaExistsRow>(`
    select
      to_regclass('public.financial_quotation_imports') is not null as "importsExists",
      to_regclass('public.financial_quotation_line_items') is not null as "itemsExists"
  `);

  const row = rows.rows[0];
  return Boolean(row?.importsExists && row?.itemsExists);
}

async function loadQuotationImports(projectIds: string[]) {
  const db = createPhase1DbClient();
  const rows = await db.query<QuotationImportRow>(`
    with ranked_imports as (
      select
        fqi.project_id as "projectId",
        fqi.id as "quotationImportId",
        to_char(fqi.imported_at, 'YYYY-MM-DD HH24:MI') as "importedAt",
        fqi.file_name as "fileName",
        fqi.note,
        row_number() over (
          partition by fqi.project_id
          order by fqi.is_active desc, fqi.imported_at desc, fqi.created_at desc, fqi.id desc
        ) as row_no
      from financial_quotation_imports fqi
      where fqi.project_id = any($1::uuid[])
    )
    select
      "projectId",
      "quotationImportId",
      "importedAt",
      "fileName",
      note,
      row_no
    from ranked_imports
    where row_no = 1
  `, [projectIds]);

  return rows.rows;
}

async function loadQuotationLineItems(importIds: string[]) {
  if (!importIds.length) return [] as QuotationLineItemRow[];

  const db = createPhase1DbClient();
  const rows = await db.query<QuotationLineItemRow>(`
    select
      fqi.project_id as "projectId",
      fqli.id as "itemId",
      fqli.category,
      fqli.item_name as "itemName",
      fqli.description,
      coalesce(fqli.quantity, 0)::float8 as quantity,
      fqli.unit,
      coalesce(fqli.unit_price, 0)::float8 as "unitPrice",
      fqli.sort_order as "sortOrder"
    from financial_quotation_line_items fqli
    inner join financial_quotation_imports fqi on fqi.id = fqli.quotation_import_id
    where fqli.quotation_import_id = any($1::uuid[])
    order by fqi.project_id asc, fqli.sort_order asc, fqli.created_at asc, fqli.id asc
  `, [importIds]);

  return rows.rows;
}

export async function loadQuotationReadModelIndex(projectIds: string[]): Promise<Map<string, QuotationReadModel>> {
  const result = new Map<string, QuotationReadModel>();

  if (!projectIds.length) return result;

  let hasSchema = false;
  try {
    hasSchema = await hasQuotationReadModelSchema();
  } catch {
    hasSchema = false;
  }

  if (!hasSchema) {
    for (const projectId of projectIds) {
      result.set(projectId, buildSeedProjection(projectId, 'missing-schema-seed-fallback'));
    }
    return result;
  }

  try {
    const importRows = await loadQuotationImports(projectIds);
    const importByProjectId = new Map(importRows.map((row) => [row.projectId, row]));
    const lineItemRows = await loadQuotationLineItems(importRows.map((row) => row.quotationImportId));
    const lineItemsByProjectId = new Map<string, QuoteLineItem[]>();

    for (const row of lineItemRows) {
      const current = lineItemsByProjectId.get(row.projectId) ?? [];
      current.push({
        id: row.itemId,
        category: row.category ?? '-',
        itemName: row.itemName,
        description: row.description ?? '',
        quantity: row.quantity,
        unit: row.unit ?? '式',
        unitPrice: row.unitPrice,
      });
      lineItemsByProjectId.set(row.projectId, current);
    }

    for (const projectId of projectIds) {
      const importRow = importByProjectId.get(projectId);
      result.set(projectId, {
        quotationImported: Boolean(importRow),
        quotationImport: importRow
          ? {
              importedAt: importRow.importedAt,
              fileName: importRow.fileName,
              note: importRow.note ?? '',
            }
          : null,
        quotationItems: lineItemsByProjectId.get(projectId) ?? [],
        status: 'db-read-model',
      });
    }

    return result;
  } catch {
    for (const projectId of projectIds) {
      result.set(projectId, buildSeedProjection(projectId, 'query-failed-seed-fallback'));
    }
    return result;
  }
}
