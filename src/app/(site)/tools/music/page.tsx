import { Metadata } from "next";
import { MusicPlayer } from "@/components/tools/music-player";

export const metadata: Metadata = {
  title: "本地音乐台",
  description: "本地音乐播放器，支持播放本地音频文件",
};

export default function MusicPage() {
  return <MusicPlayer />;
}