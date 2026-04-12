import { CloseoutListClient } from "@/components/closeout-list-client";
import { getCloseoutListReadModel } from "@/lib/db/closeout-list-read-model";

export const dynamic = "force-dynamic";

export default async function CloseoutPage() {
  const projects = await getCloseoutListReadModel();
  return <CloseoutListClient initialProjects={projects} />;
}
