import { QuoteCostListClient } from "@/components/quote-cost-list-client";
import { getQuoteCostProjectsWithDbFinancials } from "@/lib/db/financial-flow-adapter";

export const dynamic = "force-dynamic";

const TRACE_PROJECT_ID = '11111111-1111-4111-8111-111111111111';

export default async function QuoteCostsPage() {
  const projects = await getQuoteCostProjectsWithDbFinancials();
  const tracedProject = projects.find((project) => project.id === TRACE_PROJECT_ID);

  console.info('[quote-costs][trace] page-server-props', {
    traceProjectId: TRACE_PROJECT_ID,
    projectCount: projects.length,
    present: Boolean(tracedProject),
    projectStatus: tracedProject?.projectStatus ?? null,
    costItemsCount: tracedProject?.costItems.length ?? 0,
  });

  return <QuoteCostListClient mode="active" initialProjects={projects} />;
}
