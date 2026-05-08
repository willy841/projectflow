import { NextResponse } from 'next/server';
import { listDbVendorFinancialRelations, vendorFinancialRelationDbBoundary } from '@/lib/db/vendor-financial-relation-adapter';

export async function GET() {
  try {
    const relations = await listDbVendorFinancialRelations();
    return NextResponse.json({
      ok: true,
      boundary: vendorFinancialRelationDbBoundary,
      count: relations.length,
      relations,
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
