import { notFound } from "next/navigation";
import { CloseoutDetailClient } from "@/components/closeout-detail-client";
import { getCloseoutArchiveDetailReadModel } from "@/lib/db/closeout-detail-read-model";

export const dynamic = "force-dynamic";

export default async function CloseoutsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const readModel = await getCloseoutArchiveDetailReadModel(id);

  if (!readModel) {
    notFound();
  }

  return <CloseoutDetailClient readModel={readModel} />;
}
