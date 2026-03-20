 
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CalendarDays, Clock, Eye } from "lucide-react";
import { getPostBySlug } from "@/app/dashboard/posts/actions";
import { CommentsWrapper } from "./components/comments-wrapper";
import { InteractionWrapper } from "./components/interaction-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { TechSpinner } from "@/components/common/loading";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

// 生成标题 id 的辅助函数
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

// 自定义 rehype plugin，为标题添加 id
function rehypeCustomSlug() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName.match(/^h[1-6]$/)) {
        const textContent = getTextContent(node);
        if (textContent) {
          node.properties = node.properties || {};
          node.properties.id = slugify(textContent);
        }
      }
    });
  };
}

function getTextContent(node: Element): string {
  let text = "";
  for (const child of node.children) {
    if (child.type === "text") {
      text += child.value;
    } else if (child.type === "element") {
      text += getTextContent(child as Element);
    }
  }
  return text;
}

// 获取标题的辅助函数
function getHeadings(markdown: string) {
  const lines = markdown.split("\n");
  const headings: { id: string; text: string; level: number }[] = [];

  for (const line of lines) {
    const match = /^(#{1,3})\s+(.*)/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/`/g, "").trim();
      const id = slugify(text);
      headings.push({ id, text, level });
    }
  }

  return headings;
}

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headings = getHeadings(post.content);
  
  // 估算阅读时间
  const readTime = Math.ceil(post.content.length / 500) + " 分钟读完";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <div className="text-xs text-zinc-500">
              {post.category?.name || "未分类"}
            </div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl lg:text-4xl">
              {post.title}
            </h1>
            <p className="text-sm text-zinc-400 md:text-base">
              {post.excerpt}
            </p>
            <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-3 md:gap-4 text-xs text-zinc-500 md:text-sm">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4 text-cyan-400" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-cyan-400" />
                {readTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 text-cyan-400" />
                {post.viewCount} 次浏览
              </span>
            </div>
          </div>

          {post.coverImage && (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-48 w-full object-cover md:h-64 lg:h-80"
              />
            </div>
          )}

          <article className="prose prose-invert prose-sm max-w-none prose-pre:rounded-lg prose-pre:bg-zinc-950/80 prose-pre:border prose-pre:border-zinc-800 md:prose-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeCustomSlug]}
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
          <div className="pt-6 md:pt-10">
            <Suspense fallback={
              <div className="flex justify-center py-10">
                <TechSpinner />
              </div>
            }>
              <CommentsWrapper postId={post.id} />
            </Suspense>
          </div>
        </div>

        {/* 右侧边栏 - 移动端隐藏，桌面端显示 */}
        <aside className="hidden lg:block sticky top-24 space-y-6 self-start">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
            <h2 className="mb-4 text-xs font-semibold tracking-[0.18em] text-zinc-500">
              作者信息
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-black overflow-hidden">
                 {post.user.avatar ? (
                    <img src={post.user.avatar} alt={post.user.nickname || post.user.username} className="h-full w-full object-cover" />
                 ) : (
                    (post.user.nickname || post.user.username).slice(0, 2).toUpperCase()
                 )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {post.user.nickname || post.user.username}
                </div>
                <div className="text-xs text-zinc-400">
                  @{post.user.username}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-zinc-400">
              {post.user.bio || "这个人很懒，什么都没写。"}
            </p>
            <button className="mt-4 w-full rounded-md bg-cyan-500 py-2 text-xs font-medium text-black hover:bg-cyan-400">
              关注作者
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
            <h2 className="mb-4 text-xs font-semibold tracking-[0.18em] text-zinc-500">
              目录
            </h2>
            <div className="space-y-2 text-xs text-zinc-400 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
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
        </aside>
      </div>
    </div>
  );
}
