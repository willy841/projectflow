import { redirect } from "next/navigation";

export default async function CloseoutAliasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/closeouts/${id}`);
}
