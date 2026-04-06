import { CloseoutListClient } from "@/components/closeout-list-client";
import { getQuoteCostProjectsWithDbFinancials } from "@/lib/db/financial-flow-adapter";

export const dynamic = "force-dynamic";

export default async function CloseoutPage() {
  const projects = await getQuoteCostProjectsWithDbFinancials();
  return <CloseoutListClient initialProjects={projects} />;
}
