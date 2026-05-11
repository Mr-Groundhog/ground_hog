import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const QRCodeGenerator = dynamic(
  () =>
    import("@/components/tools/qrcode-generator").then(
      (m) => m.QRCodeGenerator
    ),
  {
    loading: () => (
      <div className="flex flex-1 flex-col w-full p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  }
);

export default function QRCodePage() {
  return (
    <div className="flex flex-1 flex-col w-full">
      <QRCodeGenerator />
    </div>
  );
}
