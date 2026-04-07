import { notFound, redirect } from "next/navigation";
import { buildVendorPackageId } from "@/lib/db/vendor-package-adapter";
import { getDbVendorTaskById } from "@/lib/db/vendor-flow-adapter";
import { shouldUseDbVendorFlow } from "@/lib/db/vendor-flow-toggle";
import { isUuidLike } from "@/lib/db/design-flow-toggle";

export default async function VendorTaskDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const useDb = shouldUseDbVendorFlow() && isUuidLike(id);
  const task = useDb ? await getDbVendorTaskById(id) : null;

  if (!task) notFound();

  redirect(`/vendor-packages/${buildVendorPackageId(task.projectId, task.vendorId)}`);
}
