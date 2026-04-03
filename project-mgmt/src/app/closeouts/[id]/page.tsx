import { redirect } from "next/navigation";

export default async function CloseoutsAliasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/closeout/${id}`);
}
