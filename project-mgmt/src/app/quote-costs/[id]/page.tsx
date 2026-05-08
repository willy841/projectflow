import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostDetailReadModel } from "@/lib/db/financial-flow-adapter";

export const dynamic = "force-dynamic";

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const readModel = await getQuoteCostDetailReadModel(id);

  if (!readModel || readModel.project.projectStatus !== "執行中") {
    notFound();
  }

  const { project, initialPayload } = readModel;

  return <QuoteCostDetailClient project={project} initialProject={initialPayload} mode="active" />;
}
