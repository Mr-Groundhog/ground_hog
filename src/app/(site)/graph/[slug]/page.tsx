 
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CalendarDays, Clock, Eye } from "lucide-react";
import { getPostBySlug } from "@/app/dashboard/posts/actions";
import { CommentsWrapper } from "./components/comments-wrapper";
import { InteractionWrapper } from "./components/interaction-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { TechSpinner } from "@/components/common/loading";

// 获取标题的辅助函数
function getHeadings(markdown: string) {
  const lines = markdown.split("\n");
  const headings: { id: string; text: string; level: number }[] = [];

  for (const line of lines) {
    const match = /^(#{1,3})\s+(.*)/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/`/g, "").trim();
      const baseId = text
        .toLowerCase()
        .replace(/[^\p{Letter}\p{Number}\u4e00-\u9fa5]+/gu, "-")
        .replace(/^-+|-+$/g, "");
      const id = baseId || "section";
      headings.push({ id, text, level });
    }
  }

  return headings;
}

interface BlogDetailPageProps {
  params: { slug: string };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = params;
  
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headings = getHeadings(post.content);
  
  // 估算阅读时间
  const readTime = Math.ceil(post.content.length / 500) + " 分钟读完";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="text-xs text-zinc-500">
              {post.category?.name || "未分类"}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              {post.title}
            </h1>
            <p className="text-sm text-zinc-400 md:text-base">
              {post.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 md:text-sm">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-cyan-400" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4 text-cyan-400" />
                {readTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-4 w-4 text-cyan-400" />
                {post.viewCount} 次浏览
              </span>
            </div>
          </div>

          {post.coverImage && (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-64 w-full object-cover md:h-80"
              />
            </div>
          )}

          <article className="prose prose-invert max-w-none prose-pre:rounded-lg prose-pre:bg-zinc-950/80 prose-pre:border prose-pre:border-zinc-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  if (!inline && match) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>
          
          {/* 评论区 */}
          <div className="pt-10">
            <Suspense fallback={
              <div className="flex justify-center py-10">
                <TechSpinner />
              </div>
            }>
              <CommentsWrapper postId={post.id} />
            </Suspense>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
            <h2 className="mb-4 text-xs font-semibold tracking-[0.18em] text-zinc-500">
              作者信息
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-black overflow-hidden">
                 {post.author.avatar ? (
                    <img src={post.author.avatar} alt={post.author.nickname || post.author.username} className="h-full w-full object-cover" />
                 ) : (
                    (post.author.nickname || post.author.username).slice(0, 2).toUpperCase()
                 )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {post.author.nickname || post.author.username}
                </div>
                <div className="text-xs text-zinc-400">
                  {/* Title 暂时没有，用 username 代替或留空 */}
                  @{post.author.username}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-zinc-400">
              {post.author.bio || "这个人很懒，什么都没写。"}
            </p>
            <button className="mt-4 w-full rounded-md bg-cyan-500 py-2 text-xs font-medium text-black hover:bg-cyan-400">
              关注作者
            </button>
          </div>

          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
              <h2 className="mb-4 text-xs font-semibold tracking-[0.18em] text-zinc-500">
                目录
              </h2>
              <div className="space-y-2 text-xs text-zinc-400 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {headings.map((heading) => (
                  <a
                    key={heading.id + heading.text}
                    href={`#${heading.id}`}
                    className={`block cursor-pointer rounded px-2 py-1 hover:bg-zinc-900 hover:text-cyan-300 transition-colors ${
                      heading.level === 1 ? "font-semibold text-zinc-200" : ""
                    } ${heading.level === 3 ? "pl-4 text-zinc-500" : ""}`}
                  >
                    {heading.text}
                  </a>
                ))}
                {headings.length === 0 && (
                  <p className="text-zinc-500">暂无可提取的标题</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
              <h2 className="mb-4 text-xs font-semibold tracking-[0.18em] text-zinc-500">
                互动
              </h2>
              <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                <InteractionWrapper postId={post.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
