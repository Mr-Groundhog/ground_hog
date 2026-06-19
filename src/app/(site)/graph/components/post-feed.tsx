"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Eye, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPosts } from "@/app/dashboard/posts/actions";
import { TechLoaderMini } from "@/components/common/loading";

interface PostFeedProps {
  initialPosts: any[];
  initialPage: number;
  totalPages: number;
  categoryId?: string;
}

export function PostFeed({ initialPosts, initialPage, totalPages: initialTotalPages, categoryId }: PostFeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialPage < initialTotalPages);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView();

  useEffect(() => {
    setPosts(initialPosts);
    setPage(initialPage);
    setHasMore(initialPage < initialTotalPages);
  }, [initialPosts, initialPage, initialTotalPages]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const { data, totalPages } = await getPosts(nextPage, 10, "", categoryId);
      setPosts((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(nextPage < totalPages);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/graph/${post.slug}`}
            className="group block h-full"
          >
            <Card className="h-full flex flex-col gap-0 border-zinc-800 bg-zinc-950/70 py-0 shadow-[0_0_30px_-18px_rgba(34,211,238,0.4)] transition-all duration-300 hover:border-cyan-500/50 hover:bg-zinc-900/80">
              <CardHeader className="border-b border-zinc-800 p-4 pb-3">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-cyan-400">
                  <span 
                    className="truncate max-w-[80px] cursor-pointer hover:underline hover:text-cyan-300"
                    onClick={(e) => {
                      e.preventDefault();
                      if (post.category?.id) router.push(`/graph?categoryId=${post.category.id}`);
                    }}
                  >
                    {post.category?.name || "未分类"}
                  </span>
                  <span className="text-zinc-600">ID: {post.id.slice(-4)}</span>
                </div>
                <CardTitle className="text-base font-semibold text-white line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="mt-2 text-xs text-zinc-400 line-clamp-2">
                  {post.excerpt || post.content.slice(0, 100)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-4 pt-3">
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span suppressHydrationWarning>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.readTime || "3 min read"}</span>
                </div>
              </CardContent>
              <CardFooter className="mt-auto flex items-center justify-between border-t border-zinc-800 p-3 px-4">
                <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3 text-cyan-400" />
                    {post._count?.interactions || 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-cyan-400" />
                    {post._count?.comments || 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3 text-cyan-400" />
                    {post.viewCount}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/30"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      
      {hasMore && (
        <div ref={ref} className="mt-8 flex justify-center py-4">
          {loading && <TechLoaderMini />}
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="mt-8 text-center text-xs text-zinc-500">
          --- END OF FEED ---
        </div>
      )}
    </>
  );
}
