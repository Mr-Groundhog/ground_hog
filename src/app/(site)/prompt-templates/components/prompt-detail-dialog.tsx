"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Copy, Check, Eye, User, MessageCircle, Send, Zap, Download } from "lucide-react";
import { likePromptTemplate, getPromptComments, addPromptComment, incrementViewCount, incrementUseCount } from "../actions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PromptDetailDialogProps {
  template: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTag?: (tag: string) => void;
}

export function PromptDetailDialog({ template, open, onOpenChange, onSelectTag }: PromptDetailDialogProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [useCount, setUseCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (template && open) {
      setLikeCount(template.likeCount || 0);
      setUseCount(template.useCount || 0);
      // 增加浏览次数
      incrementViewCount(template.id);
      // 获取评论
      getPromptComments(template.id).then(setComments);
      // 检查是否已点赞（通过 localStorage）
      const likedKey = `prompt_liked_${template.id}`;
      setLiked(localStorage.getItem(likedKey) === "true");
    }
  }, [template, open]);

  const handleCopy = async () => {
    if (!template) return;
    try {
      // 复制原始 Markdown 文本
      const mdText = template.content;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(mdText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = mdText;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setUseCount(prev => prev + 1);
      incrementUseCount(template.id);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败，请手动选择内容复制");
    }
  };

  const handleDownloadMd = () => {
    if (!template) return;
    // 构建 .md 文件内容：标题 + 空行 + 内容
    const mdContent = `# ${template.title}\n\n${template.content}`;
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("已下载 .md 文件");
  };

  const handleLike = async () => {
    if (!template) return;
    try {
      // 用简单 ID 模拟 IP（实际应该从服务端获取）
      const ip = localStorage.getItem("user_ip") || "anonymous";
      const result = await likePromptTemplate(template.id, ip);
      setLiked(result.liked);
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
      // 记录到 localStorage
      const likedKey = `prompt_liked_${template.id}`;
      localStorage.setItem(likedKey, result.liked ? "true" : "false");
    } catch {
      toast.error("操作失败");
    }
  };

  const handleComment = async () => {
    if (!template || !commentContent.trim()) return;
    setSubmitting(true);
    try {
      await addPromptComment({
        templateId: template.id,
        author: commentAuthor.trim() || "匿名",
        content: commentContent.trim(),
      });
      setCommentContent("");
      // 刷新评论列表
      const updatedComments = await getPromptComments(template.id);
      setComments(updatedComments);
      toast.success("评论成功");
    } catch (error: any) {
      toast.error(error.message || "评论失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagClick = (tag: string) => {
    onOpenChange(false);
    onSelectTag?.(tag);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-zinc-950 border-zinc-800 text-zinc-50 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-zinc-50 flex items-center gap-3">
            {template.title}
            <Badge variant="secondary" className="text-xs bg-zinc-900 text-zinc-400 border-zinc-800">
              {template.category}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          {/* 描述 */}
          <p className="text-sm text-zinc-400 mb-4">{template.description}</p>

          {/* 提示词内容 - Markdown 渲染 */}
          <div className="relative mb-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-code:text-cyan-300 prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-200 prose-a:text-cyan-400">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      if (!inline && match) {
                        return (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: "0.5em 0", borderRadius: "0.375rem", fontSize: "0.8rem" }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        );
                      }
                      return (
                        <code className="bg-zinc-800 text-cyan-300 px-1.5 py-0.5 rounded text-xs" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {template.content}
                </ReactMarkdown>
              </div>
            </div>
            <div className="absolute top-2 right-2 flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white text-xs"
                onClick={handleDownloadMd}
              >
                <Download className="h-3 w-3 mr-1" />
                下载
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white text-xs"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
          </div>

          {/* 标签 */}
          {template.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {template.tags.split(/[,，]/).filter(Boolean).map((tag: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleTagClick(tag.trim())}
                  className="px-2 py-0.5 rounded-md text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                >
                  #{tag.trim()}
                </button>
              ))}
            </div>
          )}

          {/* 元信息 */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6 pb-4 border-b border-zinc-800 flex-wrap">
            {template.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {template.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {template.viewCount || 0} 次浏览
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {useCount} 次使用
            </span>
            <span>
              {new Date(template.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* 点赞按钮 */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              className={liked 
                ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30"
              }
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
              {liked ? "已赞" : "点赞"} ({likeCount})
            </Button>
          </div>

          {/* 评论区 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              评论 ({comments.length})
            </h4>

            {/* 发表评论 */}
            <div className="space-y-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Input
                placeholder="你的昵称（可选）"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="h-8 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 text-xs"
              />
              <div className="flex gap-2">
                <Textarea
                  placeholder="写下你的评论...（最多500字）"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  maxLength={500}
                  className="flex-1 h-16 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 text-sm resize-none"
                />
                <Button
                  size="sm"
                  className="self-end bg-cyan-500 hover:bg-cyan-600 text-white h-8 px-3"
                  onClick={handleComment}
                  disabled={submitting || !commentContent.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-zinc-600 text-right">{commentContent.length}/500</div>
            </div>

            {/* 评论列表 */}
            {comments.length === 0 ? (
              <div className="text-center py-6">
                <MessageCircle className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">暂无评论，来说两句吧~</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.slice(0, 20).map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-300">{comment.author}</span>
                      <span className="text-xs text-zinc-600">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">{comment.content}</p>
                  </div>
                ))}
                {comments.length > 20 && (
                  <p className="text-xs text-zinc-600 text-center pt-2">仅显示最近 20 条评论</p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
