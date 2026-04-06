export function shouldUseDbVendorFlow(): boolean {
  return process.env.PROJECTFLOW_USE_DB_VENDOR === '1';
}
