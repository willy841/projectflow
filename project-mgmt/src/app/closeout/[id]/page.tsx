import { redirect } from "next/navigation";

export default async function LegacyCloseoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/closeouts/${id}`);
}
