import { AppShellAuth } from "@/components/app-shell-auth";
import { CloseoutListClient } from "@/components/closeout-list-client";
import { getCloseoutListReadModel } from "@/lib/db/closeout-list-read-model";

export const dynamic = "force-dynamic";

export default async function CloseoutsPage() {
  const projects = await getCloseoutListReadModel();
  return (
    <AppShellAuth activePath="/closeouts">
      <CloseoutListClient initialProjects={projects} />
    </AppShellAuth>
  );
}
