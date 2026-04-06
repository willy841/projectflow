import { QuoteCostListClient } from "@/components/quote-cost-list-client";
import { getQuoteCostProjectsWithDbFinancials } from "@/lib/db/financial-flow-adapter";

export default async function QuoteCostsPage() {
  const projects = await getQuoteCostProjectsWithDbFinancials();
  return <QuoteCostListClient mode="active" initialProjects={projects} />;
}
