import { getQuoteCostDetailReadModel } from '@/lib/db/financial-flow-adapter';
import { listDbVendorPackages } from '@/lib/db/vendor-package-adapter';
import { listDbProjectFlowFormalReadbackRowsByProject } from '@/lib/db/project-flow-formal-readback';
import { buildWorkflowCostItemsFromPreloadedSources } from '@/components/workflow-cost-bridge';

export type QuoteCostPreloadParity = {
  projectId: string;
  dbCostItemCount: number;
  preloadCostItemCount: number;
  dbCostTotal: number;
  preloadCostTotal: number;
  dbSourceCounts: Record<string, number>;
  preloadSourceCounts: Record<string, number>;
  dbSourceTotals: Record<string, number>;
  preloadSourceTotals: Record<string, number>;
  mismatchSourceTypes: string[];
  mismatches: Array<{
    sourceType: string;
    dbCount: number;
    preloadCount: number;
    dbTotal: number;
    preloadTotal: number;
  }>;
};

function normalizeSourceType(sourceType: string) {
  if (sourceType === 'design') return '設計';
  if (sourceType === 'procurement') return '備品';
  if (sourceType === 'vendor') return '廠商';
  if (sourceType === 'manual') return '人工';
  return sourceType;
}

function buildSourceCounts(items: Array<{ sourceType: string }>) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = normalizeSourceType(item.sourceType);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function buildSourceTotals(items: Array<{ sourceType: string; adjustedAmount: number }>) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = normalizeSourceType(item.sourceType);
    acc[key] = (acc[key] ?? 0) + item.adjustedAmount;
    return acc;
  }, {});
}

export async function compareQuoteCostPreloadParity(projectId: string): Promise<QuoteCostPreloadParity | null> {
  const [readModel, allDbVendorPackages, formalRows] = await Promise.all([
    getQuoteCostDetailReadModel(projectId),
    listDbVendorPackages().catch(() => []),
    listDbProjectFlowFormalReadbackRowsByProject(projectId).catch(() => []),
  ]);

  if (!readModel) return null;

  const preloadedDbPackages = allDbVendorPackages.filter((pkg) => pkg.projectId === projectId);
  const preloadItems = buildWorkflowCostItemsFromPreloadedSources({
    projectId,
    vendorPackages: preloadedDbPackages,
    formalRows,
  })
    .filter((item) => item.includedInCost)
    .map((item) => ({
      ...item,
      adjustedAmount: Number(item.adjustedAmount ?? 0),
    }));

  const dbItems = readModel.project.costItems
    .filter((item) => item.includedInCost)
    .map((item) => ({
      ...item,
      adjustedAmount: Number(item.adjustedAmount ?? 0),
    }));

  const dbSourceCounts = buildSourceCounts(dbItems);
  const preloadSourceCounts = buildSourceCounts(preloadItems);
  const dbSourceTotals = buildSourceTotals(dbItems);
  const preloadSourceTotals = buildSourceTotals(preloadItems);
  const sourceTypes = new Set([...Object.keys(dbSourceCounts), ...Object.keys(preloadSourceCounts)]);

  const mismatches = Array.from(sourceTypes)
    .map((sourceType) => ({
      sourceType,
      dbCount: dbSourceCounts[sourceType] ?? 0,
      preloadCount: preloadSourceCounts[sourceType] ?? 0,
      dbTotal: dbSourceTotals[sourceType] ?? 0,
      preloadTotal: preloadSourceTotals[sourceType] ?? 0,
    }))
    .filter((row) => row.dbCount !== row.preloadCount || row.dbTotal !== row.preloadTotal);

  return {
    projectId,
    dbCostItemCount: dbItems.length,
    preloadCostItemCount: preloadItems.length,
    dbCostTotal: dbItems.reduce((sum, item) => sum + item.adjustedAmount, 0),
    preloadCostTotal: preloadItems.reduce((sum, item) => sum + item.adjustedAmount, 0),
    dbSourceCounts,
    preloadSourceCounts,
    dbSourceTotals,
    preloadSourceTotals,
    mismatchSourceTypes: mismatches.map((row) => row.sourceType),
    mismatches,
  };
}
