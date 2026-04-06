import { shouldUseDbDesignFlow } from '@/lib/db/design-flow-toggle';
import { shouldUseDbProcurementFlow } from '@/lib/db/procurement-flow-toggle';
import { shouldUseDbVendorFlow } from '@/lib/db/vendor-flow-toggle';

export function shouldUseDbProjectFlow(): boolean {
  return (
    process.env.PROJECTFLOW_USE_DB_PROJECT === '1' ||
    (Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING) &&
      (shouldUseDbDesignFlow() || shouldUseDbProcurementFlow() || shouldUseDbVendorFlow()))
  );
}

export function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
