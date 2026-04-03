import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostProjectById } from "@/components/quote-cost-data";

export default async function CloseoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getQuoteCostProjectById(id);

  if (!project || project.projectStatus !== "已結案") {
    notFound();
  }

  return <QuoteCostDetailClient project={project} mode="closed" />;
}
