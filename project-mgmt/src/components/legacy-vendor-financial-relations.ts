export const legacyVendorFinancialRelationsBoundary = {
  mode: "retired-legacy-helper",
  formalRouteConsumer: "none",
  externalConsumerStatus: "none-detected",
  helperStatus: "retired-no-runtime-consumer",
  activeAssembleStatus: "removed",
  fallbackCollapseReadiness: "complete-for-this-helper",
  exitCondition: "none",
  upstreamBlocker: "none",
} as const;

export function assembleLegacyVendorFinancialRelations() {
  return [];
}
