import { NextResponse } from 'next/server';
import { getQuoteCostProjectsWithDbFinancials } from '@/lib/db/financial-flow-adapter';
import { compareQuoteCostPreloadParity } from '@/lib/db/quote-cost-preload-parity';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams
      .getAll('id')
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter(Boolean);

    const projectIds = ids.length
      ? ids
      : (await getQuoteCostProjectsWithDbFinancials()).map((project) => project.id);

    const comparisons = await Promise.all(projectIds.map((projectId) => compareQuoteCostPreloadParity(projectId)));
    const results = comparisons.filter((row): row is NonNullable<typeof row> => Boolean(row));
    return NextResponse.json({
      ok: true,
      projectCount: projectIds.length,
      mismatchProjectCount: results.filter((row) => row.mismatches.length > 0).length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown quote cost preload parity list error' },
      { status: 500 },
    );
  }
}
