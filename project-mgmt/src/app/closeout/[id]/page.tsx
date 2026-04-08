import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostProjectById } from "@/components/quote-cost-data";
import { getQuoteCostProjectByIdWithDbFinancials } from "@/lib/db/financial-flow-adapter";

export default async function CloseoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seedProject = getQuoteCostProjectById(id);
  const project = await getQuoteCostProjectByIdWithDbFinancials(id);
  const resolvedProject = project && project.projectStatus === "已結案" ? project : seedProject;

  if (!resolvedProject || resolvedProject.projectStatus !== "已結案") {
    notFound();
  }

  return <QuoteCostDetailClient project={seedProject ?? resolvedProject} initialProject={resolvedProject} mode="closed" />;
}
