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

  const paymentRows = await db.query<{ vendorName: string; paidAmount: number }>(`
    select vendor_name as "vendorName", sum(amount)::float8 as "paidAmount"
    from project_vendor_payment_records
    where project_id = $1
    group by vendor_name
    order by vendor_name asc
  `, [id]);
  const paidMap = new Map(paymentRows.rows.map((row) => [row.vendorName, row.paidAmount]));
  const payableMap = new Map<string, number>();
  for (const group of project.reconciliationGroups.filter((group) => group.reconciliationStatus === '已對帳')) {
    payableMap.set(group.vendorName, (payableMap.get(group.vendorName) ?? 0) + group.amountTotal);
  }
  const vendorPaymentRows = Array.from(payableMap.entries()).map(([vendorName, payableAmount]) => ({
    vendorName,
    payableAmount,
    paidAmount: paidMap.get(vendorName) ?? 0,
  }));

  return <QuoteCostDetailClient project={project} initialProject={{ ...project, collectionRecords: collectionRows.rows, vendorPaymentRecords: vendorPaymentRows }} mode="active" />;
}
