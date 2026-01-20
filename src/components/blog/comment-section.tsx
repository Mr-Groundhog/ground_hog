"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createComment } from "@/app/(site)/graph/actions";
import { toast } from "sonner";
import { Loader2, CornerDownRight } from "lucide-react";

interface CommentUser {
  username: string | null;
  avatar: string | null;
}

interface CommentReply {
  id: string;
  content: string;
  createdAt: string | Date;
  user: CommentUser | null;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: string | Date;
  user: CommentUser | null;
  replies?: CommentReply[];
}

interface CommentSectionProps {
  postId: string;
  comments: CommentItem[];
  currentUser: { id: string } | null;
}

export function CommentSection({
  postId,
  comments: initialComments,
  currentUser,
}: CommentSectionProps) {
  const [comments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      await createComment(postId, content, replyTo || undefined);
      toast.success("指令执行成功：评论已发布");
      setContent("");
      setReplyTo(null);
      window.location.reload();
    } catch {
      toast.error("系统错误：无法提交评论");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <h3 className="text-lg font-bold tracking-widest text-white">评论区</h3>
        <span className="text-xs text-zinc-500">{comments.length} 条评论</span>
      </div>

      {/* Input Buffer */}
      <div className="rounded-lg border border-cyan-500/30 bg-zinc-950/80 p-4 shadow-[0_0_20px_-10px_rgba(34,211,238,0.2)]">
        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
          <span className="flex h-2 w-2 rounded-full bg-red-500" />
          <span className="flex h-2 w-2 rounded-full bg-yellow-500" />
          <span className="flex h-2 w-2 rounded-full bg-green-500" />
          <span className="ml-2 font-mono">评论输入</span>
        </div>
        
        <div className="relative font-mono">
          <div className="absolute left-0 top-2 text-cyan-500">{">"}</div>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? `正在回复评论...` : "写下你的评论..."}
            className="min-h-[100px] border-none bg-transparent pl-6 text-sm text-cyan-100 placeholder:text-zinc-600 focus-visible:ring-0"
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          {replyTo && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300"
              onClick={() => setReplyTo(null)}
            >
              取消
            </Button>
          )}
          <Button
            size="sm"
            className="border border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
            onClick={handleSubmit}
            disabled={!currentUser}
          >
            发表评论
          </Button>
        </div>
        
        {!currentUser && (
          <div className="mt-2 text-center text-xs text-red-400">
            * 访问被拒绝：请登录后发表评论 *
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="group relative">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 rounded border border-zinc-700 bg-zinc-900">
                <AvatarImage src={comment.user?.avatar} />
                <AvatarFallback className="bg-zinc-800 text-cyan-500">
                  {comment.user?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      @{comment.user?.username}
                    </span>
                    <span className="text-[10px] text-zinc-600" suppressHydrationWarning>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-cyan-400"
                    onClick={() => {
                      setReplyTo(comment.id);
                      textareaRef.current?.focus();
                    }}
                  >
                    回复
                  </Button>
                </div>
                <div className="text-sm text-zinc-300 leading-relaxed">
                  {comment.content}
                </div>
                
                {/* Interaction Meta (Mock) */}
                <div className="flex items-center gap-4 text-[10px] text-zinc-600 mt-2">
                   <span className="cursor-pointer hover:text-cyan-500">点赞</span>
                   <span className="cursor-pointer hover:text-red-500">举报</span>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pl-14 space-y-4 relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800" />
                {comment.replies.map((reply: CommentReply) => (
                  <div key={reply.id} className="relative flex gap-4">
                    <CornerDownRight className="absolute -left-8 top-3 h-4 w-4 text-zinc-700" />
                    <Avatar className="h-8 w-8 rounded border border-zinc-800 bg-zinc-900">
                      <AvatarImage src={reply.user?.avatar} />
                      <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400">
                        {reply.user?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-400">
                          @{reply.user?.username}
                        </span>
                        <span className="text-[10px] text-zinc-600" suppressHydrationWarning>
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {reply.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
