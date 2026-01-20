import { TechSpinner } from "@/components/common/loading";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
      <TechSpinner />
    </div>
  );
}
