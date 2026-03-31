import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VendorAssignmentDetail } from "@/components/vendor-assignment-detail";
import { getVendorAssignmentById } from "@/components/vendor-data";

export default async function VendorAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = getVendorAssignmentById(id);

  if (!assignment) {
    notFound();
  }

  return (
    <AppShell activePath="/projects">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/projects/${assignment.projectId}`} className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
          ← 返回專案詳細頁
        </Link>
      </div>
      <VendorAssignmentDetail assignment={assignment} />
    </AppShell>
  );
}
