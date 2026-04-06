import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostProjectById } from "@/components/quote-cost-data";
import { getQuoteCostProjectByIdWithDbFinancials } from "@/lib/db/financial-flow-adapter";

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seedProject = getQuoteCostProjectById(id);
  const project = await getQuoteCostProjectByIdWithDbFinancials(id);

  if (!project || project.projectStatus !== "執行中") {
    notFound();
  }

  return <QuoteCostDetailClient project={seedProject ?? project} initialProject={project} mode="active" />;
}
