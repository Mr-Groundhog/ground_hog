import { ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AiGrid({ tools }: { tools: any[] }) {
  if (tools.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px] text-zinc-500">
        暂无相关工具
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <div 
          key={tool.id} 
          className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-950/50 hover:border-cyan-500/30 transition-colors overflow-hidden"
        >
          {/* Card Header with Icon and Title */}
          <div className="p-5 flex items-start gap-4">
            <div className="shrink-0 h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
              {tool.icon ? (
                <img src={tool.icon} alt={tool.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-zinc-600">{tool.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-zinc-100 truncate pr-2 group-hover:text-cyan-400 transition-colors">
                  {tool.name}
                </h3>
                <div className="flex items-center text-amber-400 text-xs">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  4.9
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-zinc-900 text-zinc-400 border-zinc-800">
                  {tool.category}
                </Badge>
                {tool.tags?.split(/[,，]/).slice(0, 2).map((tag: string, i: number) => (
                  <span key={i} className="text-[10px] text-zinc-500 flex items-center">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-5 pb-5 flex-1">
            <p className="text-sm text-zinc-400 line-clamp-2 h-10 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="px-5 pb-5 mt-auto">
            <Button 
              asChild
              className="w-full bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all group/btn"
            >
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                访问网站 <ExternalLink className="ml-2 h-3 w-3 opacity-50 group-hover/btn:opacity-100" />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
