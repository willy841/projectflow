import { CloseoutListClient } from "@/components/closeout-list-client";
import { quoteCostProjects } from "@/components/quote-cost-data";
import { getQuoteCostProjectsWithDbFinancials } from "@/lib/db/financial-flow-adapter";

export const dynamic = "force-dynamic";

export default async function CloseoutPage() {
  const projects = await getQuoteCostProjectsWithDbFinancials();
  const hasClosedProjects = projects.some((project) => project.projectStatus === "已結案");
  const fallbackProjects = hasClosedProjects ? projects : quoteCostProjects;
  return <CloseoutListClient initialProjects={fallbackProjects} />;
}
