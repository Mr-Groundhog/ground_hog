import { Metadata } from "next";
import { LinuxStudy } from "@/components/tools/linux-study";

export const metadata: Metadata = {
  title: "Linux 命令学习助手",
  description: "Linux 命令速查工具，支持模糊搜索、命令示例、一键复制",
};

export default function LinuxStudyPage() {
  return <LinuxStudy />;
}
