import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostDetailReadModel } from "@/lib/db/financial-flow-adapter";
import { listDbVendorPackages } from "@/lib/db/vendor-package-adapter";

export const dynamic = "force-dynamic";

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [readModel, allDbVendorPackages] = await Promise.all([
    getQuoteCostDetailReadModel(id),
    listDbVendorPackages().catch(() => []),
  ]);

  if (!readModel || readModel.project.projectStatus !== "執行中") {
    notFound();
  }

  const { project, initialPayload } = readModel;
  const preloadedDbPackages = allDbVendorPackages.filter((pkg) => pkg.projectId === id);

  return <QuoteCostDetailClient project={project} initialProject={initialPayload} preloadedDbPackages={preloadedDbPackages} mode="active" />;
}
