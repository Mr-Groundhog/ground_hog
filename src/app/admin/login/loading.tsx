import { TechSpinner } from "@/components/common/loading";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <TechSpinner />
    </div>
  );
}
