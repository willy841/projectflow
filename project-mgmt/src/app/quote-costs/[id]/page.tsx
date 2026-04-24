import { notFound } from "next/navigation";
import { QuoteCostDetailClient } from "@/components/quote-cost-detail-client";
import { getQuoteCostProjectByIdWithDbFinancials } from "@/lib/db/financial-flow-adapter";
import { createPhase1DbClient } from "@/lib/db/phase1-client";

export const dynamic = "force-dynamic";

export default async function QuoteCostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const vendorGroupMap = new Map<string, { reconciledCount: number; unreconciledCount: number; payableAmount: number }>();
  for (const group of project.reconciliationGroups) {
    const current = vendorGroupMap.get(group.vendorName) ?? { reconciledCount: 0, unreconciledCount: 0, payableAmount: 0 };
    if (group.reconciliationStatus === '已對帳') {
      current.reconciledCount += 1;
      current.payableAmount += group.amountTotal;
    } else {
      current.unreconciledCount += 1;
    }
    vendorGroupMap.set(group.vendorName, current);
  }
  const vendorPaymentRows = Array.from(vendorGroupMap.entries()).map(([vendorName, summary]) => ({
    vendorName,
    reconciledCount: summary.reconciledCount,
    unreconciledCount: summary.unreconciledCount,
    payableAmount: summary.payableAmount,
  }));

  return <QuoteCostDetailClient project={project} initialProject={{ ...project, collectionRecords: collectionRows.rows, vendorPaymentRecords: vendorPaymentRows }} mode="active" />;
}
