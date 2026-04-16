import { NextResponse } from 'next/server';
import { deleteDbVendorTrade } from '@/lib/db/vendor-directory-adapter';
import { ensureProjectDbWriteEnabled } from '@/lib/db/project-flow-guard';
import { requireAdminApi } from '@/lib/api-auth';

export async function DELETE(_request: Request, context: { params: Promise<{ name: string }> }) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  try {
    const access = ensureProjectDbWriteEnabled();
    if (!access.ok) {
      return access.response;
    }

    const { name } = await context.params;
    const trade = await deleteDbVendorTrade(decodeURIComponent(name));
    return NextResponse.json({ ok: true, trade, storage: access.storage });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown vendor trade delete error' }, { status: 500 });
  }
}
