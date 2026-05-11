import dynamic from "next/dynamic";
import { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

const LinuxStudy = dynamic(
  () => import("@/components/tools/linux-study").then((m) => m.LinuxStudy),
  {
    loading: () => (
      <div className="flex flex-1 flex-col w-full p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Linux 命令学习助手",
  description: "Linux 命令速查工具，支持模糊搜索、命令示例、一键复制",
};

export default function LinuxStudyPage() {
  return <LinuxStudy />;
}
