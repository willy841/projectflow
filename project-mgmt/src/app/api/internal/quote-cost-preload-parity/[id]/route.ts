import { NextResponse } from 'next/server';
import { compareQuoteCostPreloadParity } from '@/lib/db/quote-cost-preload-parity';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await compareQuoteCostPreloadParity(id);
    if (!result) {
      return NextResponse.json({ ok: false, error: 'quote cost project not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown quote cost preload parity error' },
      { status: 500 },
    );
  }
}
