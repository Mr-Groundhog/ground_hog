import dynamic from "next/dynamic";
import { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

const MusicPlayer = dynamic(
  () => import("@/components/tools/music-player").then((m) => m.MusicPlayer),
  {
    loading: () => (
      <div className="flex flex-1 flex-col w-full p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "本地音乐台",
  description: "本地音乐播放器，支持播放本地音频文件",
};

export default function MusicPage() {
  return <MusicPlayer />;
}
