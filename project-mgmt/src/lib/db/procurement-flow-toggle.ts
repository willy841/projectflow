export function shouldUseDbProcurementFlow(): boolean {
  return process.env.PROJECTFLOW_USE_DB_PROCUREMENT === '1';
}
