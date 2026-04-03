import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VendorDetailShell } from "@/components/vendor-detail-shell";
import { getVendorById, getVendorRecordsByVendorId, vendorProfiles } from "@/components/vendor-data";

export function generateStaticParams() {
  return vendorProfiles.map((vendor) => ({ id: vendor.id }));
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = getVendorById(id);

  if (!vendor) {
    notFound();
  }

  return (
    <AppShell activePath="/vendors">
      <VendorDetailShell vendor={vendor} initialRecords={getVendorRecordsByVendorId(vendor.id)} />
    </AppShell>
  );
}
