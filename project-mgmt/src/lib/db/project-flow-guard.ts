import { NextResponse } from 'next/server';
import { getProjectFlowStorageMode } from '@/lib/db/project-flow-toggle';

export function ensureProjectDbWriteEnabled() {
  const storage = getProjectFlowStorageMode();

  if (storage === 'disabled') {
    return {
      ok: false as const,
      storage,
      response: NextResponse.json(
        {
          ok: false,
          storage,
          error: 'Project upstream DB flow is disabled. Enable PROJECTFLOW_USE_DB_PROJECT=1 for formal PostgreSQL, or PROJECTFLOW_USE_PGMEM=1 for local verification fallback.',
        },
        { status: 503 },
      ),
    };
  }

  return {
    ok: true as const,
    storage,
  };
}
