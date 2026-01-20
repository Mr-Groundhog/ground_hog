import { TechSpinner } from "@/components/common/loading";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-black/20 backdrop-blur-sm">
      <TechSpinner />
    </div>
  );
}
