import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostProjectByIdWithDbFinancials } from "@/lib/db/financial-flow-adapter";

export default async function CloseoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getQuoteCostProjectByIdWithDbFinancials(id);

  if (!project || project.projectStatus !== "已結案") {
    notFound();
  }

  return <QuoteCostDetailClient project={project} initialProject={project} mode="closed" />;
}
