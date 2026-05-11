import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Base64Converter = dynamic(
  () =>
    import("@/components/tools/base64-converter").then(
      (m) => m.Base64Converter
    ),
  {
    loading: () => (
      <div className="flex flex-1 flex-col w-full p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    ),
  }
);

export default function Base64Page() {
  return (
    <div className="flex flex-1 flex-col w-full">
      <Base64Converter />
    </div>
  );
}
