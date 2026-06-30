import dynamic from "next/dynamic";
import { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

const InfographicCard = dynamic(
  () =>
    import("@/components/tools/infographic-card").then(
      (m) => m.InfographicCard
    ),
  {
    loading: () => (
      <div className="flex flex-1 flex-col w-full p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-4 flex-1">
          <Skeleton className="h-full flex-1" />
          <Skeleton className="h-full flex-1" />
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "一图胜千言 - 信息图表卡片机",
  description:
    "输入文字和数据，一键生成精美信息图表卡片，内置 7 种风格模板（瑞士杂志、复古终端、编辑报告、街头海报、蒸汽波、报纸拼贴、工程蓝图），拯救不会设计的程序员。",
};

export default function InfographicPage() {
  return (
    <div className="flex flex-1 flex-col w-full">
      <InfographicCard />
    </div>
  );
}
