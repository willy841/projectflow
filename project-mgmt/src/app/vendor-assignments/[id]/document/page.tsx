import { notFound, redirect } from "next/navigation";
import { getDbVendorTaskById } from "@/lib/db/vendor-flow-adapter";
import { shouldUseDbVendorFlow } from "@/lib/db/vendor-flow-toggle";
import { isUuidLike } from "@/lib/db/design-flow-toggle";

function buildPackageId(projectId: string, vendorName: string) {
  return `pkg-${projectId}-${encodeURIComponent(vendorName)}`;
}

export default async function VendorTaskDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useDb = shouldUseDbVendorFlow() && isUuidLike(id);
  const task = useDb ? await getDbVendorTaskById(id) : null;

  if (!task) notFound();

  redirect(`/vendor-packages/${buildPackageId(task.projectId, task.vendorName)}`);
}
