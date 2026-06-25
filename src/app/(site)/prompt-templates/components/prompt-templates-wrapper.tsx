import { cache } from 'react';
import { getPublicPromptTemplates, getHotPromptTemplates } from "@/app/(site)/prompt-templates/actions";
import { PromptTemplatesClient } from "../client";

const getCachedTemplates = cache(async () => {
  return await getPublicPromptTemplates();
});

const getCachedHotTemplates = cache(async () => {
  return await getHotPromptTemplates(10);
});

export async function PromptTemplatesWrapper() {
  const [templates, hotTemplates] = await Promise.all([
    getCachedTemplates(),
    getCachedHotTemplates(),
  ]);
  return <PromptTemplatesClient initialTemplates={templates} hotTemplates={hotTemplates} />;
}
