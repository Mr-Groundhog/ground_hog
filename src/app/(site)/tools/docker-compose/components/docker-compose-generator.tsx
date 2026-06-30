"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Container,
  Copy,
  Download,
  RotateCcw,
  Check,
  Database,
  Server,
  Globe,
  Mail,
  HardDrive,
  Search as SearchIcon,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// ─── 类型定义 ────────────────────────────────────────────────────────────────

interface EnvField {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

interface PortMapping {
  label: string;
  hostPort: string;
  containerPort: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  image: string;
  tag: string;
  ports: PortMapping[];
  envFields: EnvField[];
  envValues: Record<string, string>;
  volumes: string[];
  comment: string;
  expanded: boolean;
}

// ─── 默认服务配置 ─────────────────────────────────────────────────────────────

function getDefaultServices(): ServiceConfig[] {
  return [
    {
      id: "postgres",
      name: "PostgreSQL",
      icon: Database,
      enabled: false,
      image: "postgres",
      tag: "16-alpine",
      ports: [{ label: "数据库端口", hostPort: "5432", containerPort: "5432" }],
      envFields: [
        { key: "POSTGRES_USER", label: "用户名", placeholder: "postgres", required: true },
        { key: "POSTGRES_PASSWORD", label: "密码", placeholder: "your_password", required: true },
        { key: "POSTGRES_DB", label: "数据库名", placeholder: "mydb" },
      ],
      envValues: {
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "your_password",
        POSTGRES_DB: "mydb",
      },
      volumes: ["postgres_data:/var/lib/postgresql/data"],
      comment: "PostgreSQL 关系型数据库，使用 Alpine 轻量镜像",
      expanded: false,
    },
    {
      id: "mysql",
      name: "MySQL",
      icon: Database,
      enabled: false,
      image: "mysql",
      tag: "8.0",
      ports: [{ label: "数据库端口", hostPort: "3306", containerPort: "3306" }],
      envFields: [
        { key: "MYSQL_ROOT_PASSWORD", label: "Root 密码", placeholder: "root_password", required: true },
        { key: "MYSQL_DATABASE", label: "数据库名", placeholder: "mydb" },
      ],
      envValues: {
        MYSQL_ROOT_PASSWORD: "root_password",
        MYSQL_DATABASE: "mydb",
      },
      volumes: ["mysql_data:/var/lib/mysql"],
      comment: "MySQL 关系型数据库",
      expanded: false,
    },
    {
      id: "redis",
      name: "Redis",
      icon: HardDrive,
      enabled: false,
      image: "redis",
      tag: "7-alpine",
      ports: [{ label: "Redis 端口", hostPort: "6379", containerPort: "6379" }],
      envFields: [
        { key: "REDIS_PASSWORD", label: "密码（可选）", placeholder: "" },
      ],
      envValues: { REDIS_PASSWORD: "" },
      volumes: ["redis_data:/data"],
      comment: "Redis 内存缓存数据库，使用 Alpine 轻量镜像",
      expanded: false,
    },
    {
      id: "mongodb",
      name: "MongoDB",
      icon: Database,
      enabled: false,
      image: "mongo",
      tag: "7",
      ports: [{ label: "数据库端口", hostPort: "27017", containerPort: "27017" }],
      envFields: [
        { key: "MONGO_INITDB_ROOT_USERNAME", label: "Root 用户名", placeholder: "admin", required: true },
        { key: "MONGO_INITDB_ROOT_PASSWORD", label: "Root 密码", placeholder: "admin_password", required: true },
      ],
      envValues: {
        MONGO_INITDB_ROOT_USERNAME: "admin",
        MONGO_INITDB_ROOT_PASSWORD: "admin_password",
      },
      volumes: ["mongo_data:/data/db"],
      comment: "MongoDB 文档型 NoSQL 数据库",
      expanded: false,
    },
    {
      id: "nginx",
      name: "Nginx",
      icon: Globe,
      enabled: false,
      image: "nginx",
      tag: "alpine",
      ports: [{ label: "HTTP 端口", hostPort: "80", containerPort: "80" }],
      envFields: [],
      envValues: {},
      volumes: [
        "./nginx/nginx.conf:/etc/nginx/nginx.conf:ro",
        "./nginx/html:/usr/share/nginx/html:ro",
      ],
      comment: "Nginx 高性能反向代理与静态文件服务器",
      expanded: false,
    },
    {
      id: "rabbitmq",
      name: "RabbitMQ",
      icon: MessageSquare,
      enabled: false,
      image: "rabbitmq",
      tag: "3-management-alpine",
      ports: [
        { label: "AMQP 端口", hostPort: "5672", containerPort: "5672" },
        { label: "管理界面端口", hostPort: "15672", containerPort: "15672" },
      ],
      envFields: [
        { key: "RABBITMQ_DEFAULT_USER", label: "用户名", placeholder: "guest", required: true },
        { key: "RABBITMQ_DEFAULT_PASS", label: "密码", placeholder: "guest", required: true },
      ],
      envValues: {
        RABBITMQ_DEFAULT_USER: "guest",
        RABBITMQ_DEFAULT_PASS: "guest",
      },
      volumes: ["rabbitmq_data:/var/lib/rabbitmq"],
      comment: "RabbitMQ 消息队列（含 Web 管理界面）",
      expanded: false,
    },
    {
      id: "elasticsearch",
      name: "Elasticsearch",
      icon: SearchIcon,
      enabled: false,
      image: "elasticsearch",
      tag: "8.12.0",
      ports: [{ label: "HTTP 端口", hostPort: "9200", containerPort: "9200" }],
      envFields: [
        { key: "discovery.type", label: "发现模式", placeholder: "single-node" },
        { key: "ES_JAVA_OPTS", label: "JVM 内存", placeholder: "-Xms512m -Xmx512m" },
      ],
      envValues: {
        "discovery.type": "single-node",
        ES_JAVA_OPTS: "-Xms512m -Xmx512m",
      },
      volumes: ["es_data:/usr/share/elasticsearch/data"],
      comment: "Elasticsearch 全文搜索引擎（单节点模式）",
      expanded: false,
    },
    {
      id: "minio",
      name: "MinIO",
      icon: Server,
      enabled: false,
      image: "minio/minio",
      tag: "latest",
      ports: [
        { label: "API 端口", hostPort: "9000", containerPort: "9000" },
        { label: "控制台端口", hostPort: "9001", containerPort: "9001" },
      ],
      envFields: [
        { key: "MINIO_ROOT_USER", label: "Root 用户名", placeholder: "minioadmin", required: true },
        { key: "MINIO_ROOT_PASSWORD", label: "Root 密码", placeholder: "minioadmin", required: true },
      ],
      envValues: {
        MINIO_ROOT_USER: "minioadmin",
        MINIO_ROOT_PASSWORD: "minioadmin",
      },
      volumes: ["minio_data:/data"],
      comment: "MinIO 高性能对象存储（兼容 S3 API）",
      expanded: false,
    },
  ];
}

// ─── YAML 生成 ────────────────────────────────────────────────────────────────

function generateYaml(services: ServiceConfig[]): string {
  const enabled = services.filter((s) => s.enabled);
  if (enabled.length === 0) return "# 请勾选至少一个服务以生成 compose.yml\n";

  const lines: string[] = [];

  lines.push("# =============================================================");
  lines.push("# Docker Compose 配置文件（自动生成）");
  lines.push("# 生成工具：Docker Compose 模板生成器");
  lines.push("# =============================================================");
  lines.push("");
  lines.push("name: my-app");
  lines.push("");
  lines.push("services:");

  enabled.forEach((svc, idx) => {
    if (idx > 0) lines.push("");
    lines.push(`  # ─── ${svc.name} ─────────────────────────────────────────`);
    lines.push(`  # ${svc.comment}`);
    lines.push(`  ${svc.id}:`);
    lines.push(`    image: ${svc.image}:${svc.tag}`);
    lines.push(`    container_name: ${svc.id}`);
    lines.push(`    restart: unless-stopped`);

    // ports
    lines.push(`    ports:`);
    svc.ports.forEach((p) => {
      lines.push(`      - "${p.hostPort}:${p.containerPort}"`);
    });

    // environment
    const envEntries = Object.entries(svc.envValues).filter(
      ([, v]) => v !== ""
    );
    if (envEntries.length > 0) {
      lines.push(`    environment:`);
      envEntries.forEach(([k, v]) => {
        lines.push(`      ${k}: "${v}"`);
      });
    }

    // volumes
    if (svc.volumes.length > 0) {
      lines.push(`    volumes:`);
      svc.volumes.forEach((v) => {
        lines.push(`      - ${v}`);
      });
    }
  });

  // 顶层 volumes 声明
  const volumeNames = enabled
    .flatMap((s) => s.volumes)
    .map((v) => v.split(":")[0])
    .filter((v) => !v.startsWith("."));

  if (volumeNames.length > 0) {
    lines.push("");
    lines.push("# ─── 持久化数据卷 ────────────────────────────────────────────");
    lines.push("volumes:");
    [...new Set(volumeNames)].forEach((v) => {
      lines.push(`  ${v}:`);
    });
  }

  lines.push("");
  return lines.join("\n");
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export function DockerComposeGenerator() {
  const [services, setServices] = useState<ServiceConfig[]>(getDefaultServices);
  const [copied, setCopied] = useState(false);

  const yaml = useMemo(() => generateYaml(services), [services]);

  // 更新某个服务的配置
  const updateService = useCallback(
    (id: string, patch: Partial<ServiceConfig>) => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
    },
    []
  );

  // 切换服务启用状态
  const toggleService = useCallback((id: string, checked: boolean) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, enabled: checked, expanded: checked } : s
      )
    );
  }, []);

  // 切换展开
  const toggleExpand = useCallback((id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  }, []);

  // 更新环境变量
  const updateEnv = useCallback(
    (serviceId: string, key: string, value: string) => {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? { ...s, envValues: { ...s.envValues, [key]: value } }
            : s
        )
      );
    },
    []
  );

  // 更新端口
  const updatePort = useCallback(
    (serviceId: string, portIdx: number, field: "hostPort" | "containerPort", value: string) => {
      if (!/^\d{0,5}$/.test(value)) return;
      setServices((prev) =>
        prev.map((s) => {
          if (s.id !== serviceId) return s;
          const ports = [...s.ports];
          ports[portIdx] = { ...ports[portIdx], [field]: value };
          return { ...s, ports };
        })
      );
    },
    []
  );

  // 复制
  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(yaml);
      } else {
        const ta = document.createElement("textarea");
        ta.value = yaml;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };

  // 下载
  const handleDownload = () => {
    const blob = new Blob([yaml], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compose.yml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("compose.yml 已下载");
  };

  // 重置
  const handleReset = () => {
    setServices(getDefaultServices());
    toast.info("已重置所有配置");
  };

  const enabledCount = services.filter((s) => s.enabled).length;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 max-w-7xl">
      {/* 标题 */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Container className="h-7 w-7 text-cyan-500" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            Docker Compose 模板生成器
          </h1>
        </div>
        <p className="text-muted-foreground text-center text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
          勾选所需服务、配置参数，实时生成带注释的 compose.yml 文件
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── 左栏：服务选择 + 配置 ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-cyan-500 rounded-full" />
              <span className="font-semibold text-sm">选择服务</span>
              <span className="text-xs text-muted-foreground bg-zinc-800 px-2 py-0.5 rounded-full">
                {enabledCount} / {services.length}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs h-7 gap-1">
              <RotateCcw className="h-3 w-3" />
              重置
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <Card
                  key={svc.id}
                  className={`p-3 cursor-pointer select-none transition-all duration-200 ${
                    svc.enabled
                      ? "border-cyan-500/60 bg-cyan-950/20 shadow-sm"
                      : "border-zinc-800 hover:border-zinc-600"
                  }`}
                  onClick={() => toggleService(svc.id, !svc.enabled)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Checkbox
                      checked={svc.enabled}
                      onCheckedChange={(v) => toggleService(svc.id, !!v)}
                      className="h-4 w-4"
                    />
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        svc.enabled ? "text-cyan-400" : "text-zinc-500"
                      }`}
                    />
                  </div>
                  <div className={`text-xs font-semibold ${svc.enabled ? "text-cyan-300" : "text-zinc-400"}`}>
                    {svc.name}
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-0.5 truncate">{svc.image}:{svc.tag}</div>
                </Card>
              );
            })}
          </div>

          {/* 已勾选服务的配置面板 */}
          {services.filter((s) => s.enabled).length > 0 && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 pl-1">
                <div className="w-1 h-5 bg-cyan-500 rounded-full" />
                <span className="font-semibold text-sm">服务配置</span>
              </div>

              {services
                .filter((s) => s.enabled)
                .map((svc) => (
                  <ServiceConfigPanel
                    key={svc.id}
                    service={svc}
                    onToggleExpand={() => toggleExpand(svc.id)}
                    onEnvChange={(key, val) => updateEnv(svc.id, key, val)}
                    onPortChange={(idx, field, val) => updatePort(svc.id, idx, field, val)}
                  />
                ))}
            </div>
          )}
        </div>

        {/* ── 右栏：YAML 预览 ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-cyan-500 rounded-full" />
              <span className="font-semibold text-sm">预览 compose.yml</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleCopy}
                disabled={enabledCount === 0}
              >
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "已复制" : "复制"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleDownload}
                disabled={enabledCount === 0}
              >
                <Download className="h-3 w-3" />
                下载
              </Button>
            </div>
          </div>

          <Card className="flex-1 overflow-hidden">
            <div className="bg-zinc-950 border border-zinc-800 rounded-md h-full min-h-[400px] max-h-[680px] overflow-auto">
              <pre className="p-4 text-xs font-mono leading-relaxed text-zinc-300 whitespace-pre">
                {yaml}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── 服务配置面板 ─────────────────────────────────────────────────────────────

interface ServiceConfigPanelProps {
  service: ServiceConfig;
  onToggleExpand: () => void;
  onEnvChange: (key: string, value: string) => void;
  onPortChange: (idx: number, field: "hostPort" | "containerPort", value: string) => void;
}

function ServiceConfigPanel({
  service,
  onToggleExpand,
  onEnvChange,
  onPortChange,
}: ServiceConfigPanelProps) {
  const Icon = service.icon;

  return (
    <Card className="overflow-hidden border-zinc-800">
      {/* 头部 */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/60 transition-colors text-left"
      >
        {service.expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        )}
        <Icon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span className="text-sm font-medium text-zinc-200 flex-1">{service.name}</span>
        <span className="text-[10px] text-zinc-600 font-mono">{service.image}:{service.tag}</span>
      </button>

      {service.expanded && (
        <div className="px-4 py-3 space-y-4 bg-zinc-950/40">
          {/* 端口配置 */}
          {service.ports.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">
                端口映射
              </Label>
              {service.ports.map((port, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-20 shrink-0">{port.label}</span>
                  <Input
                    value={port.hostPort}
                    onChange={(e) => onPortChange(idx, "hostPort", e.target.value)}
                    placeholder="宿主机"
                    className="h-7 text-xs font-mono flex-1"
                    maxLength={5}
                  />
                  <span className="text-xs text-zinc-600">:</span>
                  <Input
                    value={port.containerPort}
                    onChange={(e) => onPortChange(idx, "containerPort", e.target.value)}
                    placeholder="容器"
                    className="h-7 text-xs font-mono flex-1"
                    maxLength={5}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 环境变量 */}
          {service.envFields.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">
                环境变量
              </Label>
              {service.envFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500 font-mono w-40 shrink-0 truncate" title={field.key}>
                      {field.key}
                    </span>
                    <Input
                      value={service.envValues[field.key] ?? ""}
                      onChange={(e) => onEnvChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="h-7 text-xs font-mono flex-1"
                    />
                    {field.required && (
                      <span className="text-[10px] text-red-400 shrink-0">*</span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-600 pl-42">{field.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* 挂载卷 */}
          {service.volumes.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">
                数据卷
              </Label>
              {service.volumes.map((v, i) => (
                <div key={i} className="text-[11px] font-mono text-zinc-500 bg-zinc-900/50 rounded px-2 py-1">
                  {v}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
