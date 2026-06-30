import dynamic from "next/dynamic";
import { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";

const DockerComposeGenerator = dynamic(
  () =>
    import("./components/docker-compose-generator").then(
      (m) => m.DockerComposeGenerator
    ),
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
  title: "Docker Compose 模板生成器",
  description: "勾选需要的服务，自动生成带注释的 docker-compose.yml 文件",
};

export default function DockerComposePage() {
  return (
    <div className="flex flex-1 flex-col w-full">
      <DockerComposeGenerator />
    </div>
  );
}
