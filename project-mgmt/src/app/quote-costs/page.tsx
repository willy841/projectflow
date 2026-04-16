import { AppShellAuth } from "@/components/app-shell-auth";
import { QuoteCostListClient } from "@/components/quote-cost-list-client";
import { getQuoteCostProjectsWithDbFinancials } from "@/lib/db/financial-flow-adapter";

export const dynamic = "force-dynamic";

export default async function QuoteCostsPage() {
  const projects = await getQuoteCostProjectsWithDbFinancials();

  return (
    <AppShellAuth activePath="/quote-costs">
      <QuoteCostListClient mode="active" initialProjects={projects} />
    </AppShellAuth>
  );
}
