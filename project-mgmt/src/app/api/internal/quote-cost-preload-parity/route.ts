import { NextResponse } from 'next/server';
import { getQuoteCostProjectsWithDbFinancials } from '@/lib/db/financial-flow-adapter';
import { compareQuoteCostPreloadParity } from '@/lib/db/quote-cost-preload-parity';

export async function GET() {
  try {
    const projects = await getQuoteCostProjectsWithDbFinancials();
    const comparisons = await Promise.all(projects.map((project) => compareQuoteCostPreloadParity(project.id)));
    return NextResponse.json({
      ok: true,
      projectCount: projects.length,
      results: comparisons.filter(Boolean),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown quote cost preload parity list error' },
      { status: 500 },
    );
  }
}
