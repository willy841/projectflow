import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProjectDetailShell } from "@/components/project-detail-shell";
import { getProjectById } from "@/components/project-data";
import { projects } from "@/components/project-data";

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <AppShell activePath="/projects">
      <ProjectDetailShell project={project} />
    </AppShell>
  );
}
