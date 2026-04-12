import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostProjectById } from "@/components/quote-cost-data";
import { getQuoteCostProjectByIdWithDbFinancials } from "@/lib/db/financial-flow-adapter";
import { createPhase1DbClient } from "@/lib/db/phase1-client";

export const dynamic = "force-dynamic";

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seedProject = getQuoteCostProjectById(id);
  const project = await getQuoteCostProjectByIdWithDbFinancials(id);
  const db = createPhase1DbClient();
  const collectionRows = await db.query<{ id: string; collectedOn: string; amount: number; note: string }>(`
    select id, to_char(collected_on, 'YYYY-MM-DD') as "collectedOn", amount::float8 as amount, coalesce(note, '') as note
    from project_collection_records
    where project_id = $1
    order by collected_on desc, created_at desc
  `, [id]);

  if (!project || project.projectStatus !== "執行中") {
    notFound();
  }

  return <QuoteCostDetailClient project={project} initialProject={{ ...project, collectionRecords: collectionRows.rows }} mode="active" />;
}
