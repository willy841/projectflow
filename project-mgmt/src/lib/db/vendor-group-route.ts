export function buildVendorGroupRouteId(projectId: string, vendorId: string) {
  return `${projectId}~${vendorId}`;
}

export function parseVendorGroupRouteId(routeId: string) {
  const [projectId, vendorId, ...rest] = routeId.split('~');
  if (!projectId || !vendorId || rest.length > 0) return null;
  return { projectId, vendorId };
}
