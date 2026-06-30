"use client";

import * as React from "react";
import { toPng } from "html-to-image";
import {
  Download,
  Plus,
  Trash2,
  Layout,
  Cpu,
  BarChart3,
  Share2,
  Loader2,
  Mountain,
  Scissors,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// 数据类型
interface DataItem {
  id: string;
  label: string;
  value: string;
  unit: string;
}

interface CardData {
  title: string;
  subtitle: string;
  description: string;
  watermark: string;
  dataItems: DataItem[];
}

type TemplateType = "minimalist" | "tech" | "datacard" | "social" | "vapor" | "collage" | "blueprint";

const TEMPLATES: { id: TemplateType; name: string; icon: React.ReactNode }[] = [
  { id: "minimalist", name: "瑞士杂志", icon: <Layout className="h-4 w-4" /> },
  { id: "tech", name: "复古终端", icon: <Cpu className="h-4 w-4" /> },
  { id: "datacard", name: "编辑报告", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "social", name: "街头海报", icon: <Share2 className="h-4 w-4" /> },
  { id: "vapor", name: "蒸汽波", icon: <Mountain className="h-4 w-4" /> },
  { id: "collage", name: "报纸拼贴", icon: <Scissors className="h-4 w-4" /> },
  { id: "blueprint", name: "工程蓝图", icon: <Ruler className="h-4 w-4" /> },
];

const defaultData: CardData = {
  title: "2024 年度技术趋势",
  subtitle: "前端开发框架使用率对比",
  description: "基于全球开发者社区调研数据，展示主流框架的市场份额变化。",
  watermark: "一梦五千年",
  dataItems: [
    { id: "1", label: "React", value: "42", unit: "%" },
    { id: "2", label: "Vue", value: "28", unit: "%" },
    { id: "3", label: "Next.js", value: "18", unit: "%" },
    { id: "4", label: "Svelte", value: "12", unit: "%" },
  ],
};

export function InfographicCard() {
  const [cardData, setCardData] = React.useState<CardData>(defaultData);
  const [template, setTemplate] = React.useState<TemplateType>("minimalist");
  const [exporting, setExporting] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  // 添加数据项
  const addDataItem = () => {
    if (cardData.dataItems.length >= 6) {
      toast.error("最多支持 6 组数据");
      return;
    }
    setCardData({
      ...cardData,
      dataItems: [
        ...cardData.dataItems,
        { id: Date.now().toString(), label: "", value: "", unit: "" },
      ],
    });
  };

  // 删除数据项
  const removeDataItem = (id: string) => {
    setCardData({
      ...cardData,
      dataItems: cardData.dataItems.filter((item) => item.id !== id),
    });
  };

  // 更新数据项
  const updateDataItem = (id: string, field: keyof DataItem, value: string) => {
    setCardData({
      ...cardData,
      dataItems: cardData.dataItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  // 导出 PNG
  const handleExport = async (scale: 1 | 2) => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: scale,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `infographic-${template}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(`已导出 ${scale}x 分辨率图片`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 p-4 md:p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">一图胜千言</h1>
          <p className="text-sm text-muted-foreground mt-1">
            输入文字和数据，一键生成精美信息图表卡片
          </p>
        </div>
      </div>

      {/* 模板选择器 */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <Button
            key={t.id}
            variant={template === t.id ? "default" : "outline"}
            size="sm"
            onClick={() => setTemplate(t.id)}
            className="gap-2"
          >
            {t.icon}
            {t.name}
          </Button>
        ))}
      </div>

      {/* 主内容区 */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* 左侧：输入表单 */}
        <Card className="flex-1 p-4 md:p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
          <div className="space-y-2">
            <Label>标题 *</Label>
            <Input
              value={cardData.title}
              onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
              placeholder="输入图表标题..."
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">
              {cardData.title.length}/30
            </p>
          </div>

          <div className="space-y-2">
            <Label>副标题</Label>
            <Input
              value={cardData.subtitle}
              onChange={(e) => setCardData({ ...cardData, subtitle: e.target.value })}
              placeholder="输入副标题（可选）..."
              maxLength={50}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>核心数据</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addDataItem}
                disabled={cardData.dataItems.length >= 6}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                添加
              </Button>
            </div>
            <div className="space-y-2">
              {cardData.dataItems.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <Badge variant="secondary" className="mt-2 shrink-0">
                    {index + 1}
                  </Badge>
                  <Input
                    value={item.label}
                    onChange={(e) => updateDataItem(item.id, "label", e.target.value)}
                    placeholder="标签"
                    className="flex-1"
                  />
                  <Input
                    value={item.value}
                    onChange={(e) => updateDataItem(item.id, "value", e.target.value)}
                    placeholder="数值"
                    className="w-20"
                  />
                  <Input
                    value={item.unit}
                    onChange={(e) => updateDataItem(item.id, "unit", e.target.value)}
                    placeholder="单位"
                    className="w-16"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDataItem(item.id)}
                    disabled={cardData.dataItems.length <= 1}
                    className="shrink-0 h-9 w-9 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>描述正文</Label>
            <Textarea
              value={cardData.description}
              onChange={(e) => setCardData({ ...cardData, description: e.target.value })}
              placeholder="输入描述文字（可选）..."
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {cardData.description.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label>底部水印</Label>
            <Input
              value={cardData.watermark}
              onChange={(e) => setCardData({ ...cardData, watermark: e.target.value })}
              placeholder="输入来源/水印（可选）..."
            />
          </div>
        </Card>

        {/* 右侧：预览区域 */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <Card className="w-full p-4 md:p-6 flex flex-col items-center bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed">
            <div className="mb-4 text-sm text-muted-foreground">实时预览</div>
            <div className="w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-lg">
              <TemplateRenderer template={template} data={cardData} ref={previewRef} />
            </div>
          </Card>

          {/* 导出按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleExport(1)}
              disabled={exporting}
              variant="outline"
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              导出 1x
            </Button>
            <Button onClick={() => handleExport(2)} disabled={exporting}>
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              导出 2x 高清
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 模板渲染组件
interface TemplateRendererProps {
  template: TemplateType;
  data: CardData;
}

const TemplateRenderer = React.forwardRef<HTMLDivElement, TemplateRendererProps>(
  ({ template, data }, ref) => {
    switch (template) {
      case "minimalist":
        return <MinimalistTemplate ref={ref} data={data} />;
      case "tech":
        return <TechTemplate ref={ref} data={data} />;
      case "datacard":
        return <DataCardTemplate ref={ref} data={data} />;
      case "social":
        return <SocialTemplate ref={ref} data={data} />;
      case "vapor":
        return <VaporTemplate ref={ref} data={data} />;
      case "collage":
        return <CollageTemplate ref={ref} data={data} />;
      case "blueprint":
        return <BlueprintTemplate ref={ref} data={data} />;
    }
  }
);
TemplateRenderer.displayName = "TemplateRenderer";

// ========================================
// 模板1: 瑞士杂志 (Swiss Editorial / Kinfolk)
// ========================================
const MinimalistTemplate = React.forwardRef<HTMLDivElement, { data: CardData }>(
  ({ data }, ref) => {
    const firstItem = data.dataItems[0];
    const restItems = data.dataItems.slice(1);
    return (
      <div
        ref={ref}
        className="w-full aspect-[4/3] flex flex-col justify-between relative overflow-hidden"
        style={{
          background: "#f5f0eb",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        {/* 右侧装饰色块 */}
        <div
          className="absolute top-0 right-0 w-[4px] h-full"
          style={{ background: "#c4391d" }}
        />

        <div className="p-7 pr-9 flex flex-col justify-between h-full">
          {/* 顶部: 杂志标签 + 期号 */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <span
                className="text-[9px] tracking-[0.3em] uppercase font-sans block mb-1"
                style={{ color: "#c4391d" }}
              >
                INFOGRAPHIC
              </span>
              <div className="h-[1.5px] w-6" style={{ background: "#1a1a1a" }} />
            </div>
            <span
              className="text-[9px] font-sans tracking-wider"
              style={{ color: "#a39e97" }}
            >
              No.{new Date().getFullYear()}
            </span>
          </div>

          {/* 标题区 */}
          <div className="mb-4">
            <h2
              className="text-[26px] font-bold leading-[1.15] mb-2"
              style={{
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
              }}
            >
              {data.title || "标题"}
            </h2>
            {data.subtitle && (
              <p
                className="text-xs font-sans leading-relaxed"
                style={{ color: "#7a756f", maxWidth: "85%" }}
              >
                {data.subtitle}
              </p>
            )}
          </div>

          {/* 主体区：不对称布局 —— 左侧大数字 + 右侧其余数据 */}
          <div className="flex gap-5 my-2">
            {/* 左侧：强调第一个数据 */}
            {firstItem && (
              <div className="flex flex-col justify-center shrink-0" style={{ width: "40%" }}>
                <div
                  className="text-[48px] font-bold leading-none"
                  style={{
                    color: "#1a1a1a",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {firstItem.value}
                  <span
                    className="text-lg font-normal ml-0.5 align-top"
                    style={{ color: "#a39e97" }}
                  >
                    {firstItem.unit}
                  </span>
                </div>
                <div
                  className="text-[10px] font-sans tracking-[0.15em] uppercase mt-2"
                  style={{ color: "#7a756f" }}
                >
                  {firstItem.label}
                </div>
                <div
                  className="h-px mt-3"
                  style={{ background: "#d5cfc8", width: "60%" }}
                />
              </div>
            )}

            {/* 竖向分隔线 */}
            <div className="w-px self-stretch" style={{ background: "#d5cfc8" }} />

            {/* 右侧：其余数据纵向排列 */}
            <div className="flex-1 flex flex-col justify-center gap-3">
              {restItems.map((item, i) => (
                <div key={i} className="flex items-baseline justify-between">
                  <span
                    className="text-[11px] font-sans"
                    style={{ color: "#7a756f" }}
                  >
                    {item.label}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-lg font-bold"
                      style={{
                        color: "#1a1a1a",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.value}
                    </span>
                    <span
                      className="text-[10px] font-sans"
                      style={{ color: "#a39e97" }}
                    >
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
              {restItems.length === 0 && (
                <div className="text-[10px] font-sans" style={{ color: "#a39e97" }}>
                  添加更多数据以丰富图表
                </div>
              )}
            </div>
          </div>

          {/* 发丝分隔线 */}
          <div className="h-px my-3" style={{ background: "#d5cfc8" }} />

          {/* 描述 */}
          {data.description && (
            <div className="mb-3 flex gap-2">
              {/* 装饰性首字母放大 */}
              <span
                className="text-2xl font-bold leading-none shrink-0"
                style={{ color: "#c4391d", lineHeight: "1" }}
              >
                {data.description.charAt(0)}
              </span>
              <p
                className="text-[11px] font-sans leading-[1.6] line-clamp-2"
                style={{ color: "#5c5852" }}
              >
                {data.description.slice(1)}
              </p>
            </div>
          )}

          {/* 底部水印 */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-sans tracking-wide"
              style={{ color: "#a39e97" }}
            >
              {data.watermark}
            </span>
            <div className="flex items-center gap-3">
              <div className="h-px w-6" style={{ background: "#d5cfc8" }} />
              <span
                className="text-[9px] font-sans tracking-[0.15em]"
                style={{ color: "#a39e97" }}
              >
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                }).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
MinimalistTemplate.displayName = "MinimalistTemplate";

// ========================================
// 模板2: 复古终端 (Retro Terminal CRT)
// ========================================
const TechTemplate = React.forwardRef<HTMLDivElement, { data: CardData }>(
  ({ data }, ref) => {
    const maxVal = Math.max(
      ...data.dataItems.map((d) => parseFloat(d.value) || 0),
      1
    );
    return (
      <div
        ref={ref}
        className="w-full aspect-[4/3] flex flex-col justify-between relative overflow-hidden"
        style={{
          background: "#0c0c0c",
          fontFamily: "'Courier New', 'Consolas', monospace",
        }}
      >
        {/* CRT 扫描线叠加层 */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
          }}
        />
        {/* CRT 边缘暗角 */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            boxShadow: "inset 0 0 80px rgba(0,0,0,0.6)",
            borderRadius: "8px",
          }}
        />
        {/* 琥珀色辉光底层 */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(255,176,0,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 p-7 flex flex-col justify-between h-full">
          {/* 顶部状态栏 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "#ffb000",
                  boxShadow: "0 0 6px #ffb000, 0 0 12px rgba(255,176,0,0.4)",
                }}
              />
              <span
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ color: "#ffb000" }}
              >
                SYS.ONLINE
              </span>
            </div>
            <span className="text-[10px]" style={{ color: "rgba(255,176,0,0.4)" }}>
              ┌─ REPORT ─┐
            </span>
          </div>

          {/* ASCII 边框标题 */}
          <div className="mb-5">
            <div className="text-[10px] mb-1" style={{ color: "rgba(255,176,0,0.35)" }}>
              ╔══════════════════════════════════╗
            </div>
            <h2
              className="text-xl font-bold leading-tight px-1"
              style={{
                color: "#ffb000",
                textShadow: "0 0 10px rgba(255,176,0,0.5), 0 0 20px rgba(255,176,0,0.2)",
              }}
            >
              {data.title || "标题"}
            </h2>
            {data.subtitle && (
              <div
                className="text-xs mt-1 px-1"
                style={{ color: "rgba(255,176,0,0.55)" }}
              >
                ▸ {data.subtitle}
              </div>
            )}
            <div className="text-[10px] mt-1" style={{ color: "rgba(255,176,0,0.35)" }}>
              ╚══════════════════════════════════╝
            </div>
          </div>

          {/* 数据区 - 水平条形图 */}
          <div className="flex-1 flex flex-col justify-center gap-3 my-3">
            {data.dataItems.map((item, i) => {
              const pct = ((parseFloat(item.value) || 0) / maxVal) * 100;
              return (
                <div key={i}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span
                      className="text-[11px] tracking-wider"
                      style={{ color: "rgba(255,176,0,0.7)" }}
                    >
                      {String(i + 1).padStart(2, "0")}. {item.label}
                    </span>
                    <span
                      className="text-base font-bold"
                      style={{
                        color: "#ffb000",
                        textShadow: "0 0 8px rgba(255,176,0,0.4)",
                      }}
                    >
                      {item.value}
                      <span
                        className="text-[10px] font-normal ml-0.5"
                        style={{ color: "rgba(255,176,0,0.45)" }}
                      >
                        {item.unit}
                      </span>
                    </span>
                  </div>
                  {/* 进度条 */}
                  <div
                    className="h-[6px] rounded-sm overflow-hidden"
                    style={{ background: "rgba(255,176,0,0.08)" }}
                  >
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${pct}%`,
                        background:
                          "linear-gradient(90deg, rgba(255,176,0,0.6) 0%, #ffb000 100%)",
                        boxShadow: "0 0 6px rgba(255,176,0,0.3)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 描述 */}
          {data.description && (
            <div className="mb-3">
              <span className="text-[10px]" style={{ color: "rgba(255,176,0,0.3)" }}>
                // ─────────────────────────
              </span>
              <p
                className="text-[11px] leading-relaxed mt-1 line-clamp-2"
                style={{ color: "rgba(255,176,0,0.45)" }}
              >
                {data.description}
              </p>
            </div>
          )}

          {/* 底部状态栏 */}
          <div
            className="flex items-center justify-between text-[10px] pt-3"
            style={{ borderTop: "1px solid rgba(255,176,0,0.12)" }}
          >
            <span style={{ color: "rgba(255,176,0,0.4)" }}>
              {data.watermark}
            </span>
            <span style={{ color: "rgba(255,176,0,0.25)" }}>
              [{new Date().getFullYear()}] EOF
            </span>
          </div>
        </div>
      </div>
    );
  }
);
TechTemplate.displayName = "TechTemplate";

// ========================================
// 模板3: 编辑报告 (Editorial / Bloomberg)
// ========================================
const DataCardTemplate = React.forwardRef<HTMLDivElement, { data: CardData }>(
  ({ data }, ref) => {
    const maxVal = Math.max(
      ...data.dataItems.map((d) => parseFloat(d.value) || 0),
      1
    );
    const accentColors = ["#b45309", "#0f766e", "#7c3aed", "#be123c", "#0284c7", "#c2410c"];
    return (
      <div
        ref={ref}
        className="w-full aspect-[4/3] flex flex-col justify-between relative overflow-hidden"
        style={{
          background: "#faf7f2",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        {/* 纸张纹理 */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-0 p-7 flex flex-col justify-between h-full">
          {/* 顶部装饰线 + 分类标签 */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[2px] w-8" style={{ background: "#b45309" }} />
              <span
                className="text-[9px] tracking-[0.25em] uppercase font-sans"
                style={{ color: "#b45309" }}
              >
                DATA INSIGHT
              </span>
              <div className="h-px flex-1" style={{ background: "#d4c9b8" }} />
            </div>
            <h2
              className="text-[22px] font-bold leading-[1.2] mb-1"
              style={{ color: "#1c1917" }}
            >
              {data.title || "标题"}
            </h2>
            {data.subtitle && (
              <p
                className="text-xs font-sans leading-relaxed"
                style={{ color: "#78716c" }}
              >
                {data.subtitle}
              </p>
            )}
          </div>

          {/* 分隔线 */}
          <div className="h-px my-3" style={{ background: "#d4c9b8" }} />

          {/* 数据区 - 编辑式横向条形图 */}
          <div className="flex-1 flex flex-col justify-center gap-[10px]">
            {data.dataItems.map((item, i) => {
              const pct = ((parseFloat(item.value) || 0) / maxVal) * 100;
              const accent = accentColors[i % accentColors.length];
              return (
                <div key={i} className="flex items-center gap-3">
                  {/* 标签 */}
                  <div
                    className="text-[11px] font-sans text-right shrink-0"
                    style={{ color: "#57534e", width: "60px" }}
                  >
                    {item.label}
                  </div>
                  {/* 条形图 */}
                  <div className="flex-1 h-5 relative">
                    <div
                      className="absolute inset-y-0 left-0 rounded-sm"
                      style={{
                        width: `${pct}%`,
                        background: accent,
                        opacity: 0.85,
                      }}
                    />
                    {/* 数值叠加在条形图右侧 */}
                    <span
                      className="absolute top-1/2 -translate-y-1/2 text-[11px] font-bold font-sans"
                      style={{
                        left: `calc(${pct}% + 6px)`,
                        color: "#44403c",
                      }}
                    >
                      {item.value}
                      <span
                        className="text-[9px] font-normal ml-0.5"
                        style={{ color: "#a8a29e" }}
                      >
                        {item.unit}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 分隔线 */}
          <div className="h-px my-3" style={{ background: "#d4c9b8" }} />

          {/* 描述 */}
          {data.description && (
            <p
              className="text-[11px] leading-relaxed mb-3 line-clamp-2 italic"
              style={{ color: "#78716c" }}
            >
              "{data.description}"
            </p>
          )}

          {/* 底部 */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-sans tracking-wide"
              style={{ color: "#a8a29e" }}
            >
              {data.watermark}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-px w-4" style={{ background: "#d4c9b8" }} />
              <span
                className="text-[10px] font-sans"
                style={{ color: "#a8a29e" }}
              >
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
DataCardTemplate.displayName = "DataCardTemplate";

// ========================================
// 模板4: 街头海报 (Brutalist Pop / Gen-Z)
// ========================================
const SocialTemplate = React.forwardRef<HTMLDivElement, { data: CardData }>(
  ({ data }, ref) => {
    const rotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-3", "rotate-3"];
    return (
      <div
        ref={ref}
        className="w-full aspect-[4/3] flex flex-col justify-between relative overflow-hidden"
        style={{
          background: "#111111",
          fontFamily: "'Arial Black', 'Impact', sans-serif",
        }}
      >
        {/* 噪点纹理 */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.35]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            mixBlendMode: "overlay",
          }}
        />

        {/* 左上角装饰箭头 */}
        <div
          className="absolute top-5 left-5 z-20 text-[10px] font-mono"
          style={{ color: "#c8ff00" }}
        >
          ▲
        </div>
        {/* 右下角装饰箭头 */}
        <div
          className="absolute bottom-5 right-5 z-20 text-[10px] font-mono"
          style={{ color: "rgba(200,255,0,0.3)" }}
        >
          ▼
        </div>

        <div className="relative z-0 p-7 flex flex-col justify-between h-full">
          {/* 头部 */}
          <div>
            {/* 标签条 */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[9px] font-mono tracking-[0.2em] uppercase px-2 py-0.5"
                style={{
                  background: "#c8ff00",
                  color: "#111",
                }}
              >
                SNAPSHOT
              </span>
              <span
                className="text-[9px] font-mono"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                }).toUpperCase()}
              </span>
            </div>
            <h2
              className="text-[28px] font-black leading-[1.05] uppercase"
              style={{
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              {data.title || "标题"}
            </h2>
            {data.subtitle && (
              <p
                className="text-xs font-normal mt-2 font-mono"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {data.subtitle}
              </p>
            )}
          </div>

          {/* 数据区：贴纸式网格 */}
          <div className="my-4 grid grid-cols-2 gap-3">
            {data.dataItems.map((item, i) => (
              <div
                key={i}
                className={`relative p-3 ${rotations[i % rotations.length]}`}
                style={{
                  background:
                    i === 0
                      ? "#c8ff00"
                      : "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${
                    i === 0 ? "#c8ff00" : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                {/* 编号 */}
                <div
                  className="absolute -top-2 -left-1 text-[8px] font-mono font-bold px-1"
                  style={{
                    background: i === 0 ? "#111" : "#c8ff00",
                    color: i === 0 ? "#c8ff00" : "#111",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  className="text-3xl font-black leading-none"
                  style={{
                    color: i === 0 ? "#111" : "#fff",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.value}
                  <span
                    className="text-xs font-normal ml-0.5"
                    style={{
                      color: i === 0 ? "rgba(17,17,17,0.5)" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {item.unit}
                  </span>
                </div>
                <div
                  className="text-[10px] font-mono mt-1 uppercase tracking-wider"
                  style={{
                    color: i === 0 ? "rgba(17,17,17,0.6)" : "rgba(200,255,0,0.7)",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* 描述 */}
          {data.description && (
            <p
              className="text-[11px] font-mono leading-relaxed mb-3 line-clamp-2"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {data.description}
            </p>
          )}

          {/* 底部 */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-mono tracking-wider"
              style={{ color: "rgba(200,255,0,0.5)" }}
            >
              @{data.watermark}
            </span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1"
                  style={{
                    background:
                      i < 3 ? "#c8ff00" : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
SocialTemplate.displayName = "SocialTemplate";

// ========================================
// 模板5: 蒸汽波 — 现代仪表盘 (Modern Dashboard)
// ========================================
const VaporTemplate = React.forwardRef<HTMLDivElement, { data: CardData }>(
  ({ data }, ref) => {
    const maxVal = Math.max(
      ...data.dataItems.map((d) => parseFloat(d.value) || 0), 1
    );
    const ringColors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    const R = 28;
    const C = 2 * Math.PI * R;
    return (
      <div
        ref={ref}
        className="w-full aspect-[4/3] relative overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(160deg, #f8fafc 0%, #eef2f7 40%, #e8edf5 100%)",
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* 右上角装饰大圆 */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />

        {/* 顶部标题栏 */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-[8px] tracking-[0.25em] uppercase font-semibold" style={{ color: "#10b981" }}>DASHBOARD</span>
            </div>
            <h2 className="text-[20px] font-extrabold leading-tight" style={{ color: "#0f172a", letterSpacing: "-0.02em" }}>
              {data.title || "标题"}
            </h2>
            {data.subtitle && (
              <p className="text-[9px] mt-1" style={{ color: "#94a3b8" }}>{data.subtitle}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[7px] tracking-wider" style={{ color: "#cbd5e1" }}>{new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()}</span>
          </div>
        </div>

        {/* 圆环数据区 */}
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="grid gap-4" style={{ gridTemplateColumns: data.dataItems.length <= 2 ? "1fr 1fr" : "repeat(2, 1fr)", maxWidth: "90%" }}>
            {data.dataItems.map((item, i) => {
              const pct = ((parseFloat(item.value) || 0) / maxVal) * 100;
              const offset = C - (C * pct) / 100;
              const color = ringColors[i % ringColors.length];
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r={R} fill="none" stroke="#e2e8f0" strokeWidth="5" />
                    <circle
                      cx="36" cy="36" r={R} fill="none"
                      stroke={color} strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={C} strokeDashoffset={offset}
                      transform="rotate(-90 36 36)"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                    <text x="36" y="33" textAnchor="middle" dominantBaseline="central"
                      style={{ fontSize: "16px", fontWeight: 800, fill: "#0f172a" }}>
                      {item.value}
                    </text>
                    <text x="36" y="46" textAnchor="middle" dominantBaseline="central"
                      style={{ fontSize: "7px", fill: "#94a3b8", fontFamily: "sans-serif" }}>
                      {item.unit}
                    </text>
                  </svg>
                  <span className="text-[9px] font-semibold" style={{ color: "#475569" }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部 */}
        <div className="px-6 pb-4 pt-2 flex items-center justify-between" style={{ borderTop: "1px solid #e2e8f0" }}>
          {data.description ? (
            <p className="text-[8px] leading-snug line-clamp-1 flex-1 mr-3" style={{ color: "#94a3b8" }}>{data.description}</p>
          ) : <div className="flex-1" />}
          <span className="text-[8px] font-semibold shrink-0" style={{ color: "#10b981" }}>{data.watermark}</span>
        </div>
      </div>
    );
  }
);
VaporTemplate.displayName = "VaporTemplate";

// ========================================
// 模板6: 报纸拼贴 — 杂志编辑风 (Editorial Magazine)
// ========================================
const CollageTemplate = React.forwardRef<HTMLDivElement, { data: CardData }>(
  ({ data }, ref) => {
    const cardColors = ["#e85d4a", "#2d6a4f", "#e9c46a", "#264653", "#e76f51", "#457b9d"];
    return (
      <div
        ref={ref}
        className="w-full aspect-[4/3] relative overflow-hidden flex flex-col"
        style={{
          background: "#fdf8f3",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        {/* 左侧装饰竖条 */}
        <div className="absolute top-0 left-0 w-[5px] h-full" style={{ background: "#e85d4a" }} />

        {/* 顶部标题区 */}
        <div className="px-6 pl-8 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] tracking-[0.3em] uppercase font-sans font-bold" style={{ color: "#e85d4a" }}>FEATURE</span>
            <div className="h-px flex-1" style={{ background: "#e8ddd0" }} />
            <span className="text-[7px] font-sans" style={{ color: "#c4b8a8" }}>No.{new Date().getFullYear()}</span>
          </div>
          <h2 className="text-[26px] font-black leading-[1.08]" style={{ color: "#1a1612", letterSpacing: "-0.025em" }}>
            {data.title || "标题"}
          </h2>
          {data.subtitle && (
            <p className="text-[10px] mt-1.5 font-sans italic" style={{ color: "#8a7e72" }}>{data.subtitle}</p>
          )}
        </div>

        {/* 数据卡片网格 */}
        <div className="flex-1 px-5 pl-7 pb-2">
          <div className="grid grid-cols-2 gap-2.5 h-full" style={{ alignContent: "center" }}>
            {data.dataItems.map((item, i) => {
              const bg = cardColors[i % cardColors.length];
              const isLight = i % 3 === 2; // 黄色系用深色字
              return (
                <div
                  key={i}
                  className="relative p-3 flex flex-col justify-between overflow-hidden"
                  style={{
                    background: bg,
                    borderRadius: "4px",
                    minHeight: "52px",
                  }}
                >
                  {/* 角落大数字装饰（半透明） */}
                  <span
                    className="absolute -bottom-2 -right-1 text-[40px] font-black leading-none select-none"
                    style={{ color: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)", pointerEvents: "none" }}
                  >
                    {item.value}
                  </span>
                  <div className="relative z-10">
                    <div
                      className="text-[22px] font-black leading-none"
                      style={{ color: isLight ? "#1a1612" : "#fff" }}
                    >
                      {item.value}
                      <span className="text-[10px] font-normal ml-0.5" style={{ color: isLight ? "rgba(26,22,18,0.5)" : "rgba(255,255,255,0.6)" }}>
                        {item.unit}
                      </span>
                    </div>
                    <div
                      className="text-[9px] font-sans mt-1 font-medium"
                      style={{ color: isLight ? "rgba(26,22,18,0.65)" : "rgba(255,255,255,0.75)" }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部 */}
        <div className="px-6 pl-8 pb-4 pt-2 flex items-end justify-between" style={{ borderTop: "1px solid #e8ddd0" }}>
          {data.description ? (
            <p className="text-[9px] font-sans leading-snug line-clamp-2 flex-1 mr-3" style={{ color: "#8a7e72" }}>
              <span className="text-[14px] font-bold float-left mr-1 leading-none" style={{ color: "#e85d4a" }}>{data.description.charAt(0)}</span>
              {data.description.slice(1)}
            </p>
          ) : <div className="flex-1" />}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-px w-4" style={{ background: "#e8ddd0" }} />
            <span className="text-[8px] font-sans tracking-wider" style={{ color: "#c4b8a8" }}>{data.watermark}</span>
          </div>
        </div>
      </div>
    );
  }
);
CollageTemplate.displayName = "CollageTemplate";

// ========================================
// 模板7: 工程蓝图 — HUD 科技面板 (Heads-Up Display)
// ========================================
const BlueprintTemplate = React.forwardRef<HTMLDivElement, { data: CardData }>(
  ({ data }, ref) => {
    const maxVal = Math.max(
      ...data.dataItems.map((d) => parseFloat(d.value) || 0), 1
    );
    const CYAN = "#22d3ee";
    const GRID = "rgba(34,211,238,0.06)";
    const DIM = "rgba(34,211,238,0.35)";
    const BORDER = "rgba(34,211,238,0.15)";
    return (
      <div
        ref={ref}
        className="w-full aspect-[4/3] relative overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(170deg, #0c1222 0%, #0f172a 50%, #0c1222 100%)",
          fontFamily: "'Consolas', 'Courier New', monospace",
        }}
      >
        {/* 网格背景 */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }} />
        {/* 中心十字准星 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-px h-10" style={{ background: "rgba(34,211,238,0.08)" }} />
          <div className="w-10 h-px -mt-5 -ml-5" style={{ background: "rgba(34,211,238,0.08)" }} />
        </div>

        {/* 四角括号装饰 */}
        {[
          { top: 8, left: 8, bTop: true, bLeft: true },
          { top: 8, right: 8, bTop: true, bRight: true },
          { bottom: 8, left: 8, bBottom: true, bLeft: true },
          { bottom: 8, right: 8, bBottom: true, bRight: true },
        ].map((pos, i) => (
          <div key={i} className="absolute w-4 h-4" style={{
            ...Object.fromEntries(Object.entries(pos).filter(([k]) => k !== "bTop" && k !== "bBottom" && k !== "bLeft" && k !== "bRight").map(([k,v]) => [k, `${v}px`])),
            borderTop: pos.bTop ? `1.5px solid ${CYAN}` : "none",
            borderBottom: pos.bBottom ? `1.5px solid ${CYAN}` : "none",
            borderLeft: pos.bLeft ? `1.5px solid ${CYAN}` : "none",
            borderRight: pos.bRight ? `1.5px solid ${CYAN}` : "none",
            opacity: 0.4,
          }} />
        ))}

        {/* 顶部状态栏 */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: CYAN, boxShadow: `0 0 6px ${CYAN}` }} />
            <span className="text-[8px] tracking-[0.25em] uppercase" style={{ color: CYAN }}>ACTIVE</span>
          </div>
          <span className="text-[7px]" style={{ color: DIM }}>SYS.{new Date().getFullYear()}
          </span>
        </div>

        {/* 标题区 */}
        <div className="relative z-10 px-5 pt-3 pb-2">
          <h2 className="text-[19px] font-bold uppercase tracking-wide leading-tight" style={{ color: "#e2e8f0", letterSpacing: "0.08em" }}>
            {data.title || "标题"}
          </h2>
          {data.subtitle && (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-3" style={{ background: CYAN, opacity: 0.5 }} />
              <span className="text-[8px]" style={{ color: DIM }}>{data.subtitle}</span>
            </div>
          )}
        </div>

        {/* 数据指标网格 */}
        <div className="relative z-10 flex-1 px-5 py-2 flex items-center">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
            {data.dataItems.map((item, i) => {
              const pct = ((parseFloat(item.value) || 0) / maxVal) * 100;
              return (
                <div key={i} className="relative pl-3" style={{ borderLeft: `2px solid ${i === 0 ? CYAN : BORDER}` }}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[24px] font-bold leading-none" style={{
                      color: i === 0 ? CYAN : "#e2e8f0",
                      textShadow: i === 0 ? `0 0 20px ${CYAN}40` : "none",
                    }}>
                      {item.value}
                    </span>
                    <span className="text-[9px]" style={{ color: DIM }}>{item.unit}</span>
                  </div>
                  <div className="text-[8px] mt-0.5 uppercase tracking-wider" style={{ color: DIM }}>{item.label}</div>
                  {/* 微型进度条 */}
                  <div className="h-[2px] mt-1.5 rounded-full overflow-hidden" style={{ background: "rgba(34,211,238,0.08)" }}>
                    <div className="h-full rounded-full" style={{
                      width: `${pct}%`,
                      background: i === 0 ? CYAN : `linear-gradient(90deg, ${BORDER}, ${CYAN}80)`,
                      boxShadow: i === 0 ? `0 0 8px ${CYAN}60` : "none",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部 */}
        <div className="relative z-10 flex items-center justify-between px-5 pb-4 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
          {data.description ? (
            <p className="text-[8px] leading-snug line-clamp-1 flex-1 mr-3" style={{ color: DIM }}>
              &gt; {data.description}
            </p>
          ) : <div className="flex-1" />}
          <div className="flex items-center gap-2 shrink-0">
            {[0,1,2,3].map(i => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ background: i < 2 ? CYAN : "rgba(34,211,238,0.15)" }} />
            ))}
            <span className="text-[8px]" style={{ color: CYAN, opacity: 0.6 }}>{data.watermark}</span>
          </div>
        </div>
      </div>
    );
  }
);
BlueprintTemplate.displayName = "BlueprintTemplate";
