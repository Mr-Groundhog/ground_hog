"use client";

import { useState } from "react";
import { HandHeart, Search, Copy, ExternalLink, KeyRound, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLoadingStore } from "@/store/loading-store";
import { submitStation, queryStation } from "../actions";

interface StationQueryResult {
  found: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  url?: string;
  keyMasked?: string;
  models?: string;
  emailMasked?: string;
  creditCode?: string | null;
  amount?: string | null;
  expireAt?: string | null;
  reviewNote?: string | null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED")
    return <Badge className="bg-cyan-600 hover:bg-cyan-700">已通过</Badge>;
  if (status === "REJECTED")
    return <Badge variant="destructive">已拒绝</Badge>;
  return <Badge variant="secondary">待审核</Badge>;
}

export function StationFab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { startLoading, stopLoading } = useLoadingStore();

  // 提交表单状态
  const [url, setUrl] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [models, setModels] = useState("");
  const [email, setEmail] = useState("");
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
  const [extractCode, setExtractCode] = useState<string | null>(null);
  const [tab, setTab] = useState("submit");

  // 查询状态
  const [queryInput, setQueryInput] = useState("");
  const [queryResult, setQueryResult] = useState<StationQueryResult | null>(null);
  const [queryError, setQueryError] = useState("");

  // 跳转询问
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpUrl, setJumpUrl] = useState("");

  const resetSubmit = () => {
    setUrl("");
    setKeyValue("");
    setModels("");
    setEmail("");
    setSubmitErrors({});
    setExtractCode(null);
  };

  const validateSubmit = () => {
    const errs: Record<string, string> = {};
    if (!url) errs.url = "请输入站点 URL";
    else if (!/^https?:\/\/.+/.test(url)) errs.url = "请输入有效的站点 URL";
    if (!keyValue) errs.keyValue = "请输入站点 key";
    if (!models) errs.models = "请输入支持模型";
    if (!email) errs.email = "请输入邮箱";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "邮箱格式不正确";
    setSubmitErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateSubmit()) return;
    startLoading();
    try {
      const res = await submitStation({ url, keyValue, models, email });
      if (res.success) {
        setExtractCode(res.extractCode);
        toast.success("提交成功，请保存提取码");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "提交失败";
      toast.error(msg);
    } finally {
      stopLoading();
    }
  };

  const handleQuery = async (code?: string) => {
    const target = (code ?? queryInput).trim();
    if (!target) {
      setQueryError("请输入提取码");
      return;
    }
    setQueryError("");
    startLoading();
    try {
      const res = await queryStation(target);
      if (!res.found) {
        setQueryResult(null);
        setQueryError("未找到对应的提交记录，请检查提取码");
        return;
      }
      setQueryResult(res as StationQueryResult);
    } catch (error) {
      toast.error("查询失败");
    } finally {
      stopLoading();
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("已复制额度码");
      // 复制后询问是否跳转公益站
      if (queryResult?.url) {
        setJumpUrl(queryResult.url);
        setJumpOpen(true);
      }
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 rounded-full h-14 w-14 md:h-16 md:w-16 shadow-xl bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer"
        onClick={() => setDialogOpen(true)}
        title="共建公益站"
      >
        <HandHeart className="h-7 w-7 md:h-8 md:w-8" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { resetSubmit(); setQueryResult(null); setQueryInput(""); setQueryError(""); } }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] bg-zinc-950 text-zinc-50 border-zinc-800 p-0 overflow-hidden overflow-y-auto">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2 text-zinc-50">
              <HandHeart className="h-5 w-5 text-cyan-400" />
              共建公益站
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              提交你的公益站点，审核通过后将下发额度码到邮箱。
            </DialogDescription>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab} className="px-6 pb-6">
            <TabsList className="grid grid-cols-2 w-full bg-zinc-900">
              <TabsTrigger value="submit" className="data-[state=active]:bg-zinc-800">
                <HandHeart className="h-4 w-4 mr-1" /> 提交
              </TabsTrigger>
              <TabsTrigger value="query" className="data-[state=active]:bg-zinc-800">
                <Search className="h-4 w-4 mr-1" /> 查询
              </TabsTrigger>
            </TabsList>

            {/* 提交面板 */}
            <TabsContent value="submit">
              {extractCode ? (
                <div className="mt-4 rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-6 text-center">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-cyan-400 mb-3" />
                  <p className="text-sm text-zinc-300 mb-2">提交成功！请妥善保存你的提取码</p>
                  <p className="text-xs text-zinc-500 mb-3">凭此码可随时查询审核进度</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-2xl font-mono font-bold tracking-widest text-cyan-300 bg-zinc-900 px-4 py-2 rounded-md">
                      {extractCode}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={() => { navigator.clipboard.writeText(extractCode); toast.success("提取码已复制"); }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                    <Button
                      className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white"
                      onClick={() => {
                      setTab("query");
                      setQueryResult(null);
                      setQueryError("");
                      if (extractCode) handleQuery(extractCode);
                    }}
                  >
                    去查询审核状态
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">站点 URL <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="https://your-site.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-zinc-50"
                    />
                    {submitErrors.url && <p className="text-xs text-red-400">{submitErrors.url}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">站点 Key <span className="text-red-400">*</span></Label>
                    <Input
                      placeholder="站点 key"
                      value={keyValue}
                      onChange={(e) => setKeyValue(e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-zinc-50"
                    />
                    {submitErrors.keyValue && <p className="text-xs text-red-400">{submitErrors.keyValue}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">支持模型 <span className="text-red-400">*</span></Label>
                    <Textarea
                      placeholder="如：gpt-4o, claude-3.5, gemini-1.5"
                      value={models}
                      onChange={(e) => setModels(e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-zinc-50"
                    />
                    {submitErrors.models && <p className="text-xs text-red-400">{submitErrors.models}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">邮箱（接收额度码） <span className="text-red-400">*</span></Label>
                    <Input
                      type="email"
                      placeholder="contact@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-zinc-50"
                    />
                    {submitErrors.email && <p className="text-xs text-red-400">{submitErrors.email}</p>}
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleSubmit}>
                    提交审核
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* 查询面板 */}
            <TabsContent value="query">
              <div className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入提取码查询"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-zinc-50 font-mono"
                  />
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={handleQuery}>
                    查询
                  </Button>
                </div>
                {queryError && <p className="text-xs text-red-400">{queryError}</p>}

                {queryResult && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">审核状态</span>
                      <StatusBadge status={queryResult.status} />
                    </div>
                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500 shrink-0">站点</span>
                        <a href={queryResult.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all text-right flex items-center gap-1">
                          {queryResult.url} <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500 shrink-0">Key</span>
                        <span className="text-zinc-300 font-mono break-all text-right">{queryResult.keyMasked}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500 shrink-0">模型</span>
                        <span className="text-zinc-300 break-all text-right">{queryResult.models}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500 shrink-0">邮箱</span>
                        <span className="text-zinc-300 break-all text-right">{queryResult.emailMasked}</span>
                      </div>
                    </div>

                    {queryResult.status === "APPROVED" && queryResult.creditCode && (
                      <div className="rounded-md border border-cyan-500/40 bg-cyan-500/10 p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-cyan-300 text-sm font-medium">
                          <KeyRound className="h-4 w-4" /> 你的额度码
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-lg font-mono font-bold tracking-widest text-cyan-300 bg-zinc-950 px-3 py-2 rounded-md break-all">
                            {queryResult.creditCode}
                          </code>
                          <Button size="icon" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => copyCode(queryResult.creditCode)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                          {queryResult.amount != null && <span>额度：<b className="text-zinc-200">${queryResult.amount}</b></span>}
                          {queryResult.expireAt && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(queryResult.expireAt).toLocaleString()}</span>}
                        </div>
                        <p className="text-xs text-amber-400/90">请在失效时间前复制额度码并前往站点兑换。</p>
                      </div>
                    )}

                    {queryResult.status === "REJECTED" && queryResult.reviewNote && (
                      <p className="text-xs text-zinc-400">审核备注：{queryResult.reviewNote}</p>
                    )}
                    {queryResult.status === "PENDING" && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="h-3 w-3" /> 审核中，请耐心等待。</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 复制额度码后询问是否跳转公益站 */}
      <AlertDialog open={jumpOpen} onOpenChange={setJumpOpen}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-50">是否前往公益站兑换？</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 break-all">
              额度码已复制。是否立即打开「{jumpUrl}」进行兑换？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">暂不</AlertDialogCancel>
            <AlertDialogAction
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={() => window.open(jumpUrl, "_blank")}
            >
              前往兑换
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
