import { Suspense } from "react";
import Loading from "./loading";
import { PromptTemplatesWrapper } from "./components/prompt-templates-wrapper";

export const revalidate = 3600;

export default function PromptTemplatesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PromptTemplatesWrapper />
    </Suspense>
  );
}
