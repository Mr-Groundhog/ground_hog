import { notFound } from "next/navigation";
import { getPublicPromptTemplateById } from "../actions";
import { PromptDetailPageClient } from "../components/prompt-detail-page";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PromptTemplateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const template = await getPublicPromptTemplateById(id);

  if (!template) {
    notFound();
  }

  return <PromptDetailPageClient template={template} />;
}
