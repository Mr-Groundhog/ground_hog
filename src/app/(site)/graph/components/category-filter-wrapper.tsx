import { getCategories } from "@/app/dashboard/categories/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function CategoryFilterWrapper({ currentCategoryId }: { currentCategoryId?: string }) {
  const categories = await getCategories();

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 text-xs md:text-sm">
      <Link href="/graph">
        <Button
          variant={!currentCategoryId ? "default" : "ghost"}
          size="sm"
          className={cn(
            !currentCategoryId 
              ? "bg-cyan-500 text-black hover:bg-cyan-400" 
              : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-cyan-500/60 hover:text-cyan-300"
          )}
        >
          全部
        </Button>
      </Link>
      {categories.map((category) => (
        <Link key={category.id} href={`/graph?categoryId=${category.id}`}>
          <Button
            variant={currentCategoryId === category.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              currentCategoryId === category.id
                ? "bg-cyan-500 text-black hover:bg-cyan-400"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-cyan-500/60 hover:text-cyan-300"
            )}
          >
            {category.name}
          </Button>
        </Link>
      ))}
    </div>
  );
}
