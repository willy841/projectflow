import { notFound } from "next/navigation";
import { performance } from "node:perf_hooks";
import { AppShellAuth } from "@/components/app-shell-auth";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostDetailReadModel } from "@/lib/db/financial-flow-adapter";
import { listDbVendorPackagesByProject } from "@/lib/db/vendor-package-adapter";
import { listDbProjectFlowFormalReadbackRowsByProject } from "@/lib/db/project-flow-formal-readback";

export const dynamic = "force-dynamic";

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const pageStart = performance.now();
  const { id } = await params;
  const readModelStartedAt = performance.now();
  const [readModel, preloadedDbPackages, preloadedFormalRows] = await Promise.all([
    getQuoteCostDetailReadModel(id),
    listDbVendorPackagesByProject(id).catch(() => []),
    listDbProjectFlowFormalReadbackRowsByProject(id).catch(() => []),
  ]);
  const readModelMs = performance.now() - readModelStartedAt;

  if (!readModel || readModel.project.projectStatus !== "執行中") {
    notFound();
  }

  const { project, initialPayload } = readModel;

  console.log('[quote-cost-detail-page]', JSON.stringify({
    projectId: id,
    readModelMs: Number(readModelMs.toFixed(1)),
    vendorPackageCount: preloadedDbPackages.length,
    formalRowCount: preloadedFormalRows.length,
    totalMs: Number((performance.now() - pageStart).toFixed(1)),
  }));

  return (
    <AppShellAuth activePath="/quote-costs">
      <QuoteCostDetailClient project={project} initialProject={initialPayload} preloadedDbPackages={preloadedDbPackages} preloadedFormalRows={preloadedFormalRows} mode="active" />
    </AppShellAuth>
  );
}
