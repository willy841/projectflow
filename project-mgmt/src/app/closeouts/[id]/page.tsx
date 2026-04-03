import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";

export default async function CloseoutsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <QuoteCostDetailClient projectId={id} mode="closed" />;
}
