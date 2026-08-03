"use client";

import * as React from "react";
import {
  Search,
  Copy,
  Check,
  Loader2,
  HardDrive,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface PanItem {
  url: string;
  password: string;
  note: string;
  images?: string[];
  datetime: string;
}

interface PanSearchResponse {
  code: number;
  message: string;
  data: {
    total: number;
    merged_by_type: Record<string, PanItem[]>;
  } | null;
}

// 网盘类型的中文标签（完整支持文档定义的类型）
const CLOUD_TYPE_LABELS: Record<string, string> = {
  baidu: "百度网盘",
  aliyun: "阿里云盘",
  quark: "夸克网盘",
  guangya: "光亚云",
  tianyi: "天翼云盘",
  uc: "UC 网盘",
  mobile: "移动云盘",
  "115": "115 网盘",
  pikpak: "PikPak",
  xunlei: "迅雷云盘",
  "123": "123 网盘",
  magnet: "磁力链接",
  ed2k: "电驴链接",
};

// 未登录时仅允许选择的默认四个网盘类型
const DEFAULT_CLOUD_TYPES = ["baidu", "123", "quark", "aliyun"];

export function PanSearch({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [keyword, setKeyword] = React.useState("");
  const [cloudTypes, setCloudTypes] = React.useState<string[]>([
    "baidu",
    "123",
    "quark",
    "aliyun",
  ]);
  const [activeType, setActiveType] = React.useState<string>("");
  const [pendingUrl, setPendingUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<PanSearchResponse | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  // 虚拟滚动相关
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportH, setViewportH] = React.useState(0);
  // 卡片高度(h-60=240) + 间距(gap 16) = 每行 256px
  const ROW_HEIGHT = 256;
  const OVERSCAN = 2;

  // 根据当前视口宽度计算列数（与 grid 断点一致）
  const getColumns = React.useCallback(() => {
    if (typeof window === "undefined") return 1;
    const w = window.innerWidth;
    if (w >= 1280) return 4; // xl
    if (w >= 1024) return 3; // lg
    if (w >= 640) return 2; // sm
    return 1;
  }, []);

  const [columns, setColumns] = React.useState(1);
  React.useEffect(() => {
    const update = () => {
      setColumns(getColumns());
      if (scrollRef.current) {
        setViewportH(scrollRef.current.clientHeight);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [getColumns]);

  const handleSearch = async () => {
    const kw = keyword.trim();
    if (!kw) {
      toast.error("请输入搜索关键词");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ kw, res: "merge" });
      // 未登录时强制只用默认四个网盘类型，避免越权搜索
      const effectiveTypes = isLoggedIn
        ? cloudTypes
        : cloudTypes.filter((t) => DEFAULT_CLOUD_TYPES.includes(t));
      if (effectiveTypes.length > 0) {
        params.set("cloud_types", effectiveTypes.join(","));
      }
      const res = await fetch(`/api/pan-search?${params.toString()}`);
      const json: PanSearchResponse = await res.json();

      if (json.code === 0 && json.data) {
        setResult(json);
        const first = Object.keys(json.data.merged_by_type ?? {}).find(
          (k) => (json.data!.merged_by_type[k]?.length ?? 0) > 0
        );
        setActiveType(first ?? "");
      } else {
        setResult(json);
        toast.error(json.message || "搜索失败，请稍后重试");
      }
    } catch {
      toast.error("请求失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSearch();
    }
  };

  const handleCopy = async (value: string) => {
    if (!value) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement("input");
        input.value = value;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(value);
      toast("复制成功", { description: value });
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast("复制失败", { description: "请手动选择并复制" });
    }
  };

  const allTypes = result?.data?.merged_by_type
    ? Object.keys(result.data.merged_by_type)
    : [];
  const activeItems =
    result?.data?.merged_by_type && activeType
      ? result.data.merged_by_type[activeType] ?? []
      : [];

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 max-w-5xl">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-1 sm:mb-2">
          网盘搜索
        </h1>
        <p className="text-muted-foreground text-center text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
          聚合夸克、百度、UC、迅雷等多网盘资源搜索，一键复制分享链接与提取码
        </p>
      </div>

      {/* 搜索栏 */}
      <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入搜索关键词，如：九门"
              className="pl-9 h-10 sm:h-11"
            />
          </div>
          <div className="w-full sm:w-44 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 w-full justify-between font-normal"
                >
                  {cloudTypes.length === 0
                    ? "全部网盘"
                    : cloudTypes.length === 4 &&
                      ["baidu", "123", "quark", "aliyun"].every((t) =>
                        cloudTypes.includes(t)
                      )
                    ? "百度/123/夸克/阿里"
                    : `已选 ${cloudTypes.length} 个`}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-72 overflow-y-auto">
                <DropdownMenuLabel>
                  {isLoggedIn ? "选择网盘类型（可多选）" : "网盘类型（登录后解锁更多）"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(CLOUD_TYPE_LABELS)
                  .filter(([key]) =>
                    isLoggedIn ? true : DEFAULT_CLOUD_TYPES.includes(key)
                  )
                  .map(([key, label]) => {
                  const checked = cloudTypes.includes(key);
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/60 rounded-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          setCloudTypes((prev) =>
                            v
                              ? [...prev, key]
                              : prev.filter((t) => t !== key)
                          );
                        }}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="h-10 sm:h-11 px-5 w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Search className="h-4 w-4 mr-1" />
            )}
            搜索
          </Button>
        </div>
      </Card>

      {/* 结果区域 */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          正在搜索网盘资源...
        </div>
      )}

      {!loading && result && allTypes.length > 0 && (
        <div className="space-y-4 sm:space-y-5">
          <div className="text-xs sm:text-sm text-muted-foreground text-center">
            共找到约 <span className="text-blue-400 font-mono">{result.data?.total ?? 0}</span> 条结果
          </div>
          {/* 网盘类型标签栏 */}
          <div className="flex flex-wrap gap-2 justify-center">
            {allTypes.map((type) => {
              const count = result.data!.merged_by_type[type]?.length ?? 0;
              const active = type === activeType;
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`group relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm border transition-all duration-200 ${
                    active
                      ? "border-blue-400/60 bg-blue-500/10 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.45)]"
                      : "border-border text-muted-foreground hover:border-blue-400/40 hover:text-blue-200"
                  }`}
                >
                  {CLOUD_TYPE_LABELS[type] ?? type}
                  <span
                    className={`ml-1 font-mono ${
                      active ? "text-blue-300/90" : "text-muted-foreground/60"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 当前标签下的链接列表（虚拟滚动网格） */}
          {activeItems.length > 0 ? (
            <Card className="p-0 overflow-hidden">
              <div
                ref={scrollRef}
                onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                className="max-h-[70vh] overflow-y-auto p-3 sm:p-4"
              >
                {(() => {
                  const cols = columns;
                  const totalRows = Math.ceil(activeItems.length / cols);
                  const startRow = Math.max(
                    0,
                    Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN
                  );
                  const endRow = Math.min(
                    totalRows,
                    Math.ceil((scrollTop + viewportH) / ROW_HEIGHT) + OVERSCAN
                  );
                  const startIdx = startRow * cols;
                  const endIdx = Math.min(activeItems.length, endRow * cols);
                  const visible = activeItems.slice(startIdx, endIdx);

                  return (
                    <div
                      style={{
                        height: totalRows * ROW_HEIGHT,
                        position: "relative",
                      }}
                    >
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 absolute left-0 right-0"
                        style={{ top: startRow * ROW_HEIGHT }}
                      >
                        {visible.map((item, i) => {
                          const idx = startIdx + i;
                          return (
                            <button
                              key={`${activeType}-${idx}`}
                              type="button"
                              onClick={() => setPendingUrl(item.url)}
                              className="group relative flex h-60 flex-col block w-full text-left overflow-hidden rounded-xl border border-blue-500/15 bg-gradient-to-br from-blue-500/[0.04] to-cyan-500/[0.02] transition-all duration-200 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:-translate-y-0.5"
                            >
                              {/* 封面图（剧集图片，images 第一项） */}
                              {item.images && item.images[0] ? (
                                <div className="relative h-32 w-full shrink-0 overflow-hidden border-b border-blue-500/15">
                                  <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-blue-400 to-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity z-10" />
                                  <img
                                    src={item.images[0]}
                                    alt={item.note}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display =
                                        "none";
                                    }}
                                  />
                                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
                                </div>
                              ) : (
                                <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-blue-400 to-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                              )}
                              <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                                <p className="mb-2 line-clamp-3 max-h-[4.5rem] overflow-hidden text-xs sm:text-sm leading-relaxed text-foreground/90">
                                  {item.note}
                                </p>
                                {item.datetime && (
                                  <p className="mt-auto font-mono text-[10px] text-muted-foreground/70">
                                    {new Date(item.datetime).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              该网盘类型暂无结果
            </Card>
          )}
        </div>
      )}

      {!loading && result && allTypes.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          未找到相关网盘资源，换个关键词试试？
        </Card>
      )}

      {/* 跳转确认框 */}
      <Dialog
        open={pendingUrl !== null}
        onOpenChange={(open) => {
          if (!open) setPendingUrl(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认跳转外部链接</DialogTitle>
            <DialogDescription>
              即将离开本站，前往以下网盘资源地址：
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/[0.04] p-3">
            <p className="flex-1 break-all font-mono text-xs text-blue-300/90">
              {pendingUrl}
            </p>
            <button
              type="button"
              onClick={() => pendingUrl && handleCopy(pendingUrl)}
              aria-label="复制链接"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {copied === pendingUrl ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPendingUrl(null)}
            >
              取消
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                if (pendingUrl) {
                  window.open(pendingUrl, "_blank", "noopener,noreferrer");
                }
                setPendingUrl(null);
              }}
            >
              确认跳转
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
