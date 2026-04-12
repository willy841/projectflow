import {
  type QuoteCostProject,
  type QuoteImportRecord,
  type QuoteLineItem,
  quoteCostProjects,
} from '@/components/quote-cost-data';
import { createPhase1DbClient } from '@/lib/db/phase1-client';

export type QuotationReadModelStatus = 'db-read-model' | 'missing-schema-seed-fallback' | 'seed-only-fallback';

export type QuotationReadModel = {
  quotationImported: boolean;
  quotationImport: QuoteImportRecord | null;
  quotationItems: QuoteLineItem[];
  reconciliationStatus: QuoteCostProject['reconciliationStatus'];
  closeStatus: QuoteCostProject['closeStatus'];
  status: QuotationReadModelStatus;
};

const EMPTY_QUOTATION_READ_MODEL: QuotationReadModel = {
  quotationImported: false,
  quotationImport: null,
  quotationItems: [],
  reconciliationStatus: '未開始',
  closeStatus: '未結案',
  status: 'seed-only-fallback',
};

function buildSeedProjection(project: QuoteCostProject | undefined, status: QuotationReadModelStatus): QuotationReadModel {
  return {
    quotationImported: project?.quotationImported ?? EMPTY_QUOTATION_READ_MODEL.quotationImported,
    quotationImport: project?.quotationImport ?? EMPTY_QUOTATION_READ_MODEL.quotationImport,
    quotationItems: project?.quotationItems ?? EMPTY_QUOTATION_READ_MODEL.quotationItems,
    reconciliationStatus: project?.reconciliationStatus ?? EMPTY_QUOTATION_READ_MODEL.reconciliationStatus,
    closeStatus: project?.closeStatus ?? EMPTY_QUOTATION_READ_MODEL.closeStatus,
    status,
  };
}

async function hasQuotationReadModelSchema() {
  const db = createPhase1DbClient();
  const rows = await db.query<{ importsExists: boolean; itemsExists: boolean }>(`
    select
      to_regclass('public.financial_quotation_imports') is not null as "importsExists",
      to_regclass('public.financial_quotation_line_items') is not null as "itemsExists"
  `);

  const row = rows.rows[0];
  return Boolean(row?.importsExists && row?.itemsExists);
}

export async function loadQuotationReadModelIndex(projectIds: string[]): Promise<Map<string, QuotationReadModel>> {
  const seedById = new Map(quoteCostProjects.map((project) => [project.id, project]));
  const result = new Map<string, QuotationReadModel>();

  if (!projectIds.length) return result;

  let hasSchema = false;
  try {
    hasSchema = await hasQuotationReadModelSchema();
  } catch {
    hasSchema = false;
  }

  for (const projectId of projectIds) {
    const seedProject = seedById.get(projectId);
    result.set(
      projectId,
      buildSeedProjection(seedProject, hasSchema ? 'seed-only-fallback' : 'missing-schema-seed-fallback'),
    );
  }

  if (hasSchema) {
    // Schema existence is reserved for next round. Current repo has no formal quotation query contract yet,
    // so this round keeps seed projection isolated behind a dedicated read-model boundary instead of mixing it inside
    // the financial adapter.
    return result;
  }

  return result;
}
