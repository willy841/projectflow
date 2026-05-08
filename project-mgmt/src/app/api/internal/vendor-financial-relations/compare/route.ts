import { NextResponse } from 'next/server';
import { listDbVendorFinancialRelations, vendorFinancialRelationDbBoundary } from '@/lib/db/vendor-financial-relation-adapter';

const vendorFinancialCompareBoundary = {
  mode: 'retirement-debug-route',
  primarySource: 'db-relation-read-model',
  legacyBaseline: 'retired',
  defaultMode: 'db-only',
} as const;

export async function GET() {
  try {
    const dbRelations = await listDbVendorFinancialRelations();

    return NextResponse.json({
      ok: true,
      compareBoundary: vendorFinancialCompareBoundary,
      dbBoundary: vendorFinancialRelationDbBoundary,
      includeLegacyBaseline: false,
      dbCount: dbRelations.length,
      relations: dbRelations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
