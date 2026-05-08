import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostDetailReadModel } from "@/lib/db/financial-flow-adapter";
import { listDbVendorPackages } from "@/lib/db/vendor-package-adapter";
import { listDbProjectFlowFormalReadbackRowsByProject } from "@/lib/db/project-flow-formal-readback";

export const dynamic = "force-dynamic";

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [readModel, allDbVendorPackages, preloadedFormalRows] = await Promise.all([
    getQuoteCostDetailReadModel(id),
    listDbVendorPackages().catch(() => []),
    listDbProjectFlowFormalReadbackRowsByProject(id).catch(() => []),
  ]);

  if (!readModel || readModel.project.projectStatus !== "執行中") {
    notFound();
  }

  const { project, initialPayload } = readModel;
  const preloadedDbPackages = allDbVendorPackages.filter((pkg) => pkg.projectId === id);

  return <QuoteCostDetailClient project={project} initialProject={initialPayload} preloadedDbPackages={preloadedDbPackages} preloadedFormalRows={preloadedFormalRows} mode="active" />;
}
