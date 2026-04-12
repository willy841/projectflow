import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getCloseoutArchiveProjectById } from "@/lib/db/closeout-archive-source";

export default async function CloseoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getCloseoutArchiveProjectById(id);

  if (!project) {
    notFound();
  }

  return <QuoteCostDetailClient project={project} initialProject={project} mode="closed" />;
}
