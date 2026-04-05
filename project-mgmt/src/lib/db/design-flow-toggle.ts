export function shouldUseDbDesignFlow(): boolean {
  return process.env.PROJECTFLOW_USE_DB_DESIGN === '1';
}
