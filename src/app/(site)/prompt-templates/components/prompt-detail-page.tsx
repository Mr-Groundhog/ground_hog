"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Copy, Check, Eye, User, MessageCircle, Send, Zap, Download } from "lucide-react";
import { likePromptTemplate, getPromptComments, addPromptComment, incrementViewCount, incrementUseCount } from "../actions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PromptDetailPageProps {
  template: any;
}

export function PromptDetailPageClient({ template }: PromptDetailPageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(template.likeCount || 0);
  const [useCount, setUseCount] = useState(template.useCount || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    incrementViewCount(template.id);
    getPromptComments(template.id).then(setComments);
    const likedKey = `prompt_liked_${template.id}`;
    setLiked(localStorage.getItem(likedKey) === "true");
  }, [template.id]);

  const handleCopy = async () => {
    try {
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
      setUseCount((prev: number) => prev + 1);
      incrementUseCount(template.id);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败，请手动选择内容复制");
    }
  };

  const handleDownloadMd = () => {
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
    try {
      const ip = localStorage.getItem("user_ip") || "anonymous";
      const result = await likePromptTemplate(template.id, ip);
      setLiked(result.liked);
      setLikeCount((prev: number) => result.liked ? prev + 1 : prev - 1);
      const likedKey = `prompt_liked_${template.id}`;
      localStorage.setItem(likedKey, result.liked ? "true" : "false");
    } catch {
      toast.error("操作失败");
    }
  };

  const handleComment = async () => {
    if (!commentContent.trim()) return;
    setSubmitting(true);
    try {
      await addPromptComment({
        templateId: template.id,
        author: commentAuthor.trim() || "匿名",
        content: commentContent.trim(),
      });
      setCommentContent("");
      const updatedComments = await getPromptComments(template.id);
      setComments(updatedComments);
      toast.success("评论成功");
    } catch (error: any) {
      toast.error(error.message || "评论失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-zinc-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <Link
          href="/prompt-templates"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          返回模板列表
        </Link>

        {/* 标题区域 */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-50 flex-1">
              {template.title}
            </h1>
            <Badge variant="secondary" className="text-xs bg-zinc-900 text-zinc-400 border-zinc-800 mt-1 shrink-0">
              {template.category}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">{template.description}</p>

          {/* 元信息 */}
          <div className="flex items-center gap-4 text-xs text-zinc-500 mt-4 flex-wrap">
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
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
            {copied ? "已复制" : "复制提示词"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={handleDownloadMd}
          >
            <Download className="h-4 w-4 mr-1.5" />
            下载 .md
          </Button>
          <Button
            variant={liked ? "default" : "outline"}
            size="sm"
            className={liked
              ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30"
            }
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 mr-1.5 ${liked ? "fill-current" : ""}`} />
            {liked ? "已赞" : "点赞"} ({likeCount})
          </Button>
        </div>

        {/* 标签 */}
        {template.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {template.tags.split(/[,，]/).filter(Boolean).map((tag: string, i: number) => (
              <Link
                key={i}
                href={`/prompt-templates?tag=${encodeURIComponent(tag.trim())}`}
                className="px-2.5 py-1 rounded-md text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
              >
                #{tag.trim()}
              </Link>
            ))}
          </div>
        )}

        {/* Markdown 内容 */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-10">
          <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-code:text-cyan-300 prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-200 prose-a:text-cyan-400">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
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

        {/* 评论区 */}
        <div className="space-y-4 border-t border-zinc-800 pt-8">
          <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            评论 ({comments.length})
          </h4>

          {/* 发表评论 */}
          <div className="space-y-2 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
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
                className="flex-1 h-20 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 text-sm resize-none"
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
            <div className="text-center py-8">
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
    </div>
  );
}
