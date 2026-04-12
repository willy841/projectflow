import { CloseoutListClient } from "@/components/closeout-list-client";
import { getCloseoutArchiveProjects } from "@/lib/db/closeout-archive-source";

export const dynamic = "force-dynamic";

export default async function CloseoutPage() {
  const projects = await getCloseoutArchiveProjects();
  return <CloseoutListClient initialProjects={projects} />;
}
