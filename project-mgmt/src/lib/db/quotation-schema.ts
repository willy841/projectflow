import { createPhase1DbClient } from '@/lib/db/phase1-client';

type ColumnExistsRow = { exists: boolean };

export async function hasFinancialQuotationImportTotalAmountColumn() {
  const db = createPhase1DbClient();
  const rows = await db.query<ColumnExistsRow>(`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'financial_quotation_imports'
        and column_name = 'total_amount'
    ) as exists
  `);

  return rows.rows[0]?.exists ?? false;
}
