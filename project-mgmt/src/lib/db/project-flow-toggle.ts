import { shouldUseDbDesignFlow } from '@/lib/db/design-flow-toggle';
import { shouldUseDbProcurementFlow } from '@/lib/db/procurement-flow-toggle';
import { shouldUseDbVendorFlow } from '@/lib/db/vendor-flow-toggle';

export type ProjectFlowStorageMode = 'postgres' | 'pg-mem' | 'disabled';

function hasDatabaseUrl(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING,
  );
}

export function shouldUseDbProjectFlow(): boolean {
  return (
    process.env.PROJECTFLOW_USE_DB_PROJECT === '1' ||
    (hasDatabaseUrl() &&
      (shouldUseDbDesignFlow() || shouldUseDbProcurementFlow() || shouldUseDbVendorFlow()))
  );
}

export function getProjectFlowStorageMode(): ProjectFlowStorageMode {
  if (!shouldUseDbProjectFlow()) {
    return 'disabled';
  }

  return process.env.PROJECTFLOW_USE_PGMEM === '1' ? 'pg-mem' : 'postgres';
}

export function isFormalProjectDbMode(): boolean {
  return getProjectFlowStorageMode() === 'postgres';
}

export function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
