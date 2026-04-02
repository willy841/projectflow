import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostProjectById } from "@/components/quote-cost-data";

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getQuoteCostProjectById(id);

  if (!project) {
    notFound();
  }

  return <QuoteCostDetailClient project={project} />;
}
